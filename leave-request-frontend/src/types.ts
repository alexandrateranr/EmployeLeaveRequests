export type LeaveRequest = {
    id: number;
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  };
  
  export type CreateLeaveRequest = {
    employeeId: number;
    startDate: string;
    endDate: string;
    reason: string;
  };