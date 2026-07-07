using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class UploadController : BaseController
    {
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        };

        private const long MaxFileSizeBytes = 2 * 1024 * 1024;

        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// Envia a logo de um time (PNG, JPG, WEBP ou GIF — máx. 2 MB).
        /// </summary>
        [HttpPost("logo")]
        [Authorize]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public async Task<IActionResult> UploadLogo(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Nenhum arquivo enviado." });

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { message = "A imagem deve ter no máximo 2 MB." });

            if (!AllowedContentTypes.Contains(file.ContentType))
                return BadRequest(new { message = "Formato inválido. Use PNG, JPG, WEBP ou GIF." });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension))
                extension = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/png" => ".png",
                    "image/webp" => ".webp",
                    "image/gif" => ".gif",
                    _ => ".png",
                };

            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "logos");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var url = $"/uploads/logos/{fileName}";
            _logger.LogInformation("Logo enviada por {UserId}: {Url}", GetUserId(), url);

            return Ok(new { url });
        }
    }
}
