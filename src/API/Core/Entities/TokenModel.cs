using System;
using System.Collections.Generic;
using System.Text;

namespace Core.Entities
{
    public class TokenModel
    {
        public DateTime GenerateAt { get; set; }
        public string Token { get; set; }
        public string Lang  { get; set; }
    }
}
