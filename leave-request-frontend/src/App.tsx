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
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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

function CreateRequestForm({ onCreated, employeeId }: { onCreated: () => void; employeeId: number }) {
  const [form, setForm] = useState<CreateLeaveRequest>({
    employeeId,
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
      setForm({ employeeId, startDate: '', endDate: '', reason: '' });
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

export default function App() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'employee' | 'manager'>('employee');

  // Helper function to convert numeric status to string
  const getStatusString = (status: number): 'Pending' | 'Approved' | 'Rejected' => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Approved';
      case 2: return 'Rejected';
      default: return 'Pending';
    }
  };

  const managerId = 2; // Morgan Manager (second created)
  const employeeId = 1; // Alex Employee (first created)
  const currentId = role === 'manager' ? managerId : employeeId;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // For managers, load all requests. For employees, load only their own.
      const params = role === 'manager' ? {} : { employeeId: currentId };
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
    try {
      await api.put(`/LeaveRequests/${id}?managerId=${managerId}`, "Approved", {
        headers: { 'Content-Type': 'application/json' },
      });
      load();
    } catch (err: any) {
      console.error('Error approving request:', err);
      setError(err.response?.data || err.message || 'Failed to approve request');
    }
  };

  const reject = async (id: number) => {
    try {
      await api.put(`/LeaveRequests/${id}?managerId=${managerId}`, "Rejected", {
        headers: { 'Content-Type': 'application/json' },
      });
      load();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.response?.data || err.message || 'Failed to reject request');
    }
  };

  const cancel = async (id: number) => {
    try {
      await api.delete(`/LeaveRequests/${id}`, { params: { employeeId } });
      load();
    } catch (err: any) {
      console.error('Error canceling request:', err);
      setError(err.response?.data || err.message || 'Failed to cancel request');
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  return (
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
        Leave Requests
      </Typography>

      {/* Role toggle */}
      <Stack direction="row" spacing={0} sx={{ mb: 3 }}>
        <Button
          variant={role === 'employee' ? 'contained' : 'outlined'}
          onClick={() => setRole('employee')}
          sx={{ 
            borderRadius: 0,
            flex: 1,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          Employee View
        </Button>
        <Button
          variant={role === 'manager' ? 'contained' : 'outlined'}
          onClick={() => setRole('manager')}
          sx={{ 
            borderRadius: 0,
            flex: 1,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          Manager View
        </Button>
      </Stack>

      {role === 'employee' && <CreateRequestForm onCreated={load} employeeId={employeeId} />}

      <Divider sx={{ my: 3 }}>
        <Chip label={role === 'manager' ? 'All Requests' : 'My Requests'} />
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
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {role === 'manager' && (
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
                  {role === 'employee' && (
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
  );
}