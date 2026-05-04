using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Core.Interfaces.Repositories
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken);
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken);
        Task<T> AddAsync(T entity, CancellationToken cancellationToken);
        Task UpdateAsync(T entity, CancellationToken cancellationToken);
        Task DeleteAsync(T entity, CancellationToken cancellationToken);
        Task<bool> ExistAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken);
        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
    }
}
