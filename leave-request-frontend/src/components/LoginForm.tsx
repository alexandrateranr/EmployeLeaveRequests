import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Fade,
  Box,
} from '@mui/material';

type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type LoginFormProps = {
  onLogin: (employee: Employee) => void;
  employees: Employee[];
};

export function LoginForm({ onLogin, employees }: LoginFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Find employee by name and email
      const employee = employees.find(
        emp => emp.name.toLowerCase() === form.name.toLowerCase() && 
               emp.email.toLowerCase() === form.email.toLowerCase()
      );

      if (employee) {
        onLogin(employee);
      } else {
        setError(`Invalid credentials. Available employees: ${employees.length > 0 ? employees.map(e => e.name).join(', ') : 'None loaded'}`);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={600}>
        Employee Login
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your name and email to access the leave management system
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

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={handleInputChange('name')}
            fullWidth
            required
            placeholder="e.g., Alex Employee"
            autoComplete="name"
          />

          <TextField
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleInputChange('email')}
            fullWidth
            required
            placeholder="e.g., alex@company.com"
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !form.name.trim() || !form.email.trim()}
            sx={{ mt: 2 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          Demo Credentials:
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          Employee: Alex Employee / alex@company.com
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          Manager: Morgan Manager / morgan@company.com
        </Typography>
      </Box>
    </Paper>
  );
}
