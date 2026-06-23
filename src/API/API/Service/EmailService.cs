using Core.Interfaces.Services;
using MimeKit;
using Resend;

namespace API.Service
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
       // private readonly IResend _resend;

        public EmailService(
            IConfiguration configuration
           // IResend resend
            )
        {
            _configuration = configuration;
          //  _resend = resend;
        }
        public async Task EnviaEmailAsync(string to, string subject, string body)
        {
            var from = _configuration["EmailSettings:From"];
            var host = _configuration["EmailSettings:Host"];
            var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");    
            var user = _configuration["EmailSettings:User"];
            var password = _configuration["EmailSettings:Password"];

            if(string.IsNullOrEmpty(from) || string.IsNullOrEmpty(host) || string.IsNullOrEmpty(user) || string.IsNullOrEmpty(password))
            {
                throw new InvalidOperationException("Configurações de email não estão definidas corretamente.");
            }

            
            var email = new MimeMessage();

            email.From.Add(MailboxAddress.Parse(from));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;

            email.Body = new TextPart("html")
            {
                Text = body
            };

            using var smtp = new MailKit.Net.Smtp.SmtpClient();

            await smtp.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(user, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

        }
    }
}
