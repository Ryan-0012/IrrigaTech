using Irriga.Identity;
using Irriga.Models.Account;
using Irriga.Repository;
using Irriga.Scheduler;
using Irriga.Services;
using IrrigaTech.Web.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace IrrigaTech.Web
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public Startup(IConfiguration config, ISchedulerService schedulerService) 
        {
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            Configuration = config;
        }

        public void ConfigureServices(IServiceCollection services) 
        {
            services.AddScoped<IScheduleRepository, ScheduleRepository>();
            services.AddScoped<IJob, IrrigationJob>();
            services.AddScoped<IrrigationJob>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ISchedulerService, SchedulerService>();
            services.AddScoped<SchedulerService>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddSingleton<IScheduler>(provider => {
                var schedulerFactory = new StdSchedulerFactory();
                return schedulerFactory.GetScheduler().GetAwaiter().GetResult();
            });

            services.AddIdentityCore<ApplicationUserIdentity>(options =>
            {
                options.Password.RequireNonAlphanumeric = false;
            })
                .AddUserStore<UserStore>()
                .AddDefaultTokenProviders()
                .AddSignInManager<SignInManager<ApplicationUserIdentity>>();

            services.AddControllers();
            services.AddCors();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer
                (
                    options =>
                    {
                        options.RequireHttpsMetadata = false;
                        options.SaveToken = true;
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = Configuration["Jwt:Issuer"],
                            ValidAudience = Configuration["Jwt:Issuer"],
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"])),
                            ClockSkew = TimeSpan.Zero
                        };
                    });

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment enviroment)
        {
            if (enviroment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseExceptionHandler("/Error");
            }
            //app.UseStaticFiles();

            app.ConfigureExceptionHandler();

            app.UseRouting();

            if (enviroment.IsDevelopment())
            {
                app.UseCors(options => options.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
            }
            else
            {
                app.UseCors();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
            //app.MapControllers();
            //app.MapRazorPages();

            QuartzConfig.Start().GetAwaiter().GetResult();
        }
    }
}
