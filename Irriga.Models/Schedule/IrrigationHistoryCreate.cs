using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Models.Schedule
{
    public class IrrigationHistoryCreate
    {
        public int ApplicationUserId { get; set; }
        public Guid IrrigationId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime? Date { get; set; }
    }
}
