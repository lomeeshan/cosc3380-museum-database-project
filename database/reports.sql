USE MuseumDatabase;

SET @Source    = 'combined';     
SET @StartDate = '2026-01-01';   
SET @EndDate   = '2026-12-31';   

SELECT
    m.SaleMonth,
    COALESCE(t.TicketsSold, 0)                                    AS TicketsSold,
    COALESCE(t.TicketRevenue, 0)                                  AS TicketRevenue,
    COALESCE(g.GiftShopSales, 0)                                  AS GiftShopSales,
    COALESCE(g.GiftShopRevenue, 0)                                AS GiftShopRevenue,
    COALESCE(t.TicketRevenue, 0) + COALESCE(g.GiftShopRevenue, 0) AS TotalRevenue
FROM (
    SELECT DATE_FORMAT(TicketTime, '%Y-%m') AS SaleMonth
    FROM TICKET
    WHERE COALESCE(@Source, 'combined') IN ('tickets', 'combined')
      AND DATE(TicketTime) BETWEEN COALESCE(@StartDate, '1000-01-01')
                               AND COALESCE(@EndDate,   '9999-12-31')
    UNION
    SELECT DATE_FORMAT(SaleDateTime, '%Y-%m')
    FROM GIFTSHOP_SALE
    WHERE COALESCE(@Source, 'combined') IN ('giftshop', 'combined')
      AND SaleStatus = 'Completed'
      AND DATE(SaleDateTime) BETWEEN COALESCE(@StartDate, '1000-01-01')
                                 AND COALESCE(@EndDate,   '9999-12-31')
) AS m
LEFT JOIN (
    SELECT DATE_FORMAT(TicketTime, '%Y-%m') AS SaleMonth,
           COUNT(*)         AS TicketsSold,
           SUM(TicketPrice) AS TicketRevenue
    FROM TICKET
    WHERE COALESCE(@Source, 'combined') IN ('tickets', 'combined')
      AND DATE(TicketTime) BETWEEN COALESCE(@StartDate, '1000-01-01')
                               AND COALESCE(@EndDate,   '9999-12-31')
    GROUP BY DATE_FORMAT(TicketTime, '%Y-%m')
) AS t ON t.SaleMonth = m.SaleMonth
LEFT JOIN (
    SELECT DATE_FORMAT(s.SaleDateTime, '%Y-%m')  AS SaleMonth,
           COUNT(DISTINCT s.SaleID)              AS GiftShopSales,
           SUM(si.Quantity * si.UnitPriceAtSale) AS GiftShopRevenue
    FROM GIFTSHOP_SALE s
    JOIN GIFTSHOP_SALE_ITEM si ON si.SaleID = s.SaleID
    WHERE COALESCE(@Source, 'combined') IN ('giftshop', 'combined')
      AND s.SaleStatus = 'Completed'
      AND DATE(s.SaleDateTime) BETWEEN COALESCE(@StartDate, '1000-01-01')
                                   AND COALESCE(@EndDate,   '9999-12-31')
    GROUP BY DATE_FORMAT(s.SaleDateTime, '%Y-%m')
) AS g ON g.SaleMonth = m.SaleMonth
ORDER BY m.SaleMonth;

-- REPORT 2: BEST-SELLING GIFT SHOP PRODUCTS
-- Set dates to NULL to include all completed sales.
SET @StartDate = NULL;
SET @EndDate = NULL;

SELECT
    p.ProductID,
    p.ProductName,
    p.Category,
    SUM(si.Quantity) AS UnitsSold,
    COUNT(DISTINCT s.SaleID) AS SaleCount,
    ROUND(SUM(si.Quantity * si.UnitPriceAtSale), 2) AS SalesRevenue
FROM GIFTSHOP_SALE_ITEM si
JOIN GIFTSHOP_SALE s
    ON s.SaleID = si.SaleID
JOIN GIFTSHOP_PRODUCT p
    ON p.ProductID = si.ProductID
WHERE s.SaleStatus = 'Completed'
  AND DATE(s.SaleDateTime)
      BETWEEN COALESCE(@StartDate, '1000-01-01')
          AND COALESCE(@EndDate, '9999-12-31')
GROUP BY p.ProductID, p.ProductName, p.Category
ORDER BY UnitsSold DESC, SalesRevenue DESC, p.ProductName;


-- REPORT 3: VISITORS BY EXHIBITION
-- Counts ticketed visits, not scanned attendance.
SET @StartDate = NULL;
SET @EndDate = NULL;

SELECT
    ex.ExhibitionID,
    ex.ExhibitionTitle,
    COUNT(t.TicketID) AS TicketsSold,
    COUNT(DISTINCT t.VisitorID) AS UniqueVisitors,
    COALESCE(SUM(CASE WHEN t.TicketType = 'Adult'
        THEN 1 ELSE 0 END), 0) AS AdultTickets,
    COALESCE(SUM(CASE WHEN t.TicketType = 'Child'
        THEN 1 ELSE 0 END), 0) AS ChildTickets,
    COALESCE(SUM(CASE WHEN t.TicketType = 'Student'
        THEN 1 ELSE 0 END), 0) AS StudentTickets,
    COALESCE(SUM(CASE WHEN t.TicketType = 'Senior'
        THEN 1 ELSE 0 END), 0) AS SeniorTickets
FROM EXHIBITION ex
LEFT JOIN TICKET t
    ON t.ExhibitionID = ex.ExhibitionID
   AND t.VisitDate
       BETWEEN COALESCE(@StartDate, '1000-01-01')
           AND COALESCE(@EndDate, '9999-12-31')
GROUP BY ex.ExhibitionID, ex.ExhibitionTitle
ORDER BY TicketsSold DESC, ex.ExhibitionTitle;
