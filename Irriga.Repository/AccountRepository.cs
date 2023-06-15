using Dapper;
using Irriga.Models.Account;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly IConfiguration _config;

        public AccountRepository(IConfiguration config)
        {
            _config = config;
        }



        public async Task<IdentityResult> CreateAsync(ApplicationUserIdentity user,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var dataTable = new DataTable();
            dataTable.Columns.Add("Username", typeof(string));
            dataTable.Columns.Add("NormalizedUsername", typeof(string));
            dataTable.Columns.Add("Email", typeof(string));
            dataTable.Columns.Add("NormalizedEmail", typeof(string));
            dataTable.Columns.Add("Fullname", typeof(string));
            dataTable.Columns.Add("PasswordHash", typeof(string));

            dataTable.Rows.Add(
                user.Username,
                user.NormalizedUsername,
                user.Email,
                user.NormalizedEmail,
                user.Fullname,
                user.PasswordHash);

            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))//conexão com o servidor SQL
            {
                await connection.OpenAsync(cancellationToken);

                await connection.ExecuteAsync("Account_Insert",
                    new { Account = dataTable.AsTableValuedParameter("dbo.AccountType") },
                    commandType: CommandType.StoredProcedure);
            }
            return IdentityResult.Success;
        }

        public async Task<ApplicationUserIdentity> GetByUsernameAsync(string normalizedUsername,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            ApplicationUserIdentity applicationUser;

            try
            {
                using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
                {
                    await connection.OpenAsync(cancellationToken);

                    if (connection.State != ConnectionState.Open) // verificação da conexão
                    {
                        throw new Exception("Não foi possível conectar ao banco de dados.");
                    }

                    applicationUser = await connection.QuerySingleOrDefaultAsync<ApplicationUserIdentity>(
                        "Account_GetByUsername", new { NormalizedUsername = normalizedUsername },
                        commandType: CommandType.StoredProcedure
                        );
                }
            }
            catch (Exception ex)
            {
                // tratamento de exceção
                throw ex;
            }

            return applicationUser;
        }

    }
}
