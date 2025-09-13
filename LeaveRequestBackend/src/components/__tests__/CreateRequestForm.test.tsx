import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateRequestForm } from '../CreateRequestForm';

// Mock the API module
vi.mock('../../api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('CreateRequestForm', () => {
  const mockOnCreated = vi.fn();
  const mockSetError = vi.fn();

  const defaultProps = {
    onCreated: mockOnCreated,
    employeeId: 1,
    error: null,
    setError: mockSetError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<CreateRequestForm {...defaultProps} />);
    
    expect(screen.getByText('Create Leave Request')).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create leave request/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<CreateRequestForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /create leave request/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Start date is required')).toBeInTheDocument();
      expect(screen.getByText('End date is required')).toBeInTheDocument();
      expect(screen.getByText('Reason is required')).toBeInTheDocument();
    });
  });

  it('validates reason minimum length', async () => {
    render(<CreateRequestForm {...defaultProps} />);
    
    const reasonField = screen.getByLabelText(/reason/i);
    fireEvent.change(reasonField, { target: { value: 'short' } });
    
    const submitButton = screen.getByRole('button', { name: /create leave request/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Reason must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  it('validates end date is after start date', async () => {
    render(<CreateRequestForm {...defaultProps} />);
    
    const startDateField = screen.getByLabelText(/start date/i);
    const endDateField = screen.getByLabelText(/end date/i);
    
    fireEvent.change(startDateField, { target: { value: '2024-12-31' } });
    fireEvent.change(endDateField, { target: { value: '2024-12-30' } });
    
    const submitButton = screen.getByRole('button', { name: /create leave request/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
    });
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Test error message';
    render(<CreateRequestForm {...defaultProps} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onCreated when form is submitted successfully', async () => {
    const { api } = await import('../../api');
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    render(<CreateRequestForm {...defaultProps} />);
    
    const reasonField = screen.getByLabelText(/reason/i);
    fireEvent.change(reasonField, { target: { value: 'This is a valid reason for leave request' } });
    
    const submitButton = screen.getByRole('button', { name: /create leave request/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
    });
  });
});
