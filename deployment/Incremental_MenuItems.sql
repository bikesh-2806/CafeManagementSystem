/*
    Incremental Home Town Cafe menu import.
    Safe to run repeatedly: categories are matched by CategoryName and menu items
    by CategoryId + Name. Existing matches are updated; missing rows are inserted.

    ImageKey is retained as the intended local filename for each individual item.
    ImageUrl is left empty until that item's real photo is uploaded. Do not use
    random placeholder-photo services for restaurant menu items.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /*
        Replace the old menu catalog before importing the new one.
        MenuItems -> OrderItems uses cascade delete, so do not silently erase
        historical order details when this script is run on a live database.
    */
    IF EXISTS (SELECT 1 FROM dbo.OrderItems)
    BEGIN
        ;THROW 51000,
            'Old menu data was not deleted because OrderItems contains order history. Archive/clear orders first, then run this script again.',
            1;
    END;

    DELETE FROM dbo.MenuItems;
    DELETE FROM dbo.MenuCategories;

    DBCC CHECKIDENT ('dbo.MenuItems', RESEED, 0) WITH NO_INFOMSGS;
    DBCC CHECKIDENT ('dbo.MenuCategories', RESEED, 0) WITH NO_INFOMSGS;

    DECLARE @Categories TABLE
    (
        CategoryName nvarchar(100) NOT NULL,
        Description nvarchar(500) NOT NULL
    );

    INSERT INTO @Categories (CategoryName, Description)
    VALUES
        (N'Hot Beverages', N'Tea, coffee, milk, and hot drinks'),
        (N'Assorted Drinks', N'Cold beverages, juice, shakes, and energy drinks'),
        (N'Breakfast', N'Eggs and breakfast sandwiches'),
        (N'Soup', N'Vegetarian and chicken soups'),
        (N'Snacks', N'Salads and freshly prepared snacks'),
        (N'Mo-Mo', N'Steamed, fried, chilli, jhol, and kothey momo'),
        (N'Thukpa', N'Nepali-style noodle soup'),
        (N'Oriental', N'Rice and noodle dishes'),
        (N'Pizza, Rolls & Hot Dogs', N'Pizza, rolls, and hot dogs'),
        (N'Nepali Thali & Khaja Set', N'Thakali meals and khaja sets'),
        (N'Breads', N'Fresh tawa breads'),
        (N'Indian', N'Indian curries, dal, and rice'),
        (N'Per Kg', N'Meat dishes priced per kilogram'),
        (N'Starter Non-Veg', N'Non-vegetarian starters'),
        (N'Domestic Whisky', N'Domestic whisky'),
        (N'Domestic Vodka', N'Domestic vodka'),
        (N'Gin', N'Gin'),
        (N'Rum', N'Rum'),
        (N'Beer', N'Beer'),
        (N'Wine', N'Wine'),
        (N'Cigarette & Shisha', N'Cigarettes, hukkah, and accessories');

    MERGE dbo.MenuCategories AS target
    USING @Categories AS source
       ON target.CategoryName = source.CategoryName
    WHEN MATCHED THEN
        UPDATE SET Description = source.Description, IsActive = 1
    WHEN NOT MATCHED THEN
        INSERT (CategoryName, Description, IsActive)
        VALUES (source.CategoryName, source.Description, 1);

    DECLARE @Items TABLE
    (
        CategoryName nvarchar(100) NOT NULL,
        Name nvarchar(200) NOT NULL,
        Description nvarchar(500) NOT NULL,
        Price decimal(18,2) NOT NULL,
        ImageKey varchar(120) NOT NULL
    );

    INSERT INTO @Items (CategoryName, Name, Description, Price, ImageKey)
    VALUES
        (N'Hot Beverages', N'Black Tea', N'Freshly brewed black tea', 30, 'black-tea-cup'),
        (N'Hot Beverages', N'Lemon Tea', N'Hot tea with lemon', 40, 'lemon-tea-cup'),
        (N'Hot Beverages', N'Green Tea', N'Freshly brewed green tea', 70, 'green-tea-cup'),
        (N'Hot Beverages', N'Milk Tea', N'Classic milk tea', 50, 'milk-tea-cup'),
        (N'Hot Beverages', N'Espresso Single Shot', N'Single espresso shot', 100, 'single-espresso-shot'),
        (N'Hot Beverages', N'Espresso Double Shot', N'Double espresso shot', 160, 'double-espresso-shot'),
        (N'Hot Beverages', N'Americano', N'Espresso with hot water', 160, 'americano-coffee'),
        (N'Hot Beverages', N'Cappuccino', N'Espresso with steamed milk foam', 180, 'cappuccino-coffee'),
        (N'Hot Beverages', N'Hot Milk', N'Warm milk', 80, 'hot-milk-glass'),
        (N'Hot Beverages', N'Hot Lemon', N'Warm lemon drink', 50, 'hot-lemon-drink'),
        (N'Hot Beverages', N'Hot Lemon with Honey', N'Warm lemon and honey drink', 100, 'hot-lemon-honey'),
        (N'Hot Beverages', N'Hot Chocolate', N'Rich hot chocolate', 150, 'hot-chocolate-cup'),

        (N'Assorted Drinks', N'Water', N'Bottled drinking water', 30, 'bottled-water'),
        (N'Assorted Drinks', N'Assorted Beverage 250ml', N'Coke, Fanta, Sprite, Dew, or Soda', 70, 'soft-drink-250ml'),
        (N'Assorted Drinks', N'Assorted Beverage 1000ml', N'Coke, Fanta, Sprite, Dew, or Slice', 200, 'soft-drink-1-liter'),
        (N'Assorted Drinks', N'Badam Juice', N'Chilled almond drink', 120, 'badam-almond-juice'),
        (N'Assorted Drinks', N'Frooti', N'Mango fruit drink', 30, 'mango-frooti-drink'),
        (N'Assorted Drinks', N'Real Juice Glass', N'Fruit juice served by the glass', 125, 'fruit-juice-glass'),
        (N'Assorted Drinks', N'Real Juice 1 Liter', N'One-liter fruit juice pack', 400, 'fruit-juice-one-liter'),
        (N'Assorted Drinks', N'Peach Iced Tea', N'Chilled peach-flavored iced tea', 140, 'peach-iced-tea'),
        (N'Assorted Drinks', N'Mint Lemonade', N'Fresh mint and lemon cooler', 120, 'mint-lemonade'),
        (N'Assorted Drinks', N'Vanilla Milkshake', N'Vanilla-flavored milkshake', 150, 'vanilla-milkshake'),
        (N'Assorted Drinks', N'Strawberry Milkshake', N'Strawberry-flavored milkshake', 150, 'strawberry-milkshake'),
        (N'Assorted Drinks', N'Chocolate Milkshake', N'Chocolate-flavored milkshake', 150, 'chocolate-milkshake'),
        (N'Assorted Drinks', N'Plain Lassi', N'Plain yogurt drink', 100, 'plain-lassi'),
        (N'Assorted Drinks', N'Sweet Lassi', N'Sweet yogurt drink', 100, 'sweet-lassi'),
        (N'Assorted Drinks', N'Salted Lassi', N'Salted yogurt drink', 100, 'salted-lassi'),
        (N'Assorted Drinks', N'Red Bull Energy Drink', N'Chilled energy drink', 150, 'red-bull-energy-drink'),
        (N'Assorted Drinks', N'Xtreme Energy Drink', N'Chilled energy drink', 180, 'xtreme-energy-drink'),

        (N'Breakfast', N'Boiled Egg', N'Boiled egg', 30, 'boiled-egg'),
        (N'Breakfast', N'Poached Egg', N'Poached egg', 30, 'poached-egg'),
        (N'Breakfast', N'Omelette', N'Freshly cooked omelette', 35, 'plain-omelette'),
        (N'Breakfast', N'Veg Sandwich', N'Fresh vegetable sandwich', 100, 'vegetable-sandwich'),
        (N'Breakfast', N'Chicken Sandwich', N'Chicken-filled sandwich', 200, 'chicken-sandwich'),

        (N'Soup', N'Veg Soup', N'Vegetable soup', 130, 'vegetable-soup'),
        (N'Soup', N'Mushroom Soup', N'Mushroom soup', 150, 'mushroom-soup'),
        (N'Soup', N'Mushroom Manchow Soup', N'Spicy mushroom Manchow soup', 180, 'mushroom-manchow-soup'),
        (N'Soup', N'Mushroom Hot & Sour Soup', N'Hot and sour mushroom soup', 160, 'mushroom-hot-sour-soup'),
        (N'Soup', N'Chicken Soup', N'Chicken soup', 150, 'chicken-soup'),
        (N'Soup', N'Chicken Manchow Soup', N'Spicy chicken Manchow soup', 200, 'chicken-manchow-soup'),
        (N'Soup', N'Chicken Hot & Sour Soup', N'Hot and sour chicken soup', 170, 'chicken-hot-sour-soup'),

        (N'Snacks', N'Green Salad', N'Seasonal green salad', 120, 'seasonal-green-salad'),
        (N'Snacks', N'Nepali Salad', N'Fresh Nepali-style salad', 130, 'nepali-salad'),
        (N'Snacks', N'Fruit Salad', N'Seasonal fruit salad', 170, 'seasonal-fruit-salad'),
        (N'Snacks', N'Popcorn', N'Fresh popcorn', 70, 'plain-popcorn'),
        (N'Snacks', N'Butter Popcorn', N'Popcorn with butter', 100, 'butter-popcorn'),
        (N'Snacks', N'Veg Pakoda', N'Crispy vegetable fritters', 150, 'vegetable-pakoda'),
        (N'Snacks', N'Sweet Corn', N'Seasoned sweet corn', 200, 'sweet-corn-snack'),
        (N'Snacks', N'French Fries', N'Crispy fried potatoes', 100, 'french-fries'),
        (N'Snacks', N'Chilli French Fries', N'French fries tossed with chilli sauce', 150, 'chilli-french-fries'),
        (N'Snacks', N'Peanut Sadeko', N'Spiced Nepali-style peanuts', 120, 'peanut-sadeko'),
        (N'Snacks', N'Bhatmas Sadeko', N'Spiced Nepali-style soybeans', 100, 'bhatmas-sadeko'),
        (N'Snacks', N'Paneer Pakoda', N'Crispy paneer fritters', 290, 'paneer-pakoda'),
        (N'Snacks', N'Mushroom Chilli', N'Mushroom tossed in chilli sauce', 300, 'mushroom-chilli'),
        (N'Snacks', N'Veg Manchurian', N'Vegetable Manchurian', 250, 'vegetable-manchurian'),
        (N'Snacks', N'Paneer Chilli', N'Paneer tossed in chilli sauce', 380, 'paneer-chilli'),
        (N'Snacks', N'Paneer Manchurian', N'Paneer Manchurian', 380, 'paneer-manchurian'),

        (N'Mo-Mo', N'Steam Veg Momo', N'Steamed vegetable momo', 120, 'steamed-vegetable-momo'),
        (N'Mo-Mo', N'Steam Chicken Momo', N'Steamed chicken momo', 170, 'steamed-chicken-momo'),
        (N'Mo-Mo', N'Steam Mutton Momo', N'Steamed mutton momo', 220, 'steamed-mutton-momo'),
        (N'Mo-Mo', N'Fried Veg Momo', N'Fried vegetable momo', 140, 'fried-vegetable-momo'),
        (N'Mo-Mo', N'Fried Chicken Momo', N'Fried chicken momo', 190, 'fried-chicken-momo'),
        (N'Mo-Mo', N'Fried Mutton Momo', N'Fried mutton momo', 240, 'fried-mutton-momo'),
        (N'Mo-Mo', N'Chilli Veg Momo', N'Vegetable momo tossed in chilli sauce', 160, 'chilli-vegetable-momo'),
        (N'Mo-Mo', N'Chilli Chicken Momo', N'Chicken momo tossed in chilli sauce', 200, 'chilli-chicken-momo'),
        (N'Mo-Mo', N'Chilli Mutton Momo', N'Mutton momo tossed in chilli sauce', 250, 'chilli-mutton-momo'),
        (N'Mo-Mo', N'Jhol Veg Momo', N'Vegetable momo in jhol achar', 160, 'jhol-vegetable-momo'),
        (N'Mo-Mo', N'Jhol Chicken Momo', N'Chicken momo in jhol achar', 200, 'jhol-chicken-momo'),
        (N'Mo-Mo', N'Jhol Mutton Momo', N'Mutton momo in jhol achar', 250, 'jhol-mutton-momo'),
        (N'Mo-Mo', N'Kothey Veg Momo', N'Pan-fried vegetable momo', 160, 'kothey-vegetable-momo'),
        (N'Mo-Mo', N'Kothey Chicken Momo', N'Pan-fried chicken momo', 200, 'kothey-chicken-momo'),
        (N'Mo-Mo', N'Kothey Mutton Momo', N'Pan-fried mutton momo', 250, 'kothey-mutton-momo'),

        (N'Thukpa', N'Veg Thukpa', N'Vegetable noodle soup', 150, 'vegetable-thukpa'),
        (N'Thukpa', N'Chicken Thukpa', N'Chicken noodle soup', 200, 'chicken-thukpa'),
        (N'Thukpa', N'Mutton Thukpa', N'Mutton noodle soup', 300, 'mutton-thukpa'),

        (N'Oriental', N'Veg Noodles - Half', N'Half portion', 90, 'vegetable-noodles-half'),
        (N'Oriental', N'Veg Noodles - Full', N'Full portion', 170, 'vegetable-noodles-full'),
        (N'Oriental', N'Veg Schezwan Noodles - Half', N'Half portion', 100, 'vegetable-schezwan-noodles-half'),
        (N'Oriental', N'Veg Schezwan Noodles - Full', N'Full portion', 190, 'vegetable-schezwan-noodles-full'),
        (N'Oriental', N'Mushroom Noodles - Half', N'Half portion', 130, 'mushroom-noodles-half'),
        (N'Oriental', N'Mushroom Noodles - Full', N'Full portion', 250, 'mushroom-noodles-full'),
        (N'Oriental', N'Mushroom Schezwan Noodles - Half', N'Half portion', 140, 'mushroom-schezwan-noodles-half'),
        (N'Oriental', N'Mushroom Schezwan Noodles - Full', N'Full portion', 270, 'mushroom-schezwan-noodles-full'),
        (N'Oriental', N'Paneer Noodles - Half', N'Half portion', 150, 'paneer-noodles-half'),
        (N'Oriental', N'Paneer Noodles - Full', N'Full portion', 290, 'paneer-noodles-full'),
        (N'Oriental', N'Paneer Schezwan Noodles - Half', N'Half portion', 160, 'paneer-schezwan-noodles-half'),
        (N'Oriental', N'Paneer Schezwan Noodles - Full', N'Full portion', 310, 'paneer-schezwan-noodles-full'),
        (N'Oriental', N'Egg Noodles - Half', N'Half portion', 110, 'egg-noodles-half'),
        (N'Oriental', N'Egg Noodles - Full', N'Full portion', 210, 'egg-noodles-full'),
        (N'Oriental', N'Egg Schezwan Noodles - Half', N'Half portion', 120, 'egg-schezwan-noodles-half'),
        (N'Oriental', N'Egg Schezwan Noodles - Full', N'Full portion', 230, 'egg-schezwan-noodles-full'),
        (N'Oriental', N'Chicken Noodles - Half', N'Half portion', 140, 'chicken-noodles-half'),
        (N'Oriental', N'Chicken Noodles - Full', N'Full portion', 270, 'chicken-noodles-full'),
        (N'Oriental', N'Chicken Schezwan Noodles - Half', N'Half portion', 150, 'chicken-schezwan-noodles-half'),
        (N'Oriental', N'Chicken Schezwan Noodles - Full', N'Full portion', 290, 'chicken-schezwan-noodles-full'),
        (N'Oriental', N'Veg Fried Rice - Half', N'Half portion', 100, 'vegetable-fried-rice-half'),
        (N'Oriental', N'Veg Fried Rice - Full', N'Full portion', 190, 'vegetable-fried-rice-full'),
        (N'Oriental', N'Veg Schezwan Fried Rice - Half', N'Half portion', 110, 'vegetable-schezwan-fried-rice-half'),
        (N'Oriental', N'Veg Schezwan Fried Rice - Full', N'Full portion', 210, 'vegetable-schezwan-fried-rice-full'),
        (N'Oriental', N'Mushroom Fried Rice - Half', N'Half portion', 140, 'mushroom-fried-rice-half'),
        (N'Oriental', N'Mushroom Fried Rice - Full', N'Full portion', 270, 'mushroom-fried-rice-full'),
        (N'Oriental', N'Mushroom Schezwan Fried Rice - Half', N'Half portion', 150, 'mushroom-schezwan-fried-rice-half'),
        (N'Oriental', N'Mushroom Schezwan Fried Rice - Full', N'Full portion', 290, 'mushroom-schezwan-fried-rice-full'),
        (N'Oriental', N'Paneer Fried Rice - Half', N'Half portion', 160, 'paneer-fried-rice-half'),
        (N'Oriental', N'Paneer Fried Rice - Full', N'Full portion', 310, 'paneer-fried-rice-full'),
        (N'Oriental', N'Paneer Schezwan Fried Rice - Half', N'Half portion', 170, 'paneer-schezwan-fried-rice-half'),
        (N'Oriental', N'Paneer Schezwan Fried Rice - Full', N'Full portion', 330, 'paneer-schezwan-fried-rice-full'),
        (N'Oriental', N'Egg Fried Rice - Half', N'Half portion', 130, 'egg-fried-rice-half'),
        (N'Oriental', N'Egg Fried Rice - Full', N'Full portion', 250, 'egg-fried-rice-full'),
        (N'Oriental', N'Egg Schezwan Fried Rice - Half', N'Half portion', 140, 'egg-schezwan-fried-rice-half'),
        (N'Oriental', N'Egg Schezwan Fried Rice - Full', N'Full portion', 270, 'egg-schezwan-fried-rice-full'),
        (N'Oriental', N'Chicken Fried Rice - Half', N'Half portion', 150, 'chicken-fried-rice-half'),
        (N'Oriental', N'Chicken Fried Rice - Full', N'Full portion', 290, 'chicken-fried-rice-full'),
        (N'Oriental', N'Chicken Schezwan Fried Rice - Half', N'Half portion', 160, 'chicken-schezwan-fried-rice-half'),
        (N'Oriental', N'Chicken Schezwan Fried Rice - Full', N'Full portion', 310, 'chicken-schezwan-fried-rice-full'),
        (N'Oriental', N'Chicken Triple Rice', N'Chicken triple rice', 270, 'chicken-triple-rice'),
        (N'Oriental', N'Chicken Chilli Rice', N'Chicken chilli rice', 230, 'chicken-chilli-rice'),
        (N'Oriental', N'Paneer Chilli Rice', N'Paneer chilli rice', 230, 'paneer-chilli-rice'),

        (N'Pizza, Rolls & Hot Dogs', N'Veg Pizza', N'Vegetable pizza', 400, 'vegetable-pizza'),
        (N'Pizza, Rolls & Hot Dogs', N'Chicken Pizza', N'Chicken pizza', 450, 'chicken-pizza'),
        (N'Pizza, Rolls & Hot Dogs', N'Cheese Pizza', N'Cheese pizza', 450, 'cheese-pizza'),
        (N'Pizza, Rolls & Hot Dogs', N'Extra Cheese', N'Extra cheese topping', 100, 'extra-cheese-topping'),
        (N'Pizza, Rolls & Hot Dogs', N'Veg Roll', N'Vegetable roll', 150, 'vegetable-roll'),
        (N'Pizza, Rolls & Hot Dogs', N'Egg Roll', N'Egg roll', 180, 'egg-roll'),
        (N'Pizza, Rolls & Hot Dogs', N'Chicken Roll', N'Chicken roll', 250, 'chicken-roll'),
        (N'Pizza, Rolls & Hot Dogs', N'Hot Dog', N'Classic hot dog', 120, 'classic-hot-dog'),
        (N'Pizza, Rolls & Hot Dogs', N'Corn Dog', N'Crispy corn dog', 150, 'corn-dog'),

        (N'Nepali Thali & Khaja Set', N'Veg Thakali Khana', N'Vegetarian Thakali meal', 250, 'vegetable-thakali-khana'),
        (N'Nepali Thali & Khaja Set', N'Chicken Thakali Khana', N'Chicken Thakali meal', 400, 'chicken-thakali-khana'),
        (N'Nepali Thali & Khaja Set', N'Local Chicken Thakali Khana', N'Local chicken Thakali meal', 450, 'local-chicken-thakali-khana'),
        (N'Nepali Thali & Khaja Set', N'Mutton Thakali Khana', N'Mutton Thakali meal', 450, 'mutton-thakali-khana'),
        (N'Nepali Thali & Khaja Set', N'Veg Khaja Set', N'Vegetarian Nepali khaja set', 200, 'vegetable-khaja-set'),
        (N'Nepali Thali & Khaja Set', N'Chicken Khaja Set', N'Chicken Nepali khaja set', 350, 'chicken-khaja-set'),

        (N'Breads', N'Fulka Tawa Roti', N'Fresh tawa roti', 20, 'fulka-tawa-roti'),
        (N'Breads', N'Butter Fulka Tawa Roti', N'Tawa roti with butter', 30, 'butter-fulka-tawa-roti'),

        (N'Indian', N'Dal Fry', N'Fried lentil curry', 100, 'dal-fry'),
        (N'Indian', N'Jeera Aloo', N'Potatoes with cumin', 150, 'jeera-aloo'),
        (N'Indian', N'Mix Veg Curry', N'Mixed vegetable curry', 150, 'mixed-vegetable-curry'),
        (N'Indian', N'Paneer Butter Masala', N'Paneer in a creamy tomato gravy', 360, 'paneer-butter-masala'),
        (N'Indian', N'Kadai Paneer', N'Kadai-style paneer curry', 320, 'kadai-paneer'),
        (N'Indian', N'Matar Paneer', N'Pea and paneer curry', 350, 'matar-paneer'),
        (N'Indian', N'Mushroom Curry', N'Mushroom curry', 250, 'mushroom-curry'),
        (N'Indian', N'Chicken Curry', N'Chicken curry', 320, 'chicken-curry'),
        (N'Indian', N'Butter Chicken', N'Chicken in a creamy butter gravy', 360, 'butter-chicken'),
        (N'Indian', N'Kadai Chicken', N'Kadai-style chicken curry', 340, 'kadai-chicken'),
        (N'Indian', N'Mutton Curry', N'Mutton curry', 470, 'mutton-curry'),
        (N'Indian', N'Plain Rice', N'Steamed rice', 120, 'plain-steamed-rice'),
        (N'Indian', N'Jeera Rice', N'Cumin-flavored rice', 150, 'jeera-rice'),

        (N'Per Kg', N'Chicken Gravy - 1 Kg', N'One kilogram', 700, 'chicken-gravy-one-kilogram'),
        (N'Per Kg', N'Local Chicken - 1 Kg', N'One kilogram', 1400, 'local-chicken-one-kilogram'),
        (N'Per Kg', N'Mutton Gravy - 1 Kg', N'One kilogram', 1400, 'mutton-gravy-one-kilogram'),
        (N'Per Kg', N'Boneless Mutton Gravy - 1 Kg', N'One kilogram', 1650, 'boneless-mutton-gravy-one-kilogram'),

        (N'Starter Non-Veg', N'Chicken Tass', N'Nepali-style chicken tass', 320, 'chicken-tass'),
        (N'Starter Non-Veg', N'Mutton Tass', N'Nepali-style mutton tass', 420, 'mutton-tass'),
        (N'Starter Non-Veg', N'Chicken Sekwa', N'Grilled chicken sekuwa', 350, 'chicken-sekuwa'),
        (N'Starter Non-Veg', N'Mutton Sekwa', N'Grilled mutton sekuwa', 450, 'mutton-sekuwa'),
        (N'Starter Non-Veg', N'Bhutan', N'Nepali-style spiced offal', 320, 'nepali-bhutan'),
        (N'Starter Non-Veg', N'Pangra Fry', N'Fried chicken gizzard', 340, 'pangra-fry'),
        (N'Starter Non-Veg', N'Chicken Sadeko', N'Spiced Nepali-style chicken', 340, 'chicken-sadeko'),
        (N'Starter Non-Veg', N'Chicken Roast', N'Roasted chicken', 320, 'chicken-roast'),
        (N'Starter Non-Veg', N'Chicken Crispy', N'Crispy chicken', 360, 'crispy-chicken'),
        (N'Starter Non-Veg', N'Dragon Chicken', N'Spicy dragon chicken', 340, 'dragon-chicken'),
        (N'Starter Non-Veg', N'Chilli Chicken', N'Chicken tossed in chilli sauce', 380, 'chilli-chicken'),
        (N'Starter Non-Veg', N'Chicken Manchurian', N'Chicken Manchurian', 380, 'chicken-manchurian'),
        (N'Starter Non-Veg', N'Chicken 65', N'Spicy fried chicken', 400, 'chicken-65'),
        (N'Starter Non-Veg', N'Deep Fried Chicken Lollipop', N'Deep-fried chicken lollipop', 360, 'deep-fried-chicken-lollipop'),
        (N'Starter Non-Veg', N'Schezwan Chicken Lollipop', N'Schezwan chicken lollipop', 380, 'schezwan-chicken-lollipop'),
        (N'Starter Non-Veg', N'Deep Fried Chicken Wings', N'Deep-fried chicken wings', 350, 'deep-fried-chicken-wings'),
        (N'Starter Non-Veg', N'Schezwan Chicken Wings', N'Schezwan chicken wings', 370, 'schezwan-chicken-wings'),
        (N'Starter Non-Veg', N'Chicken Sausage', N'Price per piece', 60, 'chicken-sausage'),
        (N'Starter Non-Veg', N'Chilli Sausage', N'Sausage tossed in chilli sauce', 250, 'chilli-sausage'),

        (N'Domestic Whisky', N'Old Durbar Black Chimney', N'60ml: 425; 90ml: 635; 180ml: 1270; 750ml: 5080', 425, 'old-durbar-black-chimney-whisky'),
        (N'Domestic Whisky', N'Old Durbar', N'60ml: 320; 90ml: 475; 180ml: 950; 750ml: 3800', 320, 'old-durbar-whisky'),
        (N'Domestic Whisky', N'Signature Green', N'60ml: 320; 90ml: 475; 180ml: 950; 750ml: 3800', 320, 'signature-green-whisky'),
        (N'Domestic Whisky', N'Black Oak', N'60ml: 150; 90ml: 225; 180ml: 450; 750ml: 1800', 150, 'black-oak-whisky'),
        (N'Domestic Whisky', N'Golden Oak', N'60ml: 140; 90ml: 205; 180ml: 410; 750ml: 1600', 140, 'golden-oak-whisky'),
        (N'Domestic Whisky', N'Virgin', N'60ml: 130; 90ml: 190; 180ml: 380; 750ml: 1500', 130, 'virgin-whisky'),
        (N'Domestic Vodka', N'8848 Vodka', N'60ml: 235; 90ml: 350; 180ml: 700; 750ml: 2800', 235, '8848-vodka'),
        (N'Domestic Vodka', N'Ruslan Vodka', N'60ml: 235; 90ml: 350; 180ml: 700; 750ml: 2800', 235, 'ruslan-vodka'),
        (N'Domestic Vodka', N'Nude Vodka', N'60ml: 235; 90ml: 350; 180ml: 700; 750ml: 2800', 235, 'nude-vodka'),
        (N'Gin', N'Blue Diamond Gin', N'60ml: 135; 90ml: 200; 180ml: 400; 750ml: 1600', 135, 'blue-diamond-gin'),
        (N'Rum', N'Khukuri Rum', N'60ml: 235; 90ml: 350; 180ml: 700; 750ml: 2800', 235, 'khukuri-rum'),
        (N'Rum', N'Khukuri Spiced Rum', N'60ml: 270; 90ml: 400; 180ml: 800; 750ml: 3200', 270, 'khukuri-spiced-rum'),
        (N'Beer', N'Carlsberg Pilsner 650ml', N'650ml bottle', 660, 'carlsberg-pilsner-beer'),
        (N'Beer', N'Gorkha Pilsner', N'Price was not supplied in the source menu', 0, 'gorkha-pilsner-beer'),
        (N'Beer', N'Tuborg Gold 650ml', N'650ml bottle', 590, 'tuborg-gold-beer'),
        (N'Beer', N'Tuborg Strong 650ml', N'650ml bottle', 550, 'tuborg-strong-650ml'),
        (N'Beer', N'Tuborg Strong 330ml', N'330ml bottle', 260, 'tuborg-strong-330ml'),
        (N'Beer', N'Arna Strong 650ml', N'650ml bottle', 450, 'arna-strong-650ml'),
        (N'Beer', N'Arna Strong 330ml', N'330ml bottle', 250, 'arna-strong-330ml'),
        (N'Beer', N'Gorkha Strong 650ml', N'650ml bottle', 480, 'gorkha-strong-650ml'),
        (N'Beer', N'Gorkha Strong 330ml', N'330ml bottle', 250, 'gorkha-strong-330ml'),
        (N'Beer', N'Barahsinghe 650ml', N'650ml bottle', 430, 'barahsinghe-beer'),
        (N'Wine', N'Big Master Red Wine', N'Red wine bottle', 1150, 'big-master-red-wine'),
        (N'Wine', N'Big Master White Wine', N'White wine bottle', 1150, 'big-master-white-wine'),
        (N'Cigarette & Shisha', N'Shikhar Ice', N'Price per cigarette', 25, 'shikhar-ice-cigarette'),
        (N'Cigarette & Shisha', N'Surya Red', N'Price per cigarette', 30, 'surya-red-cigarette'),
        (N'Cigarette & Shisha', N'Surya Fusion', N'Price per cigarette', 30, 'surya-fusion-cigarette'),
        (N'Cigarette & Shisha', N'Normal Hukkah', N'Normal hukkah', 400, 'normal-hookah'),
        (N'Cigarette & Shisha', N'Cloud Hukkah', N'Cloud hukkah', 550, 'cloud-hookah'),
        (N'Cigarette & Shisha', N'Extra Coil', N'Extra hukkah coil', 50, 'hookah-extra-coil'),
        (N'Cigarette & Shisha', N'Extra Pot - Normal', N'Extra normal hukkah pot', 200, 'normal-hookah-extra-pot'),
        (N'Cigarette & Shisha', N'Extra Pot - Cloud', N'Extra cloud hukkah pot', 250, 'cloud-hookah-extra-pot');

    DECLARE @ResolvedItems TABLE
    (
        CategoryId int NOT NULL,
        Name nvarchar(200) NOT NULL,
        Description nvarchar(500) NOT NULL,
        Price decimal(18,2) NOT NULL,
        ImageUrl nvarchar(500) NOT NULL
    );

    INSERT INTO @ResolvedItems (CategoryId, Name, Description, Price, ImageUrl)
    SELECT
        category.CategoryId,
        item.Name,
        item.Description,
        item.Price,
        N''
    FROM @Items AS item
    INNER JOIN dbo.MenuCategories AS category
        ON category.CategoryName = item.CategoryName;

    MERGE dbo.MenuItems AS target
    USING @ResolvedItems AS source
       ON target.CategoryId = source.CategoryId
      AND target.Name = source.Name
    WHEN MATCHED THEN
        UPDATE SET
            Description = source.Description,
            Price = source.Price,
            ImageUrl = source.ImageUrl,
            IsAvailable = 1
    WHEN NOT MATCHED THEN
        INSERT (Name, Description, Price, ImageUrl, CategoryId, IsAvailable, CreatedAt)
        VALUES (source.Name, source.Description, source.Price, source.ImageUrl, source.CategoryId, 1, GETDATE());

    COMMIT TRANSACTION;

    SELECT
        category.CategoryName,
        item.Name,
        item.Price,
        item.ImageUrl
    FROM dbo.MenuItems AS item
    INNER JOIN dbo.MenuCategories AS category
        ON category.CategoryId = item.CategoryId
    WHERE category.CategoryName IN (SELECT CategoryName FROM @Categories)
    ORDER BY category.CategoryName, item.Name;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    ;THROW;
END CATCH;
