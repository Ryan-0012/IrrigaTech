using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading;
using Irriga.Models.Schedule;
using Irriga.Repository;
using Quartz;

namespace Irriga.Scheduler
{
    public class IrrigationJob : IJob
    {
        private readonly HttpClient httpClient;
        public IrrigationJob()
        {
            this.httpClient = new HttpClient();
            this.httpClient.Timeout = TimeSpan.FromMinutes(5); // Definindo o tempo limite para 5 minutos
        }

        public async Task Execute(IJobExecutionContext context)
        {
            Console.WriteLine("Agendamento executado com sucesso");

            try
            {

                var irrigationId = context.JobDetail.JobDataMap.Get("irrigationId") as string;
                var applicationUserId = context.JobDetail.JobDataMap.GetInt("userId");
                var durationInSeconds = context.JobDetail.JobDataMap.Get("duration") as int?;
                var startTimeString = context.JobDetail.JobDataMap.Get("startTime") as string;
                // var starTimeObj = context.JobDetail.JobDataMap.Get("startTime");
                // var endTimeObj = starTimeObj != null ? ((TimeSpan)starTimeObj).Add(TimeSpan.FromSeconds(durationInSeconds ?? 0)) : (TimeSpan?)null;
                // var currentDate = DateTime.Now.Date;
                Console.WriteLine("ApplicatonUserId: " + applicationUserId);
                if (TimeSpan.TryParse(startTimeString, out var startTime))
                {
                    var endTime = startTime.Add(TimeSpan.FromSeconds(durationInSeconds ?? 0));
                    var currentDate = DateTime.Now.Date;
                    Console.WriteLine("Test Null");
                    if(irrigationId != null && applicationUserId != null){
                        var irrigationHistoryCreate = new IrrigationHistoryCreate
                        {
                            ApplicationUserId = applicationUserId,
                            IrrigationId = Guid.Parse(irrigationId),
                            StartTime = startTime,
                            EndTime = endTime,
                            Duration = TimeSpan.FromSeconds(durationInSeconds ?? 0),
                            Date = currentDate
                        };
                        Console.WriteLine("Dados do irrigationHistoryCreate:");
                        Console.WriteLine("ApplicatonUserId: " + irrigationHistoryCreate.ApplicationUserId);
                        Console.WriteLine("IrrigationId: " + irrigationHistoryCreate.IrrigationId);
                        Console.WriteLine("StartTime: " + irrigationHistoryCreate.StartTime);
                        Console.WriteLine("EndTime: " + irrigationHistoryCreate.EndTime);
                        Console.WriteLine("Duration: " + irrigationHistoryCreate.Duration);
                        Console.WriteLine("Date: " + irrigationHistoryCreate.Date);


                        Console.WriteLine("Test InsertHistory");
                        // if (applicationUserId.HasValue)
                        // {
                        //     int userId = applicationUserId.Value; // Obtém o valor subjacente do tipo int?
                        //     await _scheduleRepository.InsertHistoryAsync(irrigationHistoryCreate, userId);
                        // }
                        Console.WriteLine("Test InsertHistory2");

                        var json2 = JsonSerializer.Serialize(irrigationHistoryCreate);
                        var content2 = new StringContent(json2, Encoding.UTF8, "application/json");

                        var response2 = await httpClient.PostAsync("http://localhost:5076/api/Schedule/history", content2);

                        if (response2.IsSuccessStatusCode)
                        {
                            Console.WriteLine("Mensagem enviada com sucesso para http://localhost:5076/api/Schedule/history!");
                        }
                        else
                        {
                            Console.WriteLine("Erro ao enviar mensagem para http://localhost:5076/api/Schedule/history: " + response2.StatusCode);
                        }
                    }
                }

                Console.WriteLine(durationInSeconds);
                var mensagem = new
                {
                    topic = "Teste-IrrigaTech",
                    message = "scheduler " + durationInSeconds
                };

                var json = JsonSerializer.Serialize(mensagem);
                var content = new StringContent(json, Encoding.UTF8, "application/json");


                var response = await httpClient.PostAsync("http://localhost:9000/api/mqtt", content);

                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("Mensagem enviada com sucesso!");
                }
                else
                {
                    Console.WriteLine("Erro ao enviar mensagem: " + response.StatusCode);
                }

                
            }
            catch (Exception ex)
            {
                Console.WriteLine("Erro ao enviar mensagem: " + ex.Message);
            }
            
            await Task.CompletedTask;
        }


    }
}
