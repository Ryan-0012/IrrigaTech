using Quartz.Impl;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Scheduler
{
    public class QuartzConfig
    {
        public static async Task Start()
        {
            ISchedulerFactory schedulerFactory = new StdSchedulerFactory();
            IScheduler scheduler = await schedulerFactory.GetScheduler();

            IJobDetail job = JobBuilder.Create<IrrigationJob>().WithIdentity("PrintMessageJob", "default").Build();

            ITrigger trigger = IrrigationTrigger.CreateTrigger();

            await scheduler.ScheduleJob(job, trigger);

            await scheduler.Start();
        }
    }
}
