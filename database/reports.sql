-- =====================================================================
-- reports.sql  -  Data reports for MuseumDatabase
-- Run in MySQL Workbench after schema.sql, triggers.sql and seed.sql.
--
-- Reports 1 and 2 use a date range (@StartDate / @EndDate) so the user
-- can pick a period. In the Express routes, replace the variables with ?
-- and pass the dates from the request (format YYYY-MM-DD).
-- =====================================================================

USE MuseumDatabase;


-- ---------------------------------------------------------------------
-- REPORT 1: Combined Monthly Revenue (tickets + gift shop)
-- API: GET /api/reports/combined-revenue
-- For each month: tickets sold and ticket revenue, completed gift shop
-- sales and gift shop revenue, and the combined total.
-- Refunded gift shop sales are excluded. Months with sales in only one
-- area still appear (the other area shows 0).
-- ---------------------------------------------------------------------
SET @StartDate = '2026-01-01';
SET @EndDate   = '2026-12-31';

SELECT
    m.SaleMonth,
    COALESCE(t.TicketsSold, 0)                                  AS TicketsSold,
    COALESCE(t.TicketRevenue, 0)                                AS TicketRevenue,
    COALESCE(g.GiftShopSales, 0)                                AS GiftShopSales,
    COALESCE(g.GiftShopRevenue, 0)                              AS GiftShopRevenue,
    COALESCE(t.TicketRevenue, 0) + COALESCE(g.GiftShopRevenue, 0) AS TotalRevenue
FROM (
    SELECT DATE_FORMAT(TicketTime, '%Y-%m') AS SaleMonth FROM TICKET
    WHERE DATE(TicketTime) BETWEEN @StartDate AND @EndDate
    UNION
    SELECT DATE_FORMAT(SaleDateTime, '%Y-%m') FROM GIFTSHOP_SALE
    WHERE SaleStatus = 'Completed' AND DATE(SaleDateTime) BETWEEN @StartDate AND @EndDate
) AS m
LEFT JOIN (
    SELECT DATE_FORMAT(TicketTime, '%Y-%m') AS SaleMonth,
           COUNT(*) AS TicketsSold, SUM(TicketPrice) AS TicketRevenue
    FROM TICKET
    WHERE DATE(TicketTime) BETWEEN @StartDate AND @EndDate
    GROUP BY DATE_FORMAT(TicketTime, '%Y-%m')
) AS t ON t.SaleMonth = m.SaleMonth
LEFT JOIN (
    SELECT DATE_FORMAT(s.SaleDateTime, '%Y-%m') AS SaleMonth,
           COUNT(DISTINCT s.SaleID) AS GiftShopSales,
           SUM(si.Quantity * si.UnitPriceAtSale) AS GiftShopRevenue
    FROM GIFTSHOP_SALE s
    JOIN GIFTSHOP_SALE_ITEM si ON si.SaleID = s.SaleID
    WHERE s.SaleStatus = 'Completed'
      AND DATE(s.SaleDateTime) BETWEEN @StartDate AND @EndDate
    GROUP BY DATE_FORMAT(s.SaleDateTime, '%Y-%m')
) AS g ON g.SaleMonth = m.SaleMonth
ORDER BY m.SaleMonth;


-- ---------------------------------------------------------------------
-- REPORT 2: Ticket Sales Analysis by Exhibition
-- API: GET /api/reports/ticket-sales-by-exhibition
-- For each exhibition: gallery, status, dates, tickets sold, unique
-- visitors, revenue, average price, ticket-type counts, and its share
-- of all ticket revenue in the period.
-- LEFT JOIN keeps exhibitions with no sales yet (shown as 0).
-- A final row covers General Admission tickets (no exhibition).
-- ---------------------------------------------------------------------
SET @StartDate = '2026-01-01';
SET @EndDate   = '2026-12-31';

SELECT
    ExhibitionTitle, GalleryName, Status, StartDate, EndDate,
    TicketsSold, UniqueVisitors, Revenue, AvgTicketPrice,
    AdultTickets, ChildTickets, StudentTickets, SeniorTickets,
    ROUND(100 * Revenue / NULLIF(
        (SELECT SUM(TicketPrice) FROM TICKET
         WHERE DATE(TicketTime) BETWEEN @StartDate AND @EndDate), 0), 1) AS PctOfTotalRevenue
FROM (
    -- one row per exhibition
    SELECT
        ex.ExhibitionID,
        ex.ExhibitionTitle,
        g.GalleryName,
        ex.Status,
        ex.StartDate,
        ex.EndDate,
        COUNT(t.TicketID)                               AS TicketsSold,
        COUNT(DISTINCT t.VisitorID)                     AS UniqueVisitors,
        COALESCE(SUM(t.TicketPrice), 0)                 AS Revenue,
        ROUND(AVG(t.TicketPrice), 2)                    AS AvgTicketPrice,
        SUM(t.TicketType = 'Adult')                     AS AdultTickets,
        SUM(t.TicketType = 'Child')                     AS ChildTickets,
        SUM(t.TicketType = 'Student')                   AS StudentTickets,
        SUM(t.TicketType = 'Senior')                    AS SeniorTickets
    FROM EXHIBITION ex
    JOIN GALLERY g    ON g.GalleryID = ex.GalleryID
    LEFT JOIN TICKET t
           ON t.ExhibitionID = ex.ExhibitionID
          AND DATE(t.TicketTime) BETWEEN @StartDate AND @EndDate
    GROUP BY ex.ExhibitionID, ex.ExhibitionTitle, g.GalleryName,
             ex.Status, ex.StartDate, ex.EndDate

    UNION ALL

    -- general admission tickets (ExhibitionID is NULL)
    SELECT
        NULL, 'General Admission (no exhibition)', NULL, NULL, NULL, NULL,
        COUNT(t.TicketID),
        COUNT(DISTINCT t.VisitorID),
        COALESCE(SUM(t.TicketPrice), 0),
        ROUND(AVG(t.TicketPrice), 2),
        SUM(t.TicketType = 'Adult'),
        SUM(t.TicketType = 'Child'),
        SUM(t.TicketType = 'Student'),
        SUM(t.TicketType = 'Senior')
    FROM TICKET t
    WHERE t.ExhibitionID IS NULL
      AND DATE(t.TicketTime) BETWEEN @StartDate AND @EndDate
) AS report
ORDER BY (ExhibitionID IS NULL), Revenue DESC, ExhibitionTitle;


-- ---------------------------------------------------------------------
-- REPORT 3: Gift Shop Inventory and Low Stock
-- API: GET /api/reports/giftshop-inventory
-- Every product with its current stock, stock status, inventory value,
-- and sales history (completed sales only - refunds are excluded).
-- StockStatus: 'Out of Stock' (0), 'Low Stock' (below 5, the same limit
-- as the deactivation trigger), or 'In Stock'.
-- Products needing attention are listed first.
-- ---------------------------------------------------------------------
SELECT
    p.ProductID,
    p.ProductName,
    p.Category,
    p.CurrentPrice,
    p.QuantityInStock,
    CASE
        WHEN p.QuantityInStock = 0 THEN 'Out of Stock'
        WHEN p.QuantityInStock < 5 THEN 'Low Stock'
        ELSE 'In Stock'
    END                                                   AS StockStatus,
    CASE WHEN p.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS ProductStatus,
    p.CurrentPrice * p.QuantityInStock                    AS InventoryValue,
    COALESCE(sold.UnitsSold, 0)                           AS UnitsSold,
    COALESCE(sold.SalesRevenue, 0)                        AS SalesRevenue,
    sold.LastSoldOn
FROM GIFTSHOP_PRODUCT p
LEFT JOIN (
    -- sales totals per product, completed sales only
    SELECT
        si.ProductID,
        SUM(si.Quantity)                     AS UnitsSold,
        SUM(si.Quantity * si.UnitPriceAtSale) AS SalesRevenue,
        MAX(s.SaleDateTime)                  AS LastSoldOn
    FROM GIFTSHOP_SALE_ITEM si
    JOIN GIFTSHOP_SALE s ON s.SaleID = si.SaleID
    WHERE s.SaleStatus = 'Completed'
    GROUP BY si.ProductID
) AS sold ON sold.ProductID = p.ProductID
ORDER BY
    CASE
        WHEN p.QuantityInStock = 0 THEN 1
        WHEN p.QuantityInStock < 5 THEN 2
        ELSE 3
    END,
    p.QuantityInStock,
    p.ProductName;