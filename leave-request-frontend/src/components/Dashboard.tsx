import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
  Fade,
  Alert,
  Box,
} from '@mui/material';

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

type DashboardProps = {
  requests: LeaveRequest[];
  role: 'employee' | 'manager';
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
};

export function Dashboard({
  requests,
  role,
  onApprove,
  onReject,
  onCancel,
  error,
  setError,
}: DashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Leave Request Dashboard
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        {role === 'manager' ? 'All Leave Requests' : 'My Leave Requests'}
      </Typography>

      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {requests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No leave requests found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {requests.map((request) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={request.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {role === 'manager' ? request.employee?.name : 'My Request'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({calculateDays(request.startDate, request.endDate)} days)
                    </Typography>
                  </Box>

                  <Divider />

                  <Typography variant="body2">
                    <strong>Reason:</strong> {request.reason}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status) as any}
                      size="small"
                    />
                    {role === 'manager' && (
                      <Typography variant="caption" color="text.secondary">
                        ID: {request.employeeId}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Action Buttons */}
                  {role === 'manager' && request.status === 'Pending' && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => onApprove(request.id)}
                        sx={{ flex: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => onReject(request.id)}
                        sx={{ flex: 1 }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  )}

                  {role === 'employee' && request.status === 'Pending' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => onCancel(request.id)}
                      fullWidth
                    >
                      Cancel Request
                    </Button>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
