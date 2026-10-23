
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


SET @ExhibitionID = NULL;          
SET @TicketType   = NULL;          
SET @StartDate    = '2026-01-01';  
SET @EndDate      = '2026-12-31';  

SELECT
    ExhibitionTitle, GalleryName, Status, StartDate, EndDate,
    TicketsSold, UniqueVisitors, Revenue, AvgTicketPrice,
    AdultTickets, ChildTickets, StudentTickets, SeniorTickets,
    ROUND(100 * Revenue / NULLIF((
        SELECT SUM(TicketPrice)
        FROM TICKET
        WHERE VisitDate BETWEEN COALESCE(@StartDate, '1000-01-01')
                            AND COALESCE(@EndDate,   '9999-12-31')
          AND (@TicketType IS NULL OR TicketType = @TicketType)
    ), 0), 1) AS PctOfTotalRevenue
FROM (

    SELECT
        ex.ExhibitionID,
        ex.ExhibitionTitle,
        g.GalleryName,
        ex.Status,
        ex.StartDate,
        ex.EndDate,
        COUNT(t.TicketID)                              AS TicketsSold,
        COUNT(DISTINCT t.VisitorID)                    AS UniqueVisitors,
        COALESCE(SUM(t.TicketPrice), 0)                AS Revenue,
        ROUND(AVG(t.TicketPrice), 2)                   AS AvgTicketPrice,
        COALESCE(SUM(t.TicketType = 'Adult'), 0)       AS AdultTickets,
        COALESCE(SUM(t.TicketType = 'Child'), 0)       AS ChildTickets,
        COALESCE(SUM(t.TicketType = 'Student'), 0)     AS StudentTickets,
        COALESCE(SUM(t.TicketType = 'Senior'), 0)      AS SeniorTickets
    FROM EXHIBITION ex
    JOIN GALLERY g ON g.GalleryID = ex.GalleryID
    LEFT JOIN TICKET t
           ON t.ExhibitionID = ex.ExhibitionID
          AND t.VisitDate BETWEEN COALESCE(@StartDate, '1000-01-01')
                              AND COALESCE(@EndDate,   '9999-12-31')
          AND (@TicketType IS NULL OR t.TicketType = @TicketType)
    WHERE (@ExhibitionID IS NULL OR ex.ExhibitionID = @ExhibitionID)
    GROUP BY ex.ExhibitionID, ex.ExhibitionTitle, g.GalleryName,
             ex.Status, ex.StartDate, ex.EndDate

    UNION ALL


    SELECT
        NULL, 'General Admission (no exhibition)', NULL, NULL, NULL, NULL,
        COUNT(t.TicketID),
        COUNT(DISTINCT t.VisitorID),
        COALESCE(SUM(t.TicketPrice), 0),
        ROUND(AVG(t.TicketPrice), 2),
        COALESCE(SUM(t.TicketType = 'Adult'), 0),
        COALESCE(SUM(t.TicketType = 'Child'), 0),
        COALESCE(SUM(t.TicketType = 'Student'), 0),
        COALESCE(SUM(t.TicketType = 'Senior'), 0)
    FROM TICKET t
    WHERE @ExhibitionID IS NULL
      AND t.ExhibitionID IS NULL
      AND t.VisitDate BETWEEN COALESCE(@StartDate, '1000-01-01')
                          AND COALESCE(@EndDate,   '9999-12-31')
      AND (@TicketType IS NULL OR t.TicketType = @TicketType)
    HAVING COUNT(t.TicketID) > 0
) AS report
ORDER BY (ExhibitionID IS NULL), Revenue DESC, ExhibitionTitle;


SET @Category  = NULL;    
SET @Threshold = 5;       
SET @Stock     = 'all';  

SELECT
    p.ProductID,
    p.ProductName,
    p.Category,
    p.CurrentPrice,
    p.QuantityInStock,
    CASE
        WHEN p.QuantityInStock = 0                       THEN 'Out of Stock'
        WHEN p.QuantityInStock < COALESCE(@Threshold, 5) THEN 'Low Stock'
        ELSE 'In Stock'
    END                                                        AS StockStatus,
    CASE WHEN p.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS ProductStatus,
    p.CurrentPrice * p.QuantityInStock                         AS InventoryValue,
    COALESCE(sold.UnitsSold, 0)                                AS UnitsSold,
    COALESCE(sold.SalesRevenue, 0)                             AS SalesRevenue,
    sold.LastSoldOn
FROM GIFTSHOP_PRODUCT p
LEFT JOIN (
    
    SELECT
        si.ProductID,
        SUM(si.Quantity)                      AS UnitsSold,
        SUM(si.Quantity * si.UnitPriceAtSale) AS SalesRevenue,
        MAX(s.SaleDateTime)                   AS LastSoldOn
    FROM GIFTSHOP_SALE_ITEM si
    JOIN GIFTSHOP_SALE s ON s.SaleID = si.SaleID
    WHERE s.SaleStatus = 'Completed'
    GROUP BY si.ProductID
) AS sold ON sold.ProductID = p.ProductID
WHERE (@Category IS NULL OR p.Category = @Category)
  AND (COALESCE(@Stock, 'all') = 'all'
       OR p.QuantityInStock < COALESCE(@Threshold, 5))
ORDER BY
    CASE
        WHEN p.QuantityInStock = 0                       THEN 1
        WHEN p.QuantityInStock < COALESCE(@Threshold, 5) THEN 2
        ELSE 3
    END,
    p.QuantityInStock,
    p.ProductName;
