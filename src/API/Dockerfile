FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["InfestationTournament.slnx",            "."]
COPY ["API/API.csproj",          "API/"]
COPY ["Core/Core.csproj",  "Core/"]
COPY ["Infrastructure/Infrastructure.csproj",    "Infrastructure/"]

RUN dotnet restore "InfestationTournament.slnx"

COPY . .
RUN dotnet publish "API/API.csproj" \
    -c Release \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime


WORKDIR /app
COPY --from=build /app/publish .


EXPOSE 7180

ENTRYPOINT ["dotnet", "API.dll"]
