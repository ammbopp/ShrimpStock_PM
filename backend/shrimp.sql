-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 22, 2025 at 03:18 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shrimp`
--

-- --------------------------------------------------------

--
-- Table structure for table `AUDITS`
--

CREATE TABLE `AUDITS` (
  `audit_id` varchar(50) NOT NULL,
  `payment_due_date` datetime NOT NULL,
  `payment_status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `AUDITS`
--

INSERT INTO `AUDITS` (`audit_id`, `payment_due_date`, `payment_status`) VALUES
('A001', '2025-01-01 12:00:00', 1),
('A002', '2025-01-15 12:00:00', 1),
('A003', '2025-01-30 12:00:00', 1),
('A004', '2025-02-20 12:00:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `AUDIT_LISTS`
--

CREATE TABLE `AUDIT_LISTS` (
  `audit_list_id` varchar(50) NOT NULL,
  `audit_id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `order_amount` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `AUDIT_LISTS`
--

INSERT INTO `AUDIT_LISTS` (`audit_list_id`, `audit_id`, `order_id`, `order_amount`) VALUES
('AL004', 'A003', 'O004', 4000.000);

-- --------------------------------------------------------

--
-- Table structure for table `EMPLOYEES`
--

CREATE TABLE `EMPLOYEES` (
  `employee_id` varchar(50) NOT NULL,
  `employee_fname` varchar(50) NOT NULL,
  `employee_lname` varchar(50) NOT NULL,
  `employee_age` int(11) NOT NULL CHECK (`employee_age` > 0 and `employee_age` < 120),
  `employee_sex` varchar(6) NOT NULL,
  `employee_position` enum('worker','academic','clerical','keeper') NOT NULL,
  `employee_address` varchar(255) NOT NULL,
  `employee_salary` decimal(10,2) NOT NULL,
  `employee_image` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `EMPLOYEES`
--

INSERT INTO `EMPLOYEES` (`employee_id`, `employee_fname`, `employee_lname`, `employee_age`, `employee_sex`, `employee_position`, `employee_address`, `employee_salary`, `employee_image`, `username`, `password`) VALUES
('E011', 'Ivy', 'Clark', 28, 'Female', 'worker', '909 Palm St, City 10900', 32000.00, 'cat.png', 'amm', '123'),
('E012', 'Jack', 'Harris', 42, 'Male', 'academic', '1010 Pine Rd, City', 37000.00, 'dog.png', 'dog', '123'),
('E013', 'Karen', 'Lewis', 33, 'Female', 'clerical', '1111 Cedar Blvd, City', 34000.00, 'panda.png', 'bb', '123'),
('E014', 'Liam', 'Walker', 39, 'Male', 'keeper', '1212 Elm St, City', 29500.00, 'liam_image.jpg', 'liam_walker', 'password1212'),
('E015', 'Mia', 'Scott', 30, 'Female', 'worker', '1313 Pine St, City', 33000.00, 'mia_image.jpg', 'mia_scott', 'password1313'),
('E016', 'Noah', 'Young', 45, 'Male', 'academic', '1414 Oak Ave, City', 38000.00, 'noah_image.jpg', 'noah_young', 'password1414'),
('E017', 'Olivia', 'King', 37, 'Female', 'clerical', '1515 Maple Rd, City', 34500.00, 'olivia_image.jpg', 'olivia_king', 'password1515'),
('E018', 'Paul', 'Hall', 50, 'Male', 'keeper', '1616 Birch Ln, City', 31000.00, 'paul_image.jpg', 'paul_hall', 'password1616');

-- --------------------------------------------------------

--
-- Table structure for table `ORDERS`
--

CREATE TABLE `ORDERS` (
  `order_id` varchar(50) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `order_date` datetime NOT NULL,
  `order_status` enum('waiting','accept','reject','done') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ORDERS`
--

INSERT INTO `ORDERS` (`order_id`, `employee_id`, `order_date`, `order_status`) VALUES
('O001', 'E014', '2025-02-15 09:00:00', 'waiting'),
('O002', 'E018', '2025-02-16 10:30:00', 'accept'),
('O003', 'E014', '2025-02-17 11:15:00', 'reject'),
('O004', 'E018', '2025-02-18 13:00:00', 'done');

-- --------------------------------------------------------

--
-- Table structure for table `ORDER_LISTS`
--

CREATE TABLE `ORDER_LISTS` (
  `order_list_id` varchar(50) NOT NULL,
  `order_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `order_quantity` decimal(10,3) NOT NULL,
  `unit_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ORDER_LISTS`
--

INSERT INTO `ORDER_LISTS` (`order_list_id`, `order_id`, `product_id`, `order_quantity`, `unit_id`) VALUES
('OL001', 'O001', 'P001', 1.500, 'U012'),
('OL002', 'O001', 'P002', 2.000, 'U012'),
('OL003', 'O002', 'P006', 200.000, 'U015'),
('OL004', 'O002', 'P007', 150.000, 'U015'),
('OL005', 'O003', 'P004', 3.000, 'U014'),
('OL006', 'O004', 'P005', 2.500, 'U013'),
('OL007', 'O004', 'P009', 5.000, 'U015');

-- --------------------------------------------------------

--
-- Table structure for table `PONDS`
--

CREATE TABLE `PONDS` (
  `POND_ID` int(11) NOT NULL,
  `POND_SIZE` decimal(10,2) NOT NULL,
  `POND_STATUS` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PONDS`
--

INSERT INTO `PONDS` (`POND_ID`, `POND_SIZE`, `POND_STATUS`) VALUES
(1, 500.00, 1),
(2, 750.50, 0),
(3, 300.75, 1),
(4, 600.00, 1),
(5, 1000.25, 0);

-- --------------------------------------------------------

--
-- Table structure for table `POND_HISTORY`
--

CREATE TABLE `POND_HISTORY` (
  `POND_USED_ID` int(11) NOT NULL,
  `POND_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `POND_HISTORY`
--

INSERT INTO `POND_HISTORY` (`POND_USED_ID`, `POND_ID`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- --------------------------------------------------------

--
-- Table structure for table `POND_STAFFS`
--

CREATE TABLE `POND_STAFFS` (
  `POND_STAFF_ID` int(11) NOT NULL,
  `EMPLOYEE_ID` varchar(50) NOT NULL,
  `POND_USED_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `POND_STAFFS`
--

INSERT INTO `POND_STAFFS` (`POND_STAFF_ID`, `EMPLOYEE_ID`, `POND_USED_ID`) VALUES
(1, 'E011', 1),
(2, 'E012', 2),
(3, 'E015', 3),
(4, 'E016', 4);

-- --------------------------------------------------------

--
-- Table structure for table `PRODUCTS`
--

CREATE TABLE `PRODUCTS` (
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(50) NOT NULL,
  `product_type` enum('Food','Chemical') NOT NULL,
  `product_unit` varchar(50) NOT NULL,
  `product_quantity` decimal(10,3) NOT NULL,
  `threshold` decimal(10,2) NOT NULL,
  `product_image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PRODUCTS`
--

INSERT INTO `PRODUCTS` (`product_id`, `product_name`, `product_type`, `product_unit`, `product_quantity`, `threshold`, `product_image`) VALUES
('P001', 'Food A', 'Food', 'Kilogram', 50.000, 10.00, 'food.png'),
('P002', 'Food B', 'Food', 'Kilogram', 30.500, 5.00, 'food.png'),
('P003', 'Food C', 'Food', 'Kilogram', 20.250, 8.00, 'food.png'),
('P004', 'Food D', 'Food', 'Kilogram', 60.750, 15.00, 'food.png'),
('P005', 'Food E', 'Food', 'Kilogram', 40.600, 12.00, 'food.png'),
('P006', 'Chemical A', 'Chemical', 'Liter', 100.000, 20.00, 'chemical.png'),
('P007', 'Chemical B', 'Chemical', 'Liter', 80.500, 18.00, 'chemical.png'),
('P008', 'Chemical C', 'Chemical', 'Liter', 60.250, 10.00, 'chemical.png'),
('P009', 'Chemical D', 'Chemical', 'Liter', 90.750, 25.00, 'chemical.png'),
('P010', 'Chemical E', 'Chemical', 'Liter', 70.600, 22.00, 'chemical.png');

-- --------------------------------------------------------

--
-- Table structure for table `PRODUCT_LOTS`
--

CREATE TABLE `PRODUCT_LOTS` (
  `lot_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `lot_date` datetime NOT NULL,
  `lot_exp` datetime NOT NULL,
  `lot_quantity` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `PRODUCT_LOTS`
--

INSERT INTO `PRODUCT_LOTS` (`lot_id`, `product_id`, `lot_date`, `lot_exp`, `lot_quantity`) VALUES
('L001', 'P001', '2025-01-01 08:00:00', '2025-06-01 08:00:00', 50.000),
('L002', 'P002', '2025-01-05 08:00:00', '2025-06-05 08:00:00', 30.500),
('L003', 'P003', '2025-01-10 08:00:00', '2025-06-10 08:00:00', 20.250),
('L004', 'P004', '2025-01-15 08:00:00', '2025-06-15 08:00:00', 60.750),
('L005', 'P005', '2025-01-20 08:00:00', '2025-06-20 08:00:00', 40.600),
('L006', 'P006', '2025-01-25 08:00:00', '2026-01-25 08:00:00', 100.000),
('L007', 'P007', '2025-02-01 08:00:00', '2026-02-01 08:00:00', 80.500),
('L008', 'P008', '2025-02-05 08:00:00', '2026-02-05 08:00:00', 60.250),
('L009', 'P009', '2025-02-10 08:00:00', '2026-02-10 08:00:00', 90.750),
('L010', 'P010', '2025-02-15 08:00:00', '2026-02-15 08:00:00', 70.600);

-- --------------------------------------------------------

--
-- Table structure for table `REQUESTS`
--

CREATE TABLE `REQUESTS` (
  `request_id` varchar(50) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `pond_used_id` int(11) NOT NULL,
  `request_date` datetime NOT NULL,
  `request_status` enum('waiting','accept','reject','done') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `REQUESTS`
--

INSERT INTO `REQUESTS` (`request_id`, `employee_id`, `pond_used_id`, `request_date`, `request_status`) VALUES
('663b1ffe-30a9-4434-81eb-d417d17a74b4', 'E011', 1, '2025-02-22 21:13:45', 'waiting'),
('R001', 'E011', 1, '2025-02-01 09:00:00', 'waiting'),
('R002', 'E012', 2, '2025-02-02 10:30:00', 'accept'),
('R003', 'E015', 3, '2025-02-03 11:15:00', 'reject'),
('R004', 'E016', 4, '2025-02-04 13:00:00', 'done'),
('R005', 'E011', 1, '2025-02-05 14:45:00', 'waiting'),
('R006', 'E012', 2, '2025-02-06 16:20:00', 'accept'),
('R007', 'E015', 3, '2025-02-07 08:50:00', 'reject'),
('R008', 'E016', 4, '2025-02-08 12:10:00', 'done');

-- --------------------------------------------------------

--
-- Table structure for table `REQUEST_LISTS`
--

CREATE TABLE `REQUEST_LISTS` (
  `REQUEST_LIST_ID` varchar(50) NOT NULL,
  `REQUEST_ID` varchar(50) NOT NULL,
  `PRODUCT_ID` varchar(50) NOT NULL,
  `UNIT_ID` varchar(50) NOT NULL,
  `REQUEST_QUANTITY` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `REQUEST_LISTS`
--

INSERT INTO `REQUEST_LISTS` (`REQUEST_LIST_ID`, `REQUEST_ID`, `PRODUCT_ID`, `UNIT_ID`, `REQUEST_QUANTITY`) VALUES
('e7b0b389-43a1-4f70-abfd-5c879a1de2a8', '663b1ffe-30a9-4434-81eb-d417d17a74b4', 'P001', 'U013', 1.000),
('RL001', 'R001', 'P001', 'U010', 10.000),
('RL002', 'R001', 'P002', 'U010', 5.500),
('RL003', 'R002', 'P006', 'U011', 20.000),
('RL004', 'R005', 'P003', 'U010', 15.250),
('RL005', 'R006', 'P007', 'U009', 8.000),
('RL006', 'R007', 'P004', 'U010', 12.000),
('RL007', 'R008', 'P008', 'U011', 3.500);

-- --------------------------------------------------------

--
-- Table structure for table `UNITS`
--

CREATE TABLE `UNITS` (
  `unit_id` varchar(50) NOT NULL,
  `product_type` enum('Food','Chemical') NOT NULL,
  `unit_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `UNITS`
--

INSERT INTO `UNITS` (`unit_id`, `product_type`, `unit_name`) VALUES
('U008', 'Food', 'Liter'),
('U009', 'Chemical', 'Tube'),
('U010', 'Food', 'Gram'),
('U011', 'Chemical', 'Milliliter'),
('U012', 'Food', 'Cubic Meter'),
('U013', 'Food', 'Pound'),
('U014', 'Food', 'Ton'),
('U015', 'Chemical', 'Gallon'),
('U016', 'Chemical', 'Quart');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `AUDITS`
--
ALTER TABLE `AUDITS`
  ADD PRIMARY KEY (`audit_id`);

--
-- Indexes for table `AUDIT_LISTS`
--
ALTER TABLE `AUDIT_LISTS`
  ADD PRIMARY KEY (`audit_list_id`),
  ADD KEY `audit_id` (`audit_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `EMPLOYEES`
--
ALTER TABLE `EMPLOYEES`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `ORDERS`
--
ALTER TABLE `ORDERS`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `ORDER_LISTS`
--
ALTER TABLE `ORDER_LISTS`
  ADD PRIMARY KEY (`order_list_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `unit_id` (`unit_id`);

--
-- Indexes for table `PONDS`
--
ALTER TABLE `PONDS`
  ADD PRIMARY KEY (`POND_ID`);

--
-- Indexes for table `POND_HISTORY`
--
ALTER TABLE `POND_HISTORY`
  ADD PRIMARY KEY (`POND_USED_ID`),
  ADD KEY `POND_ID` (`POND_ID`);

--
-- Indexes for table `POND_STAFFS`
--
ALTER TABLE `POND_STAFFS`
  ADD PRIMARY KEY (`POND_STAFF_ID`),
  ADD KEY `EMPLOYEE_ID` (`EMPLOYEE_ID`),
  ADD KEY `POND_USED_ID` (`POND_USED_ID`);

--
-- Indexes for table `PRODUCTS`
--
ALTER TABLE `PRODUCTS`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `PRODUCT_LOTS`
--
ALTER TABLE `PRODUCT_LOTS`
  ADD PRIMARY KEY (`lot_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `REQUESTS`
--
ALTER TABLE `REQUESTS`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `pond_used_id` (`pond_used_id`);

--
-- Indexes for table `REQUEST_LISTS`
--
ALTER TABLE `REQUEST_LISTS`
  ADD PRIMARY KEY (`REQUEST_LIST_ID`),
  ADD KEY `REQUEST_ID` (`REQUEST_ID`),
  ADD KEY `PRODUCT_ID` (`PRODUCT_ID`),
  ADD KEY `UNIT_ID` (`UNIT_ID`);

--
-- Indexes for table `UNITS`
--
ALTER TABLE `UNITS`
  ADD PRIMARY KEY (`unit_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `AUDIT_LISTS`
--
ALTER TABLE `AUDIT_LISTS`
  ADD CONSTRAINT `audit_lists_ibfk_1` FOREIGN KEY (`audit_id`) REFERENCES `AUDITS` (`audit_id`),
  ADD CONSTRAINT `audit_lists_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`order_id`);

--
-- Constraints for table `ORDERS`
--
ALTER TABLE `ORDERS`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `EMPLOYEES` (`employee_id`);

--
-- Constraints for table `ORDER_LISTS`
--
ALTER TABLE `ORDER_LISTS`
  ADD CONSTRAINT `order_lists_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`order_id`),
  ADD CONSTRAINT `order_lists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS` (`product_id`),
  ADD CONSTRAINT `order_lists_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `UNITS` (`unit_id`);

--
-- Constraints for table `POND_HISTORY`
--
ALTER TABLE `POND_HISTORY`
  ADD CONSTRAINT `pond_history_ibfk_1` FOREIGN KEY (`POND_ID`) REFERENCES `PONDS` (`POND_ID`);

--
-- Constraints for table `POND_STAFFS`
--
ALTER TABLE `POND_STAFFS`
  ADD CONSTRAINT `pond_staffs_ibfk_1` FOREIGN KEY (`EMPLOYEE_ID`) REFERENCES `EMPLOYEES` (`employee_id`),
  ADD CONSTRAINT `pond_staffs_ibfk_2` FOREIGN KEY (`POND_USED_ID`) REFERENCES `POND_HISTORY` (`POND_USED_ID`);

--
-- Constraints for table `PRODUCT_LOTS`
--
ALTER TABLE `PRODUCT_LOTS`
  ADD CONSTRAINT `product_lots_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `PRODUCTS` (`product_id`);

--
-- Constraints for table `REQUESTS`
--
ALTER TABLE `REQUESTS`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `EMPLOYEES` (`employee_id`),
  ADD CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`pond_used_id`) REFERENCES `POND_STAFFS` (`POND_USED_ID`);

--
-- Constraints for table `REQUEST_LISTS`
--
ALTER TABLE `REQUEST_LISTS`
  ADD CONSTRAINT `request_lists_ibfk_1` FOREIGN KEY (`REQUEST_ID`) REFERENCES `REQUESTS` (`request_id`),
  ADD CONSTRAINT `request_lists_ibfk_2` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `PRODUCTS` (`product_id`),
  ADD CONSTRAINT `request_lists_ibfk_3` FOREIGN KEY (`UNIT_ID`) REFERENCES `UNITS` (`unit_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
