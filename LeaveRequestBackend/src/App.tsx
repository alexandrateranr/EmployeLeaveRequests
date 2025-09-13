import { useEffect, useState } from 'react';
import { api } from './api';
import {
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Fade,
  Alert,
  Box,
} from '@mui/material';
import { Dashboard } from './components/Dashboard';
import { CreateRequestForm } from './components/CreateRequestForm';
import { ManagerView } from './components/ManagerView';

type LeaveRequest = {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  employee?: {
    id: number;
    name: string;
    email: string;
    role: 'Employee' | 'Manager';
  };
};

function App() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [role, setRole] = useState<'employee' | 'manager'>('employee');
  const [employeeId] = useState(1); // Alex Employee (first created)
  const [managerId] = useState(2); // Morgan Manager (second created)
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/LeaveRequests?employeeId=${role === 'manager' ? managerId : employeeId}`);
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error loading requests:', err);
      setError(err.response?.data || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const approve = async (id: number) => {
    try {
      await api.put(`/LeaveRequests/${id}?managerId=${managerId}`, "Approved", {
        headers: { 'Content-Type': 'application/json' },
      });
      await load();
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
      await load();
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      setError(err.response?.data || err.message || 'Failed to reject request');
    }
  };

  const cancel = async (id: number) => {
    try {
      await api.delete(`/LeaveRequests/${id}?employeeId=${employeeId}`);
      await load();
    } catch (err: any) {
      console.error('Error canceling request:', err);
      setError(err.response?.data || err.message || 'Failed to cancel request');
    }
  };

  const handleRequestCreated = () => {
    load();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Leave Request System
      </Typography>

      {/* Role Toggle */}
      <Stack direction="row" spacing={0} sx={{ mb: 3, backgroundColor: '#f5f5f5', borderRadius: 2, p: 0.5 }}>
        <Button
          variant={role === 'employee' ? 'contained' : 'text'}
          onClick={() => setRole('employee')}
          sx={{ 
            borderRadius: 1.5,
            flex: 1,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            backgroundColor: role === 'employee' ? 'primary.main' : 'transparent',
            color: role === 'employee' ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: role === 'employee' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
            },
            boxShadow: role === 'employee' ? 2 : 'none'
          }}
        >
          Employee View
        </Button>
        <Button
          variant={role === 'manager' ? 'contained' : 'text'}
          onClick={() => setRole('manager')}
          sx={{ 
            borderRadius: 1.5,
            flex: 1,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            backgroundColor: role === 'manager' ? 'primary.main' : 'transparent',
            color: role === 'manager' ? 'white' : 'text.primary',
            '&:hover': {
              backgroundColor: role === 'manager' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
            },
            boxShadow: role === 'manager' ? 2 : 'none'
          }}
        >
          Manager View
        </Button>
      </Stack>

      {/* Global Error Display */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Main Content */}
      {role === 'employee' ? (
        <Stack spacing={4}>
          {/* Create Request Form */}
          <CreateRequestForm
            onCreated={handleRequestCreated}
            employeeId={employeeId}
            error={error}
            setError={setError}
          />

          {/* Employee Dashboard */}
          <Dashboard
            requests={requests}
            role="employee"
            onApprove={approve}
            onReject={reject}
            onCancel={cancel}
            error={error}
            setError={setError}
          />
        </Stack>
      ) : (
        /* Manager View */
        <ManagerView
          requests={requests}
          onApprove={approve}
          onReject={reject}
          error={error}
          setError={setError}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default App;
