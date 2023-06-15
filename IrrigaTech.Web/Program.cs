using IrrigaTech.Web;
using Irriga.Services;
using Irriga.Models.Schedule;
using Irriga.Repository;
using Irriga.Scheduler;
using Quartz;
using Quartz.Impl;

var scheduleRepository = new ScheduleRepository();
var schedulerFactory = new StdSchedulerFactory();
var scheduler = await schedulerFactory.GetScheduler();
var schedulerService = new SchedulerService(scheduleRepository, scheduler);

await schedulerService.LoadScheduledJobsFromDatabase();


var builder = WebApplication.CreateBuilder(args);
var startup = new Startup(builder.Configuration, schedulerService);

startup.ConfigureServices(builder.Services);

var app = builder.Build();

startup.Configure(app, app.Environment);
app.Run();


