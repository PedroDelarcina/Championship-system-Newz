using Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<Usuario>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Campeonato> Campeonatos { get; set; }
        public DbSet<Time> Times { get; set; }
        public DbSet<Inscricao> Inscricoes { get; set; }
        public DbSet<PlayerTime> PlayerTimes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {

            builder.Entity<PlayerTime>()
               .HasKey(jt => new { jt.TimeId, jt.UsuarioId });

            builder.Entity<PlayerTime>()
                .HasOne(jt => jt.Time)
                .WithMany(t => t.Players)
                .HasForeignKey(jt => jt.TimeId);

            builder.Entity<PlayerTime>()
                .HasOne(jt => jt.Player)
                .WithMany()
                .HasForeignKey(jt => jt.UsuarioId);
        }
    }
}
