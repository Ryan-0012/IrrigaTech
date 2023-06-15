using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Scheduler
{
    public class IrrigationTrigger
    {
        public static ITrigger CreateTrigger()
        {
            return TriggerBuilder.Create()
                .WithIdentity("Saturday11am37Trigger", "default")
                .WithSchedule(CronScheduleBuilder.WeeklyOnDayAndHourAndMinute(DayOfWeek.Saturday, 11, 59))
                .Build();
        }
    }
}
