using Irriga.Models.Schedule;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Irriga.Repository
{
    public interface IScheduleRepository
    {
        public Task<Irrigation> UpsertAsync(IrrigationCreate irrigationCreate);
        public Task<List<Irrigation>> GetAllAsync();
        public Task<Irrigation> GetAsync(Guid id);
        public Task<List<Irrigation>> GetAllByUserIdAsync(int applicationUserId);
        public Task<int> DeleteAsync(Guid irrigationId);
        public Task<IrrigationHistory> InsertHistoryAsync(IrrigationHistoryCreate irrigationHistoryCreate);
        public Task<List<IrrigationHistory>> GetHistoryAllByUserIdAsync(int applicationUserId);
    }
}
