-- MySQL dump 10.13  Distrib 8.4.11, for macos15 (x86_64)
--
-- Host: localhost    Database: MuseumDatabase
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `MuseumDatabase`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `MuseumDatabase` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `MuseumDatabase`;

--
-- Table structure for table `ARTIST`
--

DROP TABLE IF EXISTS `ARTIST`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ARTIST` (
  `ArtistID` int unsigned NOT NULL AUTO_INCREMENT,
  `ArtistName` varchar(150) NOT NULL,
  `BirthYear` int DEFAULT NULL,
  `DeathYear` int DEFAULT NULL,
  `Nationality` varchar(100) DEFAULT NULL,
  `Biography` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`ArtistID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ARTWORK`
--

DROP TABLE IF EXISTS `ARTWORK`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ARTWORK` (
  `ArtworkID` int unsigned NOT NULL AUTO_INCREMENT,
  `CollectionID` int unsigned NOT NULL,
  `AccessionNumber` varchar(40) NOT NULL,
  `Title` varchar(200) NOT NULL,
  `CreationYear` smallint unsigned DEFAULT NULL,
  `Medium` varchar(120) NOT NULL,
  `Dimensions` varchar(120) DEFAULT NULL,
  `AcquisitionDate` date NOT NULL,
  `AcquisitionMethod` varchar(60) DEFAULT NULL,
  `Description` text,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`ArtworkID`),
  KEY `CollectionID` (`CollectionID`),
  CONSTRAINT `artwork_ibfk_1` FOREIGN KEY (`CollectionID`) REFERENCES `COLLECTION` (`CollectionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `COLLECTION`
--

DROP TABLE IF EXISTS `COLLECTION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `COLLECTION` (
  `CollectionID` int unsigned NOT NULL AUTO_INCREMENT,
  `CollectionName` varchar(100) NOT NULL,
  `Description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`CollectionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DEPARTMENT`
--

DROP TABLE IF EXISTS `DEPARTMENT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DEPARTMENT` (
  `DepartmentID` int unsigned NOT NULL AUTO_INCREMENT,
  `DepartmentName` varchar(100) NOT NULL,
  `OfficeLocation` varchar(120) DEFAULT NULL,
  `PhoneExtension` varchar(10) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`DepartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EMPLOYEE`
--

DROP TABLE IF EXISTS `EMPLOYEE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EMPLOYEE` (
  `EmployeeID` int unsigned NOT NULL AUTO_INCREMENT,
  `DepartmentID` int unsigned NOT NULL,
  `FirstName` varchar(80) NOT NULL,
  `LastName` varchar(80) NOT NULL,
  `JobTitle` varchar(100) NOT NULL,
  `HireDate` date NOT NULL,
  `Email` varchar(254) DEFAULT NULL,
  `EmploymentStatus` varchar(20) NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`DepartmentID`) REFERENCES `DEPARTMENT` (`DepartmentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EXHIBITION`
--

DROP TABLE IF EXISTS `EXHIBITION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EXHIBITION` (
  `ExhibitionID` int unsigned NOT NULL AUTO_INCREMENT,
  `GalleryID` int unsigned NOT NULL,
  `ExhibitionTitle` varchar(180) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Description` text,
  `Status` varchar(20) NOT NULL,
  PRIMARY KEY (`ExhibitionID`),
  KEY `GalleryID` (`GalleryID`),
  CONSTRAINT `exhibition_ibfk_1` FOREIGN KEY (`GalleryID`) REFERENCES `GALLERY` (`GalleryID`),
  CONSTRAINT `exhibition_chk_1` CHECK ((`EndDate` >= `StartDate`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GALLERY`
--

DROP TABLE IF EXISTS `GALLERY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GALLERY` (
  `GalleryID` int unsigned NOT NULL AUTO_INCREMENT,
  `GalleryName` varchar(100) NOT NULL,
  `FloorNumber` smallint DEFAULT NULL,
  `Capacity` int unsigned DEFAULT NULL,
  `AccessibilityNotes` varchar(255) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`GalleryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GIFTSHOP_PRODUCT`
--

DROP TABLE IF EXISTS `GIFTSHOP_PRODUCT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GIFTSHOP_PRODUCT` (
  `ProductID` int unsigned NOT NULL AUTO_INCREMENT,
  `ProductName` varchar(150) NOT NULL,
  `Category` varchar(80) NOT NULL,
  `CurrentPrice` decimal(10,2) NOT NULL,
  `QuantityInStock` int unsigned NOT NULL,
  `ReorderLevel` int unsigned NOT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SALE`
--

DROP TABLE IF EXISTS `SALE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SALE` (
  `SaleID` int unsigned NOT NULL AUTO_INCREMENT,
  `EmployeeID` int unsigned NOT NULL,
  `SaleDateTime` datetime NOT NULL,
  `PaymentMethod` varchar(30) NOT NULL,
  `SaleStatus` varchar(20) NOT NULL,
  PRIMARY KEY (`SaleID`),
  KEY `EmployeeID` (`EmployeeID`),
  CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`EmployeeID`) REFERENCES `EMPLOYEE` (`EmployeeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TICKET`
--

DROP TABLE IF EXISTS `TICKET`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TICKET` (
  `TicketID` int unsigned NOT NULL AUTO_INCREMENT,
  `VisitorID` int unsigned NOT NULL,
  `TicketTypeID` int unsigned NOT NULL,
  `IssueDateTime` datetime NOT NULL,
  `VisitDate` date NOT NULL,
  `PricePaid` decimal(8,2) NOT NULL,
  `TicketStatus` varchar(20) NOT NULL,
  PRIMARY KEY (`TicketID`),
  KEY `VisitorID` (`VisitorID`),
  KEY `TicketTypeID` (`TicketTypeID`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`VisitorID`) REFERENCES `VISITOR` (`VisitorID`),
  CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`TicketTypeID`) REFERENCES `TICKET_TYPE` (`TicketTypeID`),
  CONSTRAINT `ticket_chk_1` CHECK ((`PricePaid` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TICKET_TYPE`
--

DROP TABLE IF EXISTS `TICKET_TYPE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TICKET_TYPE` (
  `TicketTypeID` int unsigned NOT NULL AUTO_INCREMENT,
  `TypeName` varchar(60) NOT NULL,
  `StandardPrice` decimal(8,2) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`TicketTypeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `USER_ROLE`
--

DROP TABLE IF EXISTS `USER_ROLE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER_ROLE` (
  `RoleID` int unsigned NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(60) NOT NULL,
  `RoleDescription` varchar(255) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL,
  PRIMARY KEY (`RoleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `VISITOR`
--

DROP TABLE IF EXISTS `VISITOR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VISITOR` (
  `VisitorID` int unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(80) NOT NULL,
  `LastName` varchar(80) NOT NULL,
  `Email` varchar(254) DEFAULT NULL,
  `Phone` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`VisitorID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-25 13:48:45
