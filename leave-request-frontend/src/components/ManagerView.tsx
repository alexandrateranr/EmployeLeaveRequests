import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Stack,
  Divider,
  Chip,
  Alert,
  Fade,
  Box,
  Card,
  CardContent,
  CardActions,
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

type ManagerViewProps = {
  requests: LeaveRequest[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
};

export function ManagerView({
  requests,
  onApprove,
  onReject,
  error,
  setError,
}: ManagerViewProps) {
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
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Invalid dates:', startDate, endDate);
        return 0;
      }
      
      // Calculate difference in days and add 1 to include both start and end dates
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      
      return Math.max(1, daysDiff); // Ensure at least 1 day
    } catch (error) {
      console.error('Error calculating days:', error);
      return 0;
    }
  };

  // Show Pending and Rejected requests (managers can override rejected requests)
  const pendingRequests = requests.filter(req => req.status === 'Pending' || req.status === 'Rejected');
  const otherRequests = requests.filter(req => req.status === 'Approved');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Manager Dashboard
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Pending Approvals ({pendingRequests.length})
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

      {pendingRequests.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No pending requests to review
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {pendingRequests.map((request) => {
            const days = calculateDays(request.startDate, request.endDate);
            const isLongRequest = days > 15;
            
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={request.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {request.employee?.name || `Employee ID: ${request.employeeId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.employee?.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={isLongRequest ? 'error.main' : 'text.secondary'}
                          fontWeight={isLongRequest ? 'bold' : 'normal'}
                        >
                          ({days} days{days > 15 ? ' - Long Request' : ''})
                        </Typography>
                      </Box>

                      <Divider />

                      <Typography variant="body2">
                        <strong>Reason:</strong> {request.reason}
                      </Typography>

                      {isLongRequest && (
                        <Alert severity="warning">
                          This request exceeds 15 days and was auto-rejected. 
                          Manager approval required for long-term leave.
                        </Alert>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={request.status} 
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          ID: {request.employeeId}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  
                  <CardActions>
                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => onApprove(request.id)}
                        disabled={request.status === 'Approved'}
                        sx={{ flex: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => onReject(request.id)}
                        disabled={request.status === 'Rejected'}
                        sx={{ flex: 1 }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {otherRequests.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            All Other Requests ({otherRequests.length})
          </Typography>
          
          <Grid container spacing={2}>
            {otherRequests.map((request) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={request.id}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {request.employee?.name || `Employee ${request.employeeId}`}
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
                      <Typography variant="caption" color="text.secondary">
                        ID: {request.employeeId}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}
