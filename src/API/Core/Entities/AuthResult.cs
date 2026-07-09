using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public class AuthResult<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public IEnumerable<string>? Errors { get; set; }
        public int StatusCode { get; set; }
        public static AuthResult<T> SuccessResult(T data, string? message = null)
        {
            return new AuthResult<T> { Success = true, Data = data, Message = message, StatusCode = 200 };
        }
        public static AuthResult<T> FailureResult(string message, int statusCode = 400, IEnumerable<string>? errors = null)
        {
            return new AuthResult<T> { Success = false, Message = message, Errors = errors, StatusCode = statusCode };
        }
    }
}