using System;

namespace LeaveRequestBackend.Models {
    public enum LeaveStatus { Pending, Approved, Rejected }

    public class LeaveRequest {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public LeaveStatus Status { get; set; }
        public required string Reason { get; set; }

        public required Employee Employee { get; set; }
    }
}