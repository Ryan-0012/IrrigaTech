using Irriga.Models.Account;
using Irriga.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IrrigaTech.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly UserManager<ApplicationUserIdentity> _userManager;
        private readonly SignInManager<ApplicationUserIdentity> _signInManager;

        public AccountController(
            ITokenService tokenService,
            UserManager<ApplicationUserIdentity> userManager,
            SignInManager<ApplicationUserIdentity> signInManager)
        {
            _tokenService = tokenService;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApplicationUser>> Register(ApplicationUserCreate applicationUserCreate)
        {
            if (applicationUserCreate == null)
            {
                return BadRequest("Invalid input.");
            }

            var applicationUserIdentity = new ApplicationUserIdentity
            {
                Username = applicationUserCreate.Username,
                Email = applicationUserCreate.Email,
                Fullname = applicationUserCreate.Fullname
            };
            if (applicationUserIdentity != null)
            {
                var result = await _userManager.CreateAsync(applicationUserIdentity, applicationUserCreate.Password);

                if (result.Succeeded)
                {
                    applicationUserIdentity = await _userManager.FindByNameAsync(applicationUserCreate.Username);

                    applicationUserIdentity = await _userManager.FindByNameAsync(applicationUserCreate.Username);

                    if (applicationUserIdentity != null) // Check if applicationUserIdentity is not null
                    {
                        ApplicationUser applicationUser = new ApplicationUser()
                        {
                            ApplicationUserId = applicationUserIdentity.ApplicationUserId,
                            Username = applicationUserIdentity.Username,
                            Email = applicationUserIdentity.Email,
                            Fullname = applicationUserIdentity.Fullname,
                            Token = _tokenService.CreateToken(applicationUserIdentity)
                        };
                        return Ok(applicationUser);
                    }
                    else
                    {
                        return BadRequest("Failed to create user.");
                    }
                }
                return BadRequest(result.Errors);
            }
            else
            {
                return BadRequest("applicationUserIdentity is null");

            }

        }

        [HttpPost("login")]
        public async Task<ActionResult<ApplicationUser>> Login(ApplicationUserLogin applicationUserLogin)
        {
            Console.WriteLine("Aviso login");
            var applicationUserIdentity = await _userManager.FindByNameAsync(applicationUserLogin.Username);

            Console.WriteLine(applicationUserIdentity.Username);
            Console.WriteLine(applicationUserIdentity.Email);
            Console.WriteLine(applicationUserIdentity.Fullname);

            if (applicationUserIdentity != null)
            {
                Console.WriteLine();

                var result = await _signInManager.CheckPasswordSignInAsync(
                    applicationUserIdentity,
                    applicationUserLogin.Password, false);



                if (result.Succeeded)
                {

                    ApplicationUser applicationUser = new ApplicationUser
                    {
                        ApplicationUserId = applicationUserIdentity.ApplicationUserId,
                        Username = applicationUserIdentity.Username,
                        Email = applicationUserIdentity.Email,
                        Fullname = applicationUserIdentity.Fullname,
                        Token = _tokenService.CreateToken(applicationUserIdentity)
                    };
                    return Ok(applicationUser);
                }
                else
                {
                    BadRequest("Error login");
                }
            }
            return BadRequest("Invalid login attempt.");

        }
    }
}
