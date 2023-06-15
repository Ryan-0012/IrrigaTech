using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using System.Reflection.Metadata;
using Irriga.Models.Schedule;
using Quartz;
using Irriga.Scheduler;
using Irriga.Repository;
using Irriga.Models.Account;
using Quartz.Impl;
using Quartz.Impl.Matchers;
using Irriga.Services;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;

namespace IrrigaTech.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase 
    { 


        private readonly IScheduler _scheduler;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly SchedulerService _schedulerService;
        public ScheduleController(IScheduler scheduler, IScheduleRepository scheduleRepository, 
            SchedulerService schedulerService)
        {
            _scheduler = scheduler;
            _scheduleRepository = scheduleRepository;
            _schedulerService = schedulerService;

            
        }

        [Authorize]
        [HttpPost("scheduler")]
        public async Task<ActionResult<Irrigation>> AgendarIrrigacao(IrrigationCreate irrigationCreate)
        {
            int applicationUserId2 = int.Parse(User.Claims.First(i => i.Type == JwtRegisteredClaimNames.NameId).Value);
            Console.WriteLine("ApplicatonUserId: " + applicationUserId2);
            Console.WriteLine("             ---------------Deu certo-------------                                       ");

            try
            {
                Console.WriteLine(irrigationCreate.Id);
                if(irrigationCreate.Id != Guid.Empty){
                    Irrigation existingIrrigation = await _scheduleRepository.GetAsync(irrigationCreate.Id);
                    Console.WriteLine(existingIrrigation.Id);
                    if (existingIrrigation != null && existingIrrigation.Id != null)
                    {
                        Console.WriteLine("delete job");

                        
                        await _scheduler.DeleteJob(new JobKey($"IrrigacaoJob-{existingIrrigation.Id}"));
                    }
                    Console.WriteLine("pós delete");
                }

                var durationInSeconds = (int)irrigationCreate.Duration.TotalSeconds;
                Console.WriteLine(durationInSeconds);
                // Criando o trabalho (job) para a irrigação
                
                var jobId = irrigationCreate.Id != Guid.Empty ? irrigationCreate.Id.ToString() : Guid.NewGuid().ToString();
                var job = JobBuilder.Create<IrrigationJob>()
                    .WithIdentity($"IrrigacaoJob-{jobId}")
                    .UsingJobData("userId", irrigationCreate.applicationUserId.ToString())
                    .UsingJobData("irrigationId", jobId)
                    .UsingJobData("duration", durationInSeconds)
                    .UsingJobData("startTime", irrigationCreate.StartTime.ToString())
                    .Build();
                    
                Console.WriteLine("             ---------------Deu certo-------------                                       ");
                // Criando o gatilho (trigger) para a irrigação
                ITrigger trigger;
                if (irrigationCreate.SpecificDate != null)
                {
                    var startDateTime = new DateTimeOffset(2023, 5, 18, 10, 0, 0, TimeSpan.Zero);
                    Console.WriteLine(irrigationCreate.StartTime);
                    Console.WriteLine(irrigationCreate.SpecificDate.Value); 
                    Console.WriteLine(irrigationCreate.SpecificDate.Value.Date.Add(irrigationCreate.StartTime));
                    Console.WriteLine("Teste SpecificDate");
                    trigger = TriggerBuilder.Create()
                        .WithIdentity($"IrrigacaoTrigger-{Guid.NewGuid()}")
                        .StartAt(irrigationCreate.SpecificDate.Value.Date.Add(irrigationCreate.StartTime))
                        .Build();
                        Console.WriteLine("B");
                }
                else
                {       
                    // Array com os dias da semana
                    string[] weekdays = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };

                    // Array com os números dos dias da semana correspondentes
                    int[] cronDaysOfWeek = { 7, 1, 2, 3, 4, 5, 6 };


                    // Converter os dias da semana informados no objeto irrigationCreate para números suportados na expressão cron

                    // List<int> cronDays = irrigationCreate.DaysOfWeek.Select(d => cronDaysOfWeek[Array.IndexOf(weekdays, d)]).ToList();

                    // Console.WriteLine(string.Join(",", irrigationCreate.DaysOfWeek));
                    // foreach (int dayOfWeek in irrigationCreate.DaysOfWeek)
                    // {
                    //     Console.WriteLine(dayOfWeek);
                    // }

                    Console.WriteLine("DaysOfWeek:");
                    foreach (var dayOfWeek in irrigationCreate.DaysOfWeek)
                    {
                        Console.WriteLine(dayOfWeek);
                    }


                    Console.WriteLine("DaysOfWeek");
                    string daysOfWeekString = string.Join(",", irrigationCreate.DaysOfWeek);
                    var startTime = DateTime.Today.Add(irrigationCreate.StartTime);

                    Console.WriteLine(daysOfWeekString);
                    trigger = TriggerBuilder.Create()
                        .WithIdentity($"IrrigacaoTrigger-{Guid.NewGuid()}")
                        .WithCronSchedule($"0 {irrigationCreate.StartTime.Minutes} {irrigationCreate.StartTime.Hours} ? * {daysOfWeekString}")
                        .Build();
                    Console.WriteLine(daysOfWeekString);
                    Console.WriteLine("Trigger DayOfWeek");

                    var scheduler = StdSchedulerFactory.GetDefaultScheduler().Result;
                    var jobKeys = scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup()).Result;
                    int numTriggers = 0;

                    foreach (var jobKey in jobKeys)
                    {
                        var triggers = scheduler.GetTriggersOfJob(jobKey).Result;
                        numTriggers += triggers.Count;
                    }

                    Console.WriteLine($"Total number of scheduled jobs: {jobKeys.Count}, total number of triggers: {numTriggers}");
                                                                                                

                }

                // Agendando a irrigação
                await _scheduler.ScheduleJob(job, trigger);
                
                // Obtendo o id da irrigação a partir do nome do job
                irrigationCreate.Id = Guid.Parse(jobId);

                Console.WriteLine("D");
                // Criando o objeto Irrigation a partir dos dados recebidos
                // var irrigacao = new Irrigation
                // {
                //     Id = irrigationId,
                //     ApplicationUserId = applicationUserId,
                //     StartTime = irrigationCreate.StartTime,
                //     Duration = irrigationCreate.Duration,
                //     DaysOfWeek = irrigationCreate.DaysOfWeek,
                //     SpecificDate = irrigationCreate.SpecificDate
                // };
                Console.WriteLine("E");
                // await _schedulerService.LoadScheduledJobsFromDatabase();
                // Salvando a irrigação no repositório
                var irrigation = await _scheduleRepository.UpsertAsync(irrigationCreate);
                
                return Ok(irrigation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocorreu um erro ao agendar a irrigação: " + ex.Message });
            }
        }

        [HttpPost("history")]
        public async Task<ActionResult<IrrigationHistory>> CreateIrrigationHistory(IrrigationHistoryCreate irrigationHistoryCreate)
        {
            Console.WriteLine("Dados do irrigationHistoryCreate Controller:");
            Console.WriteLine("ApplicatonUserId: " + irrigationHistoryCreate.ApplicationUserId);
            Console.WriteLine("IrrigationId: " + irrigationHistoryCreate.IrrigationId);
            Console.WriteLine("StartTime: " + irrigationHistoryCreate.StartTime);
            Console.WriteLine("EndTime: " + irrigationHistoryCreate.EndTime);
            Console.WriteLine("Duration: " + irrigationHistoryCreate.Duration);
            Console.WriteLine("Date: " + irrigationHistoryCreate.Date);

            var irrigationHistory = await _scheduleRepository.InsertHistoryAsync(irrigationHistoryCreate);
                return Ok(irrigationHistory);
        }

        [HttpGet("{irrigationId}")]
        public async Task<ActionResult<Irrigation>> Get(Guid irrigationId)
        {
            var irrigation = await _scheduleRepository.GetAsync(irrigationId);
            return Ok(irrigation);
        }

        [HttpGet("user/{applicationUserId}")]
        public async Task<ActionResult<List<Irrigation>>> GetByApplicationUserId(int applicationUserId)
        {
            var blogs = await _scheduleRepository.GetAllByUserIdAsync(applicationUserId);
            return Ok(blogs);
        }

        [HttpGet("user/history/{applicationUserId}")]
        public async Task<ActionResult<List<IrrigationHistory>>> GetHystorytByApplicationUserId(int applicationUserId)
        {
            var irrigationHistorys = await _scheduleRepository.GetHistoryAllByUserIdAsync(applicationUserId);
            return Ok(irrigationHistorys);
        }

        [Authorize]
        [HttpDelete("{irrigationId}")]
        public async Task<ActionResult<int>> Delete(Guid irrigationId)
        {
            int applicationUserId = int.Parse(User.Claims.First(i => i.Type == JwtRegisteredClaimNames.NameId).Value);
            Console.WriteLine(applicationUserId);
            var foundIrrigation = await _scheduleRepository.GetAsync(irrigationId);
            Console.WriteLine(foundIrrigation);
            if (foundIrrigation == null) return BadRequest("Irrigation does not exist");

            if (foundIrrigation.ApplicationUserId == applicationUserId)
            {
                var affectedRows = await _scheduleRepository.DeleteAsync(irrigationId);
                await _scheduler.DeleteJob(new JobKey($"IrrigacaoJob-{irrigationId}"));
                return Ok(affectedRows);
            }

            else
            {
                return BadRequest("You didn't create this irrigation");
            }
            
        }   

    }
}
