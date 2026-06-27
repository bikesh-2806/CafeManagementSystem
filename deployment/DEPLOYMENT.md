# MonsterASP.NET Deployment

1. Create a .NET 9 website and SQL Server database in the MonsterASP.NET control panel.
2. Replace the placeholders in `site/appsettings.Production.json` with the hosted SQL connection string and a strong random JWT key.
3. Execute `Database.sql` against the hosted database.
4. Upload all contents inside `site` to the website's `/wwwroot` directory.
5. Set the website runtime to .NET 9, restart the application pool, and enable HTTPS.

The Angular SPA is included in the API package and uses `/api` on the same domain.
