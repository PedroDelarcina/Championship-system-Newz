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

            base.OnModelCreating(builder);

            builder.Entity<PlayerTime>(entity =>
            {
                entity.HasKey(jt => new { jt.TimeId, jt.UsuarioId });

                entity.HasOne(jt => jt.Time)
                    .WithMany(t => t.Players)
                    .HasForeignKey(jt => jt.TimeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(jt => jt.Player)
                    .WithMany() 
                    .HasForeignKey(jt => jt.UsuarioId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            builder.Entity<Inscricao>(entity =>
            {
                entity.HasOne(i => i.Campeonato)
                    .WithMany(c => c.Inscricoes)
                    .HasForeignKey(i => i.CampeonatoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.Time)
                    .WithMany(t => t.Inscricoes)
                    .HasForeignKey(i => i.TimeId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.Usuario)
                    .WithMany(u => u.Inscricoes)
                    .HasForeignKey(i => i.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });


            builder.Entity<Time>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Nome).IsRequired().HasMaxLength(100);
                entity.Property(t => t.Clantag).HasMaxLength(20);

                entity.HasIndex(t => t.Nome).IsUnique();
            });


            builder.Entity<Campeonato>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Nome).IsRequired().HasMaxLength(100);
                entity.Property(c => c.TipoCampeonato).IsRequired().HasMaxLength(50);

                
                entity.HasIndex(c => c.DataInicio);
                entity.HasIndex(c => c.IsAtivo);
            });


            builder.Entity<Usuario>(entity =>
            {
                entity.Property(u => u.NickName).HasMaxLength(50);
                entity.HasIndex(u => u.NickName).IsUnique();
            });

            builder.Entity<PlayerTime>()
                   .HasIndex(pt => pt.UsuarioId)
                   .IsUnique();
        }
    }
}
