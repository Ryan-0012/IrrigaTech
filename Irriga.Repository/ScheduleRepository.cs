using Dapper;
using Irriga.Models.Schedule;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Repository
{
    public class ScheduleRepository : IScheduleRepository
    {

        private readonly IConfiguration _config;

        public ScheduleRepository()
        {
        }

        public ScheduleRepository(IConfiguration config)
        {
            _config = config;
        }
        public async Task<List<Irrigation>> GetAllAsync()
        {
            List<Irrigation> irrigation;
            Console.WriteLine("sinal do respositorio1");

            using (var connection = new SqlConnection("Data Source=localhost;Initial Catalog=IrrigaBD;User ID=admin;Integrated Security=true"))//conexão com o servidor SQL
            {
                Console.WriteLine("sinal do respositorio2");

                await connection.OpenAsync();
                Console.WriteLine("sinal do respositorio3");

                irrigation = (await connection.QueryAsync<Irrigation>(
                    "Irrigation_GetAll",
                    commandType: CommandType.StoredProcedure)).ToList();

            }
            Console.WriteLine("sinal do respositorio");

            return irrigation;
        }

        public async Task<Irrigation> UpsertAsync(IrrigationCreate irrigationCreate)
        {
            Console.WriteLine(irrigationCreate.Id+" primeira linha");
            var dataTable = new DataTable();
            dataTable.Columns.Add("Id", typeof(Guid));
            dataTable.Columns.Add("ApplicationUserId", typeof(int));
            dataTable.Columns.Add("StartTime", typeof(TimeSpan));
            dataTable.Columns.Add("Duration", typeof(TimeSpan));
            dataTable.Columns.Add("DaysOfWeek", typeof(string));
            dataTable.Columns.Add("SpecificDate", typeof(DateTime));

            dataTable.Rows.Add(irrigationCreate.Id, irrigationCreate.applicationUserId, irrigationCreate.StartTime,
                   irrigationCreate.Duration, string.Join(",", irrigationCreate.DaysOfWeek), irrigationCreate.SpecificDate);

            Guid? newIrrigationId;

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                await connection.OpenAsync();
                newIrrigationId = await connection.ExecuteScalarAsync<Guid?>(
                "dbo.Irrigation_Upsert",
                    new { Irrigation = dataTable.AsTableValuedParameter("dbo.IrrigationType"), ApplicationUserId = irrigationCreate.applicationUserId },
                    commandType: CommandType.StoredProcedure);

            }
            newIrrigationId = newIrrigationId ?? irrigationCreate.Id;
            Irrigation irrigation = await GetAsync(newIrrigationId.Value);
            Console.WriteLine(newIrrigationId.Value);
            Console.WriteLine(newIrrigationId+ "bbbbbbb");
            return irrigation;
        }

        public async Task<Irrigation> GetAsync(Guid id)
        {

            Irrigation irrigation;

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                await connection.OpenAsync();
                irrigation = await connection.QueryFirstOrDefaultAsync<Irrigation>(
                "Irrigation_Get",
                    new { IrrigationId = id },
                    commandType: CommandType.StoredProcedure);
            }
            Console.WriteLine(irrigation.Id);
            return irrigation;
        }

        public async Task<int> DeleteAsync(Guid irrigationId)
        {
            int affectedRows = 0;

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                await connection.OpenAsync();

                affectedRows = await connection.ExecuteAsync(
                    "Irrigation_Delete",
                    new { IrrigationId = irrigationId }, // Dentro das chaves {} estão os parametros
                    commandType: CommandType.StoredProcedure);
            }
            return affectedRows;
        }

        public async Task<List<Irrigation>> GetAllByUserIdAsync(int applicationUserId)
        {
            IEnumerable<Irrigation> irrigations;

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                await connection.OpenAsync();
                irrigations = await connection.QueryAsync<Irrigation>(
                    "Irrigation_GetByUserId",
                    new { ApplicationUserId = applicationUserId },
                    commandType: CommandType.StoredProcedure);
            }
            return irrigations.ToList();
        }

        public async Task<IrrigationHistory> InsertHistoryAsync(IrrigationHistoryCreate irrigationHistoryCreate)
        {
            var dataTable = new DataTable();
            dataTable.Columns.Add("IrrigationId", typeof(Guid));
            dataTable.Columns.Add("ApplicationUserId", typeof(int));
            dataTable.Columns.Add("StartTime", typeof(TimeSpan));
            dataTable.Columns.Add("EndTime", typeof(TimeSpan));
            dataTable.Columns.Add("Duration", typeof(TimeSpan));
            dataTable.Columns.Add("Date", typeof(DateTime));

            dataTable.Rows.Add(irrigationHistoryCreate.IrrigationId, irrigationHistoryCreate.ApplicationUserId, irrigationHistoryCreate.StartTime,
                   irrigationHistoryCreate.EndTime, irrigationHistoryCreate.Duration, irrigationHistoryCreate.Date);

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                Console.WriteLine("Repository");
                await connection.OpenAsync();
                using (var transaction = connection.BeginTransaction())
                {
                    Console.WriteLine("Repository2");
                    try
                    {
                        // Executar o comando de inserção na tabela IrrigationHistory
                        await connection.ExecuteAsync(
                            "dbo.IrrigationHistory_Insert",
                            new { IrrigationHistory = dataTable.AsTableValuedParameter("dbo.IrrigationHistoryType") },
                            commandType: CommandType.StoredProcedure,
                            transaction: transaction);

                        // Recuperar o último ID inserido na tabela
                        int irrigationHistoryId = await connection.ExecuteScalarAsync<int>("SELECT SCOPE_IDENTITY()", transaction: transaction);

                        // Recuperar o IrrigationHistory recém-criado a partir do ID
                        var irrigationHistory = await connection.QueryFirstOrDefaultAsync<IrrigationHistory>(
                            "SELECT * FROM IrrigationHistory WHERE Id = @Id",
                            new { Id = irrigationHistoryId },
                            transaction: transaction);

                        // Confirmar a transação
                        transaction.Commit();
                        Console.WriteLine("Repository3");
                        return irrigationHistory;
                    }
                    catch (Exception ex)
                    {
                        // Lidar com erros e fazer rollback da transação se necessário
                        transaction.Rollback();
                        throw ex;
                    }
                }
            }
            
        }

        public async Task<List<IrrigationHistory>> GetHistoryAllByUserIdAsync(int applicationUserId)
        {
            IEnumerable<IrrigationHistory> irrigationsHistorys;

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                await connection.OpenAsync();
                irrigationsHistorys = await connection.QueryAsync<IrrigationHistory>(
                    "IrrigationHistory_GetByUserId",
                    new { ApplicationUserId = applicationUserId },
                    commandType: CommandType.StoredProcedure);
            }
            return irrigationsHistorys.ToList();
        }
    }
}
