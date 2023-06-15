using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Models.Schedule
{
    public class Irrigation
    {
        public Guid Id { get; set; }
        public int ApplicationUserId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan Duration { get; set; }
        public string? DaysOfWeek { get; set; }
        public DateTime? SpecificDate { get; set; }

    }
}
