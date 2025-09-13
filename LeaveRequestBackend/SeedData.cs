using LeaveRequestBackend.Models;
using LeaveRequestBackend.Data;

namespace LeaveRequestBackend
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (!context.Employees.Any())
            {
                context.Employees.AddRange(
                    new Employee { Name = "Alex Employee", Email = "alex@company.com", Role = Role.Employee },
                    new Employee { Name = "Morgan Manager", Email = "morgan@company.com", Role = Role.Manager }
                );
                context.SaveChanges();
            }
        }
    }
}