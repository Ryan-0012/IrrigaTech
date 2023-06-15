using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Services
{
    public interface ISchedulerService
    {
        public Task<int> LoadScheduledJobsFromDatabase();
    }
}
