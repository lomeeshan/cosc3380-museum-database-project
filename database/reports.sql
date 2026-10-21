
USE MuseumDatabase;

SET @StartDate = '2026-01-01';
SET @EndDate   = '2026-12-31';

SELECT
    DATE_FORMAT(t.TicketTime, '%Y-%m')                                AS SaleMonth,
    COUNT(*)                                                          AS TicketsSold,
    SUM(t.TicketPrice)                                                AS TotalRevenue,
    ROUND(AVG(t.TicketPrice), 2)                                      AS AvgTicketPrice,
    SUM(CASE WHEN t.TicketType = 'Adult'   THEN t.TicketPrice ELSE 0 END) AS AdultRevenue,
    SUM(CASE WHEN t.TicketType = 'Child'   THEN t.TicketPrice ELSE 0 END) AS ChildRevenue,
    SUM(CASE WHEN t.TicketType = 'Student' THEN t.TicketPrice ELSE 0 END) AS StudentRevenue,
    SUM(CASE WHEN t.TicketType = 'Senior'  THEN t.TicketPrice ELSE 0 END) AS SeniorRevenue
FROM TICKET t
WHERE DATE(t.TicketTime) BETWEEN @StartDate AND @EndDate
GROUP BY DATE_FORMAT(t.TicketTime, '%Y-%m')
ORDER BY SaleMonth;



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