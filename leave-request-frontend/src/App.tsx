import { useEffect, useState } from 'react';
import { api } from './api';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Stack,
  Divider,
  Chip,
  Fade,
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoginForm } from './components/LoginForm';
import { UserProvider, useUser } from './contexts/UserContext';

type LeaveRequest = {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: number; // 0=Pending, 1=Approved, 2=Rejected
};

type CreateLeaveRequest = {
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
};

type Employee = {
  id: number;
  name: string;
  email: string;
  role: string | number;
};

function CreateRequestForm({ onCreated, employeeId }: { onCreated: () => void; employeeId?: number }) {
  const [form, setForm] = useState<CreateLeaveRequest>({
    employeeId: employeeId || 0,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/LeaveRequests', form);
      onCreated();
      setForm({ employeeId: form.employeeId, startDate: '', endDate: '', reason: '' });
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Create Leave Request
      </Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={form.startDate ? new Date(form.startDate) : null}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setForm({ ...form, startDate: newValue.toISOString().split('T')[0] });
                }
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
            <DatePicker
              label="End Date"
              value={form.endDate ? new Date(form.endDate) : null}
              onChange={(newValue: Date | null) => {
                if (newValue) {
                  setForm({ ...form, endDate: newValue.toISOString().split('T')[0] });
                }
              }}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Vacation, sick, etc."
            required
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" disabled={submitting} sx={{ borderRadius: 2 }}>
            {submitting ? 'Submitting…' : 'Create Request'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

function AppContent() {
  const { user, logout, login } = useUser();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(null);

  // Helper function to convert numeric status to string
  const getStatusString = (status: number): 'Pending' | 'Approved' | 'Rejected' => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Pending';
    }
  };

  const isManager = user?.role === 'Manager' || user?.role === 1;

  const loadEmployees = async () => {
    try {
      const res = await api.get<Employee[]>('/employees');
      setEmployees(res.data);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      setEmployees([]);
    }
  };

  const load = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // For managers, load all requests. For employees, load only their own.
      const params = isManager ? {} : { employeeId: user.id };
      const res = await api.get<LeaveRequest[]>('/LeaveRequests', {
        params,
      });
      setRequests(res.data);
    } catch (err: any) {
      setError(err.response?.data || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: number) => {
    if (!user || !isManager) return;
    
    try {
      await api.put(`/LeaveRequests/${id}?managerId=${user.id}`, "Approved", {
        headers: { 'Content-Type': 'application/json' },
      });
      load();
    } catch (err: any) {
      console.error('Error approving request:', err);
      setError(err.response?.data || err.message || 'Failed to approve request');
    }
  };

  const reject = async (id: number) => {
    if (!user || !isManager) return;
    
    try {
      await api.put(`/LeaveRequests/${id}?managerId=${user.id}`, "Rejected", {
        headers: { 'Content-Type': 'application/json' },
      });
      load();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.response?.data || err.message || 'Failed to reject request');
    }
  };

  const cancel = async (id: number) => {
    if (!user) {
      throw new Error('User not logged in');
    }
    
    try {
      await api.delete(`/LeaveRequests/${id}`, { params: { employeeId: user.id } });
      load();
    } catch (err: any) {
      console.error('Error canceling request:', err);
      throw err; // Re-throw to be handled by the calling function
    }
  };

  const permanentlyDelete = async (id: number) => {
    if (!user || !isManager) {
      throw new Error('User is not authorized to delete');
    }
    
    try {
      await api.delete(`/LeaveRequests/${id}/permanent`, { params: { managerId: user.id } });
      load();
    } catch (err: any) {
      console.error('Error deleting request:', err);
      throw err; // Re-throw to be handled by the calling function
    }
  };

  const handleDeleteClick = (request: LeaveRequest) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;
    
    try {
      if (isManager) {
        await permanentlyDelete(requestToDelete.id);
      } else {
        await cancel(requestToDelete.id);
      }
      
      // Only close dialog if successful
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    } catch (error: any) {
      console.error('Delete failed:', error);
      setError(error.response?.data || error.message || 'Failed to delete request');
      // Keep dialog open so user can see the error
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  // Show login form if user is not logged in
  if (!user) {
    return <LoginForm onLogin={login} employees={employees} />;
  }

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Leave Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="inherit">
              Welcome, {user.name} ({user.role})
            </Typography>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 4 },
          fontFamily: 'Poppins, sans-serif',
          background: 'linear-gradient(135deg, #f0f4ff, #ffffff)',
          minHeight: '100vh',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={600}>
          {isManager ? 'Manager Dashboard' : 'Employee Dashboard'}
        </Typography>

        {isManager && <CreateRequestForm onCreated={load} />}
        {!isManager && <CreateRequestForm onCreated={load} employeeId={user.id} />}

        <Divider sx={{ my: 3 }}>
          <Chip label={isManager ? 'All Requests' : 'My Requests'} />
        </Divider>

      {loading && <Typography>Loading…</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3}>
        {requests.map((r) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
            <Fade in timeout={500}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: '0.3s',
                  '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' },
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Request #{r.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Reason: {r.reason}
                </Typography>
                <Chip
                  label={getStatusString(r.status)}
                  color={
                    r.status === 1
                      ? 'success'
                      : r.status === 2
                      ? 'error'
                      : 'warning'
                  }
                  sx={{ mt: 1 }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1}>
                    {isManager && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          disabled={r.status === 1}
                          onClick={() => approve(r.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={r.status === 2}
                          onClick={() => reject(r.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {!isManager && (
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        disabled={r.status !== 0}
                        onClick={() => cancel(r.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                  
                  {/* Delete button */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(r)}
                    sx={{ 
                      opacity: 1,
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      '&:hover': { 
                        opacity: 1,
                        backgroundColor: 'rgba(244, 67, 54, 0.2)'
                      },
                      border: '1px solid #f44336'
                    }}
                    title={isManager ? "Permanently delete request" : "Delete request (only pending)"}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            </Fade>
          </Grid>
        ))}
        {!loading && !requests.length && (
          <Grid size={{ xs: 12 }}>
            <Typography>No requests yet.</Typography>
          </Grid>
        )}
      </Grid>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {isManager ? 'Permanently Delete Request' : 'Delete Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {isManager 
              ? 'Are you sure you want to permanently delete this leave request? This action cannot be undone.'
              : 'Are you sure you want to delete this pending request? This action cannot be undone.'
            }
            {requestToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">Request Details:</Typography>
                <Typography variant="body2">ID: {requestToDelete.id}</Typography>
                <Typography variant="body2">Dates: {new Date(requestToDelete.startDate).toLocaleDateString()} - {new Date(requestToDelete.endDate).toLocaleDateString()}</Typography>
                <Typography variant="body2">Reason: {requestToDelete.reason}</Typography>
                <Typography variant="body2">Status: {getStatusString(requestToDelete.status)}</Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}