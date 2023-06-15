using Irriga.Models.Schedule;
using Irriga.Repository;
using Irriga.Scheduler;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Services
{
    public class SchedulerService : ISchedulerService
    {
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IScheduler _scheduler;

        public SchedulerService(IScheduleRepository scheduleRepository, IScheduler scheduler)
        {
            _scheduleRepository = scheduleRepository;
            _scheduler = scheduler;
        }


        public async Task<int> LoadScheduledJobsFromDatabase()
        {
            Console.WriteLine("test tabel1");
            int i = 0;

            // Recuperar os trabalhos agendados do banco de dados
            List<Irrigation> irrigation = await _scheduleRepository.GetAllAsync();
            Console.WriteLine("test tabe2");
            // Agendar os trabalhos recuperados
            foreach (var job in irrigation)
            {
                Console.WriteLine("Dias da semana: " + job.DaysOfWeek);
                // Criar o trabalho (job) para a irrigação
                var scheduledJob = JobBuilder.Create<IrrigationJob>()
                    .WithIdentity($"IrrigacaoJob-{job.Id}")
                    .UsingJobData("userId", job.ApplicationUserId.ToString())
                    .Build();
                Console.WriteLine(i);

                // Criar o gatilho (trigger) para a irrigação
                ITrigger trigger;
                if (job.SpecificDate != null)
                {
                    trigger = TriggerBuilder.Create()
                        .WithIdentity($"IrrigacaoTrigger-{job.Id}")
                        .StartAt(job.SpecificDate.Value.Date.Add(job.StartTime))
                        .Build();
                }
                else
                {

                    

                    string[] weekdays = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
                    int[] cronDaysOfWeek = { 7, 1, 2, 3, 4, 5, 6 };
                    //string daysOfWeekString = string.Join(",", job.DaysOfWeek);
                    var startTime = DateTime.Today.Add(job.StartTime);
                    trigger = TriggerBuilder.Create()
                        .WithIdentity($"IrrigacaoTrigger-{job.Id}")
                        .WithCronSchedule($"0 {job.StartTime.Minutes} {job.StartTime.Hours} ? * {job.DaysOfWeek}")
                        .Build();
                }

                // Agendar o trabalho
                await _scheduler.ScheduleJob(scheduledJob, trigger);
                i++;
            }
            return i;
        }
    }
}
