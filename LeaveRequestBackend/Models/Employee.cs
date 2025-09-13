namespace LeaveRequestBackend.Models {
    public enum Role { Employee, Manager }

    public class Employee {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public Role Role { get; set; }
    }
}