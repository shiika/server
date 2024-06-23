-- Disable foreign key checks to allow truncating tables
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables
TRUNCATE TABLE `MyDatabase`.`Orders_Dishes`;
TRUNCATE TABLE `MyDatabase`.`Feedback`;
TRUNCATE TABLE `MyDatabase`.`Comment`;
TRUNCATE TABLE `MyDatabase`.`Payment`;
TRUNCATE TABLE `MyDatabase`.`Orders`;
TRUNCATE TABLE `MyDatabase`.`Dishes`;
TRUNCATE TABLE `MyDatabase`.`Sections`;
TRUNCATE TABLE `MyDatabase`.`User_Menu`;
TRUNCATE TABLE `MyDatabase`.`Menu`;
TRUNCATE TABLE `MyDatabase`.`Chef`;
TRUNCATE TABLE `MyDatabase`.`User`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;