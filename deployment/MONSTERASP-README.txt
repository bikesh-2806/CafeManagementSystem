HOMETOWN CAFE - MONSTERASP.NET DEPLOYMENT
=========================================

PACKAGE
-------
Upload every file and folder from deployment/MonsterAsp directly into the
MonsterASP.NET website root (\wwwroot in FTP/WebFTP). Do not upload the
MonsterAsp directory as an additional nested folder.

DATABASE
--------
1. Create an MSSQL database in the MonsterASP.NET control panel.
2. Run DatabaseScripts/Database.sql once against an empty database.
3. Run DatabaseScripts/Incremental_MenuItems.sql to replace the demo menu.
4. Configure this environment variable through the control panel:

   ConnectionStrings__DefaultConnection

SECURITY
--------
Configure a long random JWT key through the control panel:

   Jwt__Key

Set the environment to Production:

   ASPNETCORE_ENVIRONMENT=Production

Move all passwords and private keys to control-panel environment variables
and remove them from source control before sharing the repository.

UPLOAD
------
Recommended: import the WebDeploy profile downloaded from the MonsterASP.NET
control panel into Visual Studio and publish the backend project.

FTP alternative:
1. Stop/restart the website or upload app_offline.htm before replacing files.
2. Upload the CONTENTS of this package to the remote \wwwroot directory.
3. Remove app_offline.htm after the upload.
4. Restart the website.

CHECKS
------
Website:  https://YOUR-SITE/
API:      https://YOUR-SITE/api/menu-items

Swagger is intentionally available only in Development.
