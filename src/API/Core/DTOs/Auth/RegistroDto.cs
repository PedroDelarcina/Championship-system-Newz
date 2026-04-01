using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Core.DTOs.Auth
{
    public class RegistroDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha é obrigatória")]
        [MinLength(6, ErrorMessage = "Senha deve ter no mínimo 6 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirmação de senha é obrigatória")]
        [Compare("Password", ErrorMessage = "Senhas não conferem")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nickname é obrigatório")]
        [MinLength(3, ErrorMessage = "Nickname deve ter no mínimo 3 caracteres")]
        [MaxLength(50, ErrorMessage = "Nickname deve ter no máximo 50 caracteres")]
        public string Nickname { get; set; } = string.Empty;

    }
}
