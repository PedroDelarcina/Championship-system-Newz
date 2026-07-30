using System.Text.Json.Serialization;

namespace Core.Entities.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoCampeonato
    {
        ClansxClans,
        Solo,
        Duplas,
        Trios,
        Times
    }
}
