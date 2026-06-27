# HomeTown Cafe Restaurant Management System

Full-stack restaurant management system built with .NET Web API, Entity Framework Core, SQL Server, JWT authentication, role-based authorization, and Angular.

## Projects

- `backend/RestaurantManagement.Api` - .NET 9 Web API with EF Core SQL Server, Swagger, DTOs, services, seed data, and migrations.
- `frontend` - Angular app with routing, guards, JWT interceptor, responsive Admin, Staff/Waiter, and Customer areas.

## Seed Logins

- Admin: `admin@hometowncafe.com` / `Admin@123`
- Waiter: `waiter@hometowncafe.com` / `Waiter@123`
- Customer: `customer@hometowncafe.com` / `Customer@123`

## Backend Commands

```powershell
cd backend/RestaurantManagement.Api
dotnet restore
dotnet tool restore
dotnet ef database update
dotnet run
```

Swagger opens from the running API at:

```text
https://localhost:7019/swagger
```

Angular uses the API over HTTP by default to avoid local development certificate warnings:

```text
http://localhost:5116/api
```

If you prefer HTTPS, run `dotnet dev-certs https --trust` and update `frontend/src/environments/environment.ts` to use `https://localhost:7019/api`.

## Migration Commands

```powershell
cd backend/RestaurantManagement.Api
dotnet tool run dotnet-ef migrations add InitialCreate -o Migrations
dotnet tool run dotnet-ef database update
```

The default SQL Server connection string uses LocalDB:

```text
Server=(localdb)\MSSQLLocalDB;Database=HomeTownCafeDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

## Frontend Commands

```powershell
cd frontend
npm install
npm start
```

Angular runs at:

```text
http://localhost:4200
```

## Fonepay Dynamic QR

The Admin sidebar includes `Fonepay` configuration.

1. Enable Fonepay and select `Local demo`.
2. Save the configuration.
3. Open `Bills`, preview a bill, and select `Generate payment QR`.
4. The QR contains the bill's final amount and reference and is included when printing.

Demo QR codes are clearly marked and cannot receive payments. For real integration, switch to
`Fonepay API` and enter the merchant code, merchant secret, username, and password issued by
Fonepay or the acquiring bank. Credentials are encrypted by the backend and are never returned
to the Angular application.

The provider request follows the third-party Dynamic QR flow described at:

```text
https://blog.bwishernepal.com/implementing-dynamic-qr-code-payments-with-fonepay-nepal-in-node-js-a-complete-developer-guide/
```

This is an unofficial guide. Confirm endpoints, fields, signatures, and payment-status responses
against Fonepay's UAT document before enabling real payments.

## Included Features

- Register/login with PBKDF2 password hashing and JWT tokens.
- Role authorization for Admin, Waiter, Staff, and Customer.
- Admin management for users, menu categories, menu items, tables, orders, bills, and reports.
- Waiter/Staff table viewing, order creation, status updates, bill generation, and payment views.
- Customer menu browsing, order history, reservation creation, and profile page.
- EF Core code-first schema and initial migration.
- Consistent API responses: `{ success, message, data }`.
