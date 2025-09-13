using Microsoft.EntityFrameworkCore;
using LeaveRequestBackend.Models;

namespace LeaveRequestBackend.Data {
    public class AppDbContext : DbContext {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Employee> Employees { get; set; }
        public DbSet<LeaveRequest> LeaveRequests { get; set; }
    }
}