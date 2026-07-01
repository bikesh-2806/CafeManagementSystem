# MonsterASP.NET deployment

Create the complete deployment package from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\deployment\Publish-MonsterAsp.ps1
```

The script generates:

- `deployment/MonsterAsp` — unpacked deployment directory;
- `deployment/MonsterAsp.zip` — uploadable ZIP containing the site files.

The package contains:

- the published ASP.NET Core API;
- the Angular production build under `wwwroot`;
- IIS/ASP.NET Core `web.config`;
- database scripts under `DatabaseScripts`;
- `MONSTERASP-README.txt` with upload and configuration instructions.

Upload the **contents** of `deployment/MonsterAsp` to the website root.

MonsterASP.NET supports importing its WebDeploy profile into Visual Studio,
or uploading application files to the remote `\wwwroot` folder using FTP/SFTP.
