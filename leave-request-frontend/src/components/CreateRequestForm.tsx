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
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

type CreateLeaveRequest = {
  employeeId: number;
  startDate: string;
  endDate: string;
  reason: string;
};

type CreateRequestFormProps = {
  onCreated: () => void;
  employeeId: number;
  error: string | null;
  setError: (error: string | null) => void;
};

export function CreateRequestForm({ onCreated, employeeId, error, setError }: CreateRequestFormProps) {
  const [form, setForm] = useState<CreateLeaveRequest>({
    employeeId,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(form.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!form.endDate) {
      errors.endDate = 'End date is required';
    } else {
      const endDate = new Date(form.endDate);
      const startDate = new Date(form.startDate);
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    if (!form.reason.trim()) {
      errors.reason = 'Reason is required';
    } else if (form.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const { api } = await import('../api');
      await api.post('/LeaveRequests', form);
      onCreated();
      setForm({
        employeeId,
        startDate: '',
        endDate: '',
        reason: '',
      });
      setValidationErrors({});
    } catch (err: any) {
      console.error('Error creating request:', err);
      const errorMessage = err.response?.data || err.message || 'Failed to create leave request';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartDateChange = (newValue: Date | null) => {
    if (newValue) {
      setForm({ ...form, startDate: newValue.toISOString().split('T')[0] });
      // Clear validation error when user starts typing
      if (validationErrors.startDate) {
        setValidationErrors({ ...validationErrors, startDate: '' });
      }
    }
  };

  const handleEndDateChange = (newValue: Date | null) => {
    if (newValue) {
      setForm({ ...form, endDate: newValue.toISOString().split('T')[0] });
      // Clear validation error when user starts typing
      if (validationErrors.endDate) {
        setValidationErrors({ ...validationErrors, endDate: '' });
      }
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, reason: e.target.value });
    // Clear validation error when user starts typing
    if (validationErrors.reason) {
      setValidationErrors({ ...validationErrors, reason: '' });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Create Leave Request
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

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Start Date"
                value={form.startDate ? new Date(form.startDate) : null}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!validationErrors.startDate,
                    helperText: validationErrors.startDate,
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={form.endDate ? new Date(form.endDate) : null}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!validationErrors.endDate,
                    helperText: validationErrors.endDate,
                  },
                }}
              />
            </Stack>

            <TextField
              label="Reason"
              multiline
              rows={3}
              value={form.reason}
              onChange={handleReasonChange}
              error={!!validationErrors.reason}
              helperText={validationErrors.reason}
              placeholder="Please provide a detailed reason for your leave request..."
            />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              size="large"
              fullWidth
            >
              {submitting ? 'Creating Request...' : 'Create Leave Request'}
            </Button>
          </Stack>
        </Box>
      </LocalizationProvider>
    </Paper>
  );
}
