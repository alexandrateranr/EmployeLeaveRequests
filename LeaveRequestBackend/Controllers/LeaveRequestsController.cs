using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LeaveRequestBackend.Models;
using LeaveRequestBackend.Data;
using LeaveRequestBackend.DTOs; // <-- for CreateLeaveRequestDto

namespace LeaveRequestBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LeaveRequestsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/leaverequests?employeeId=1 (for employees) or GET /api/leaverequests (for managers)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LeaveRequest>>> GetLeaveRequests([FromQuery] int? employeeId)
        {
            // If no employeeId provided, return all requests (manager view)
            if (employeeId == null)
            {
                return await _context.LeaveRequests
                    .Include(lr => lr.Employee)
                    .OrderByDescending(lr => lr.StartDate)
                    .ToListAsync();
            }

            // If employeeId provided, check if employee exists
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null) return NotFound("Employee not found");

            if (employee.Role == Role.Manager)
            {
                // Manager sees all requests even when their ID is provided
                return await _context.LeaveRequests
                    .Include(lr => lr.Employee)
                    .OrderByDescending(lr => lr.StartDate)
                    .ToListAsync();
            }

            // Employee sees only their own requests
            return await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == employeeId)
                .Include(lr => lr.Employee)
                .OrderByDescending(lr => lr.StartDate)
                .ToListAsync();
        }

        // GET /api/leaverequests/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<LeaveRequest>> GetLeaveRequest(int id)
        {
            var request = await _context.LeaveRequests
                .Include(lr => lr.Employee)
                .FirstOrDefaultAsync(lr => lr.Id == id);

            if (request == null) return NotFound();

            return request;
        }

        // POST /api/leaverequests
        [HttpPost]
        public async Task<ActionResult<LeaveRequest>> CreateLeaveRequest(CreateLeaveRequestDto dto)
        {
            var employee = await _context.Employees.FindAsync(dto.EmployeeId);
            if (employee == null) return NotFound("Employee not found");

            // Validate dates
            if (dto.StartDate >= dto.EndDate)
            {
                return BadRequest("End date must be after start date");
            }

            if (dto.StartDate < DateTime.Today)
            {
                return BadRequest("Cannot create requests for past dates");
            }

            var duration = (dto.EndDate - dto.StartDate).TotalDays + 1; // Include both start and end days

            // Check for overlapping approved leave
            var overlap = await _context.LeaveRequests.AnyAsync(lr =>
                lr.EmployeeId == dto.EmployeeId &&
                lr.Status == LeaveStatus.Approved &&
                lr.StartDate <= dto.EndDate &&
                lr.EndDate >= dto.StartDate);

            if (overlap) return BadRequest("Overlapping approved leave exists for this period");

            // Business rule: Requests exceeding 15 days are auto-rejected
            var status = duration > 15 ? LeaveStatus.Rejected : LeaveStatus.Pending;

            var request = new LeaveRequest
            {
                EmployeeId = dto.EmployeeId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = status,
                Employee = employee // required property satisfied
            };

            _context.LeaveRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLeaveRequests), new { employeeId = request.EmployeeId }, request);
        }

        // PUT /api/leaverequests/{id}?managerId=2
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLeaveStatus(int id, [FromQuery] int managerId, [FromBody] string statusString)
        {
            var manager = await _context.Employees.FindAsync(managerId);
            if (manager == null || manager.Role != Role.Manager) return Unauthorized();

            var request = await _context.LeaveRequests.FindAsync(id);
            if (request == null) return NotFound();

            // Parse the string status to enum
            if (!Enum.TryParse<LeaveStatus>(statusString, true, out var status))
            {
                return BadRequest("Invalid status. Must be 'Approved' or 'Rejected'.");
            }

            // Business rule: Manager can override auto-rejection for 15+ day requests
            var duration = (request.EndDate - request.StartDate).TotalDays;
            if (duration > 15 && status == LeaveStatus.Approved)
            {
                // Manager is explicitly approving a long request - this is allowed
                request.Status = status;
            }
            else
            {
                request.Status = status;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /api/leaverequests/{id}?employeeId=1 (for employees - cancel pending requests)
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelLeaveRequest(int id, [FromQuery] int employeeId)
        {
            var request = await _context.LeaveRequests.FindAsync(id);
            if (request == null || request.EmployeeId != employeeId) return Unauthorized();
            if (request.Status != LeaveStatus.Pending) return BadRequest("Only pending requests can be canceled");

            _context.LeaveRequests.Remove(request);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /api/leaverequests/{id}/permanent?managerId=2 (for managers - permanently delete any request)
        [HttpDelete("{id}/permanent")]
        public async Task<IActionResult> PermanentlyDeleteRequest(int id, [FromQuery] int managerId)
        {
            var manager = await _context.Employees.FindAsync(managerId);
            if (manager == null || manager.Role != Role.Manager) return Unauthorized();

            var request = await _context.LeaveRequests.FindAsync(id);
            if (request == null) return NotFound();

            _context.LeaveRequests.Remove(request);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}