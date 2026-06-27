IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [MenuCategories] (
        [CategoryId] int NOT NULL IDENTITY,
        [CategoryName] nvarchar(120) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_MenuCategories] PRIMARY KEY ([CategoryId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [RestaurantTables] (
        [TableId] int NOT NULL IDENTITY,
        [TableNumber] nvarchar(20) NOT NULL,
        [Capacity] int NOT NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_RestaurantTables] PRIMARY KEY ([TableId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [UserId] int NOT NULL IDENTITY,
        [FullName] nvarchar(120) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [PhoneNumber] nvarchar(30) NOT NULL,
        [Role] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [MenuItems] (
        [MenuItemId] int NOT NULL IDENTITY,
        [Name] nvarchar(150) NOT NULL,
        [Description] nvarchar(700) NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [CategoryId] int NOT NULL,
        [IsAvailable] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_MenuItems] PRIMARY KEY ([MenuItemId]),
        CONSTRAINT [FK_MenuItems_MenuCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [MenuCategories] ([CategoryId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [Orders] (
        [OrderId] int NOT NULL IDENTITY,
        [CustomerId] int NULL,
        [WaiterId] int NOT NULL,
        [TableId] int NOT NULL,
        [OrderStatus] int NOT NULL,
        [OrderDate] datetime2 NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([OrderId]),
        CONSTRAINT [FK_Orders_RestaurantTables_TableId] FOREIGN KEY ([TableId]) REFERENCES [RestaurantTables] ([TableId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Orders_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_Users_WaiterId] FOREIGN KEY ([WaiterId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [Reservations] (
        [ReservationId] int NOT NULL IDENTITY,
        [CustomerId] int NOT NULL,
        [TableId] int NOT NULL,
        [ReservationDate] datetime2 NOT NULL,
        [NumberOfGuests] int NOT NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_Reservations] PRIMARY KEY ([ReservationId]),
        CONSTRAINT [FK_Reservations_RestaurantTables_TableId] FOREIGN KEY ([TableId]) REFERENCES [RestaurantTables] ([TableId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Reservations_Users_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [Bills] (
        [BillId] int NOT NULL IDENTITY,
        [OrderId] int NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [DiscountAmount] decimal(18,2) NOT NULL,
        [TaxAmount] decimal(18,2) NOT NULL,
        [FinalAmount] decimal(18,2) NOT NULL,
        [PaymentStatus] int NOT NULL,
        [PaymentMethod] int NOT NULL,
        [BillDate] datetime2 NOT NULL,
        CONSTRAINT [PK_Bills] PRIMARY KEY ([BillId]),
        CONSTRAINT [FK_Bills_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [OrderItemId] int NOT NULL IDENTITY,
        [OrderId] int NOT NULL,
        [MenuItemId] int NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [SubTotal] decimal(18,2) NOT NULL,
        [SpecialNote] nvarchar(500) NOT NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([OrderItemId]),
        CONSTRAINT [FK_OrderItems_MenuItems_MenuItemId] FOREIGN KEY ([MenuItemId]) REFERENCES [MenuItems] ([MenuItemId]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CategoryId', N'CategoryName', N'Description', N'IsActive') AND [object_id] = OBJECT_ID(N'[MenuCategories]'))
        SET IDENTITY_INSERT [MenuCategories] ON;
    EXEC(N'INSERT INTO [MenuCategories] ([CategoryId], [CategoryName], [Description], [IsActive])
    VALUES (1, N''Breakfast'', N''Morning favorites'', CAST(1 AS bit)),
    (2, N''Mains'', N''Lunch and dinner plates'', CAST(1 AS bit)),
    (3, N''Drinks'', N''Coffee, tea, and cold drinks'', CAST(1 AS bit))');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CategoryId', N'CategoryName', N'Description', N'IsActive') AND [object_id] = OBJECT_ID(N'[MenuCategories]'))
        SET IDENTITY_INSERT [MenuCategories] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'TableId', N'Capacity', N'Status', N'TableNumber') AND [object_id] = OBJECT_ID(N'[RestaurantTables]'))
        SET IDENTITY_INSERT [RestaurantTables] ON;
    EXEC(N'INSERT INTO [RestaurantTables] ([TableId], [Capacity], [Status], [TableNumber])
    VALUES (1, 2, 0, N''T-01''),
    (2, 4, 0, N''T-02''),
    (3, 6, 0, N''T-03'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'TableId', N'Capacity', N'Status', N'TableNumber') AND [object_id] = OBJECT_ID(N'[RestaurantTables]'))
        SET IDENTITY_INSERT [RestaurantTables] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'UserId', N'CreatedAt', N'Email', N'FullName', N'IsActive', N'PasswordHash', N'PhoneNumber', N'Role') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] ON;
    EXEC(N'INSERT INTO [Users] ([UserId], [CreatedAt], [Email], [FullName], [IsActive], [PasswordHash], [PhoneNumber], [Role])
    VALUES (1, ''2026-01-01T00:00:00.0000000'', N''admin@hometowncafe.com'', N''System Admin'', CAST(1 AS bit), N''YWRtaW4tc2VlZC1zYWx0LQ==.tlfGrAOTDjJqE/KuLasAOSqSkKTgcPXEgfmwk/6JPI0='', N''9800000000'', 0),
    (2, ''2026-01-01T00:00:00.0000000'', N''waiter@hometowncafe.com'', N''Demo Waiter'', CAST(1 AS bit), N''d2FpdGVyLXNlZWQtc2FsdA==.cKCgvaDzxIoQA7z6rU5twjGtsMz5igq6QKc50p2fC1Q='', N''9800000001'', 1),
    (3, ''2026-01-01T00:00:00.0000000'', N''customer@hometowncafe.com'', N''Demo Customer'', CAST(1 AS bit), N''Y3VzdG9tZXItc2VlZC0xeA==.lJN2SqO73GkoHEM3Aj382qOiIrk1kmiJelQR7zIENG4='', N''9800000002'', 3)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'UserId', N'CreatedAt', N'Email', N'FullName', N'IsActive', N'PasswordHash', N'PhoneNumber', N'Role') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'MenuItemId', N'CategoryId', N'CreatedAt', N'Description', N'ImageUrl', N'IsAvailable', N'Name', N'Price') AND [object_id] = OBJECT_ID(N'[MenuItems]'))
        SET IDENTITY_INSERT [MenuItems] ON;
    EXEC(N'INSERT INTO [MenuItems] ([MenuItemId], [CategoryId], [CreatedAt], [Description], [ImageUrl], [IsAvailable], [Name], [Price])
    VALUES (1, 1, ''2026-01-01T00:00:00.0000000'', N''Eggs with herbs and spices'', N''assets/menu/omelette.jpg'', CAST(1 AS bit), N''Masala Omelette'', 350.0),
    (2, 2, ''2026-01-01T00:00:00.0000000'', N''Steamed dumplings with achar'', N''assets/menu/momo.jpg'', CAST(1 AS bit), N''Chicken Momo'', 520.0),
    (3, 3, ''2026-01-01T00:00:00.0000000'', N''Espresso with steamed milk'', N''assets/menu/latte.jpg'', CAST(1 AS bit), N''Cafe Latte'', 240.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'MenuItemId', N'CategoryId', N'CreatedAt', N'Description', N'ImageUrl', N'IsAvailable', N'Name', N'Price') AND [object_id] = OBJECT_ID(N'[MenuItems]'))
        SET IDENTITY_INSERT [MenuItems] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Bills_OrderId] ON [Bills] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MenuItems_CategoryId] ON [MenuItems] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_MenuItemId] ON [OrderItems] ([MenuItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_CustomerId] ON [Orders] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_TableId] ON [Orders] ([TableId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_WaiterId] ON [Orders] ([WaiterId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reservations_CustomerId] ON [Reservations] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reservations_TableId] ON [Reservations] ([TableId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260603134413_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260603134413_InitialCreate', N'9.0.16');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627182729_AddFonepayConfiguration'
)
BEGIN
    CREATE TABLE [PaymentGatewayConfigurations] (
        [PaymentGatewayConfigurationId] int NOT NULL IDENTITY,
        [IsEnabled] bit NOT NULL,
        [UseDemoMode] bit NOT NULL,
        [BaseUrl] nvarchar(500) NOT NULL,
        [MerchantCode] nvarchar(200) NOT NULL,
        [ProtectedMerchantSecret] nvarchar(max) NOT NULL,
        [ProtectedUsername] nvarchar(max) NOT NULL,
        [ProtectedPassword] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_PaymentGatewayConfigurations] PRIMARY KEY ([PaymentGatewayConfigurationId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260627182729_AddFonepayConfiguration'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260627182729_AddFonepayConfiguration', N'9.0.16');
END;

COMMIT;
GO

