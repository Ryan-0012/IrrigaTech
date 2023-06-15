using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Models.Schedule
{
    public class IrrigationCreate
    {
        public Guid Id { get; set; }
        public int applicationUserId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan Duration { get; set; }
        public List<int>? DaysOfWeek { get; set; } = new List<int>();
        public DateTime? SpecificDate { get; set; }
    }
}
