const express = require('express');
const db = require('../db/connection');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin, requireRole('Admin'));

const DEFAULT_THRESHOLD = 5;


function badRequest(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}

function readText(value) {
    if (typeof value !== 'string') return null;
    const text = value.trim();
    return text === '' ? null : text;
}

function readChoice(value, name, choices, defaultValue) {
    const text = readText(value);
    if (text === null) return defaultValue;

    const choice = text.toLowerCase();
    if (!choices.includes(choice)) {
        throw badRequest(`${name} must be one of: ${choices.join(', ')}`);
    }
    return choice;
}

function readDate(value, name) {
    const text = readText(value);
    if (text === null) return null;

    const date = new Date(`${text}T00:00:00Z`);
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(text) ||
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== text
    ) {
        throw badRequest(`${name} must be a date in the format YYYY-MM-DD`);
    }
    return text;
}

function readDateRange(query) {
    const startDate = readDate(query.startDate, 'startDate');
    const endDate = readDate(query.endDate, 'endDate');
    if (startDate && endDate && startDate > endDate) {
        throw badRequest('startDate must be on or before endDate');
    }
    return { startDate, endDate };
}

function readWholeNumber(value, name, min, max, defaultValue) {
    const text = readText(value);
    if (text === null) return defaultValue;

    const number = Number(text);
    if (!/^\d+$/.test(text) || number < min || number > max) {
        throw badRequest(`${name} must be a whole number from ${min} to ${max}`);
    }
    return number;
}

function readShortText(value, name, maxLength) {
    const text = readText(value);
    if (text !== null && text.length > maxLength) {
        throw badRequest(`${name} must be ${maxLength} characters or fewer`);
    }
    return text;
}

function toNumbers(rows, columns) {
    return rows.map((row) => {
        const copy = { ...row };
        for (const column of columns) {
            if (copy[column] !== null && copy[column] !== undefined) {
                copy[column] = Number(copy[column]);
            }
        }
        return copy;
    });
}


const COMBINED_REVENUE_SQL = `
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
    WHERE ? IN ('tickets', 'combined')
      AND DATE(TicketTime) BETWEEN COALESCE(?, '1000-01-01')
                               AND COALESCE(?, '9999-12-31')
    UNION
    SELECT DATE_FORMAT(SaleDateTime, '%Y-%m')
    FROM GIFTSHOP_SALE
    WHERE ? IN ('giftshop', 'combined')
      AND SaleStatus = 'Completed'
      AND DATE(SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                 AND COALESCE(?, '9999-12-31')
) AS m
LEFT JOIN (
    SELECT DATE_FORMAT(TicketTime, '%Y-%m') AS SaleMonth,
           COUNT(*)         AS TicketsSold,
           SUM(TicketPrice) AS TicketRevenue
    FROM TICKET
    WHERE ? IN ('tickets', 'combined')
      AND DATE(TicketTime) BETWEEN COALESCE(?, '1000-01-01')
                               AND COALESCE(?, '9999-12-31')
    GROUP BY DATE_FORMAT(TicketTime, '%Y-%m')
) AS t ON t.SaleMonth = m.SaleMonth
LEFT JOIN (
    SELECT DATE_FORMAT(s.SaleDateTime, '%Y-%m')  AS SaleMonth,
           COUNT(DISTINCT s.SaleID)              AS GiftShopSales,
           SUM(si.Quantity * si.UnitPriceAtSale) AS GiftShopRevenue
    FROM GIFTSHOP_SALE s
    JOIN GIFTSHOP_SALE_ITEM si ON si.SaleID = s.SaleID
    WHERE ? IN ('giftshop', 'combined')
      AND s.SaleStatus = 'Completed'
      AND DATE(s.SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                   AND COALESCE(?, '9999-12-31')
    GROUP BY DATE_FORMAT(s.SaleDateTime, '%Y-%m')
) AS g ON g.SaleMonth = m.SaleMonth
ORDER BY m.SaleMonth`;

router.get('/combined-revenue', async (req, res) => {
    const source = readChoice(
        req.query.source, 'source', ['tickets', 'giftshop', 'combined'], 'combined'
    );
    const { startDate, endDate } = readDateRange(req.query);

    const oneBlock = [source, startDate, endDate];
    const params = [...oneBlock, ...oneBlock, ...oneBlock, ...oneBlock];

    const [rows] = await db.query(COMBINED_REVENUE_SQL, params);

    res.json(toNumbers(rows, [
        'TicketsSold', 'TicketRevenue', 'GiftShopSales',
        'GiftShopRevenue', 'TotalRevenue'
    ]));
});


const TICKET_SALES_SQL = `
SELECT
    ExhibitionID, ExhibitionTitle, GalleryName, Status, StartDate, EndDate,
    TicketsSold, UniqueVisitors, Revenue, AvgTicketPrice,
    AdultTickets, ChildTickets, StudentTickets, SeniorTickets,
    ROUND(100 * Revenue / NULLIF((
        SELECT SUM(TicketPrice)
        FROM TICKET
        WHERE VisitDate BETWEEN COALESCE(?, '1000-01-01')
                            AND COALESCE(?, '9999-12-31')
          AND (? IS NULL OR TicketType = ?)
    ), 0), 1) AS PctOfTotalRevenue
FROM (
    SELECT
        ex.ExhibitionID,
        ex.ExhibitionTitle,
        g.GalleryName,
        ex.Status,
        DATE_FORMAT(ex.StartDate, '%Y-%m-%d')     AS StartDate,
        DATE_FORMAT(ex.EndDate, '%Y-%m-%d')       AS EndDate,
        COUNT(t.TicketID)                         AS TicketsSold,
        COUNT(DISTINCT t.VisitorID)               AS UniqueVisitors,
        COALESCE(SUM(t.TicketPrice), 0)           AS Revenue,
        ROUND(AVG(t.TicketPrice), 2)              AS AvgTicketPrice,
        COALESCE(SUM(t.TicketType = 'Adult'), 0)   AS AdultTickets,
        COALESCE(SUM(t.TicketType = 'Child'), 0)   AS ChildTickets,
        COALESCE(SUM(t.TicketType = 'Student'), 0) AS StudentTickets,
        COALESCE(SUM(t.TicketType = 'Senior'), 0)  AS SeniorTickets
    FROM EXHIBITION ex
    JOIN GALLERY g ON g.GalleryID = ex.GalleryID
    LEFT JOIN TICKET t
           ON t.ExhibitionID = ex.ExhibitionID
          AND t.VisitDate BETWEEN COALESCE(?, '1000-01-01')
                              AND COALESCE(?, '9999-12-31')
          AND (? IS NULL OR t.TicketType = ?)
    WHERE (? IS NULL OR ex.ExhibitionID = ?)
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
    WHERE ? IS NULL
      AND t.ExhibitionID IS NULL
      AND t.VisitDate BETWEEN COALESCE(?, '1000-01-01')
                          AND COALESCE(?, '9999-12-31')
      AND (? IS NULL OR t.TicketType = ?)
    HAVING COUNT(t.TicketID) > 0
) AS report
ORDER BY (ExhibitionID IS NULL), Revenue DESC, ExhibitionTitle`;

router.get('/ticket-sales-by-exhibition', async (req, res) => {
    const exhibitionId = readWholeNumber(
        req.query.exhibitionId, 'exhibitionId', 1, 2147483647, null
    );
    const ticketType = readShortText(req.query.ticketType, 'ticketType', 30);
    const { startDate, endDate } = readDateRange(req.query);

    const params = [
        startDate, endDate, ticketType, ticketType,

        startDate, endDate, ticketType, ticketType,
        exhibitionId, exhibitionId,

        exhibitionId, startDate, endDate, ticketType, ticketType
    ];

    const [rows] = await db.query(TICKET_SALES_SQL, params);

    res.json(toNumbers(rows, [
        'TicketsSold', 'UniqueVisitors', 'Revenue', 'AvgTicketPrice',
        'AdultTickets', 'ChildTickets', 'StudentTickets', 'SeniorTickets',
        'PctOfTotalRevenue'
    ]));
});


const GIFTSHOP_INVENTORY_SQL = `
SELECT
    p.ProductID,
    p.ProductName,
    p.Category,
    p.CurrentPrice,
    p.QuantityInStock,
    CASE
        WHEN p.QuantityInStock = 0 THEN 'Out of Stock'
        WHEN p.QuantityInStock < ? THEN 'Low Stock'
        ELSE 'In Stock'
    END                                                      AS StockStatus,
    CASE WHEN p.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS ProductStatus,
    p.CurrentPrice * p.QuantityInStock                       AS InventoryValue,
    COALESCE(sold.UnitsSold, 0)                              AS UnitsSold,
    COALESCE(sold.SalesRevenue, 0)                           AS SalesRevenue,
    DATE_FORMAT(sold.LastSoldOn, '%Y-%m-%d %H:%i:%s')        AS LastSoldOn
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
      AND DATE(s.SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                   AND COALESCE(?, '9999-12-31')
    GROUP BY si.ProductID
) AS sold ON sold.ProductID = p.ProductID
WHERE (? IS NULL OR p.Category = ?)
  AND (? = 'all' OR p.QuantityInStock < ?)
ORDER BY
    CASE
        WHEN p.QuantityInStock = 0 THEN 1
        WHEN p.QuantityInStock < ? THEN 2
        ELSE 3
    END,
    p.QuantityInStock,
    p.ProductName`;

router.get('/giftshop-inventory', async (req, res) => {
    const category = readShortText(req.query.category, 'category', 50);
    const threshold = readWholeNumber(
        req.query.threshold, 'threshold', 0, 1000000, DEFAULT_THRESHOLD
    );
    const stock = readChoice(req.query.stock, 'stock', ['all', 'low'], 'all');
    const { startDate, endDate } = readDateRange(req.query);

    const params = [
        threshold,
        startDate, endDate,
        category, category,
        stock, threshold,
        threshold
    ];

    const [rows] = await db.query(GIFTSHOP_INVENTORY_SQL, params);

    res.json(toNumbers(rows, [
        'CurrentPrice', 'QuantityInStock', 'InventoryValue',
        'UnitsSold', 'SalesRevenue'
    ]));
});

// Report 4: completed gift-shop sales ranked by quantity sold.
// Prices come from UnitPriceAtSale (historical price), NOT CurrentPrice.
router.get('/giftshop-top-products', async (req, res) => {
    const { startDate, endDate } = readDateRange(req.query);

    const [rows] = await db.query(
        `
        SELECT p.ProductID, p.ProductName, p.Category,
               SUM(si.Quantity) AS UnitsSold,
               COUNT(DISTINCT s.SaleID) AS SaleCount,
               ROUND(SUM(si.Quantity * si.UnitPriceAtSale), 2) AS SalesRevenue
        FROM GIFTSHOP_SALE_ITEM si
        JOIN GIFTSHOP_SALE s ON s.SaleID = si.SaleID
        JOIN GIFTSHOP_PRODUCT p ON p.ProductID = si.ProductID
        WHERE s.SaleStatus = 'Completed'
          AND DATE(s.SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                       AND COALESCE(?, '9999-12-31')
        GROUP BY p.ProductID, p.ProductName, p.Category
        ORDER BY UnitsSold DESC, SalesRevenue DESC, p.ProductName
        `,
        [startDate, endDate]
    );

    res.json(toNumbers(rows, ['UnitsSold', 'SaleCount', 'SalesRevenue']));
});

// Report 5: ticket counts by exhibition and ticket type.
// UniqueVisitors counts DISTINCT VisitorID within each exhibition.
// This represents ticketed visits, not scanned entry/attendance.
router.get('/visitors-by-exhibition', async (req, res) => {
    const { startDate, endDate } = readDateRange(req.query);

    const [rows] = await db.query(
        `
        SELECT ex.ExhibitionID, ex.ExhibitionTitle,
               COUNT(t.TicketID) AS TicketsSold,
               COUNT(DISTINCT t.VisitorID) AS UniqueVisitors,
               COALESCE(SUM(CASE WHEN t.TicketType = 'Adult' THEN 1 ELSE 0 END), 0) AS AdultTickets,
               COALESCE(SUM(CASE WHEN t.TicketType = 'Child' THEN 1 ELSE 0 END), 0) AS ChildTickets,
               COALESCE(SUM(CASE WHEN t.TicketType = 'Student' THEN 1 ELSE 0 END), 0) AS StudentTickets,
               COALESCE(SUM(CASE WHEN t.TicketType = 'Senior' THEN 1 ELSE 0 END), 0) AS SeniorTickets
        FROM EXHIBITION ex
        LEFT JOIN TICKET t ON t.ExhibitionID = ex.ExhibitionID
           AND t.VisitDate BETWEEN COALESCE(?, '1000-01-01')
                               AND COALESCE(?, '9999-12-31')
        GROUP BY ex.ExhibitionID, ex.ExhibitionTitle
        ORDER BY TicketsSold DESC, ex.ExhibitionTitle
        `,
        [startDate, endDate]
    );

    res.json(toNumbers(rows, [
        'TicketsSold', 'UniqueVisitors', 'AdultTickets', 'ChildTickets',
        'StudentTickets', 'SeniorTickets'
    ]));
});

// Source records for ALL five report panels. Report results and source rows
// use the same filters. Only whitelisted SQL queries are selected; all
// user-provided values are sent as MySQL parameters (? placeholders).
router.get('/source-records', async (req, res) => {
    const report = readChoice(req.query.report, 'report',
        ['revenue', 'tickets', 'inventory', 'products', 'visitors'], 'revenue');
    const { startDate, endDate } = readDateRange(req.query);
    let sql;
    let params;

    if (report === 'revenue') {
        const source = readChoice(req.query.source, 'source',
            ['tickets', 'giftshop', 'combined'], 'combined');
        sql = `
            SELECT CONCAT('T-', t.TicketID) AS RecordID,
                   'Ticket' AS Source,
                   DATE_FORMAT(t.TicketTime, '%Y-%m-%d %H:%i:%s') AS RecordedAt,
                   CONCAT(t.TicketType, ' ticket / Visitor ', t.VisitorID) AS Description,
                   1 AS Quantity,
                   t.TicketPrice AS UnitPrice,
                   t.TicketPrice AS Amount
            FROM TICKET t
            WHERE ? IN ('tickets', 'combined')
              AND DATE(t.TicketTime) BETWEEN COALESCE(?, '1000-01-01')
                                         AND COALESCE(?, '9999-12-31')
            UNION ALL
            SELECT CONCAT('G-', s.SaleID, '-P-', si.ProductID) AS RecordID,
                   'Gift Shop' AS Source,
                   DATE_FORMAT(s.SaleDateTime, '%Y-%m-%d %H:%i:%s') AS RecordedAt,
                   p.ProductName AS Description,
                   si.Quantity AS Quantity,
                   si.UnitPriceAtSale AS UnitPrice,
                   si.Quantity * si.UnitPriceAtSale AS Amount
            FROM GIFTSHOP_SALE s
            JOIN GIFTSHOP_SALE_ITEM si ON si.SaleID = s.SaleID
            JOIN GIFTSHOP_PRODUCT p ON p.ProductID = si.ProductID
            WHERE ? IN ('giftshop', 'combined')
              AND s.SaleStatus = 'Completed'
              AND DATE(s.SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                           AND COALESCE(?, '9999-12-31')
            ORDER BY RecordedAt DESC, RecordID
        `;
        params = [source, startDate, endDate, source, startDate, endDate];

    } else if (report === 'tickets') {
        const exhibitionId = readWholeNumber(req.query.exhibitionId,
            'exhibitionId', 1, 2147483647, null);
        const ticketType = readShortText(req.query.ticketType, 'ticketType', 30);
        sql = `
            SELECT t.TicketID,
                   DATE_FORMAT(t.VisitDate, '%Y-%m-%d') AS VisitDate,
                   t.VisitorID,
                   CONCAT(v.FirstName, ' ', v.LastName) AS VisitorName,
                   COALESCE(ex.ExhibitionTitle, 'General Admission') AS Exhibition,
                   t.TicketType, t.TicketPrice
            FROM TICKET t
            JOIN VISITOR v ON v.VisitorID = t.VisitorID
            LEFT JOIN EXHIBITION ex ON ex.ExhibitionID = t.ExhibitionID
            WHERE t.VisitDate BETWEEN COALESCE(?, '1000-01-01')
                                  AND COALESCE(?, '9999-12-31')
              AND (? IS NULL OR t.ExhibitionID = ?)
              AND (? IS NULL OR t.TicketType = ?)
            ORDER BY t.VisitDate DESC, t.TicketID DESC
        `;
        params = [startDate, endDate, exhibitionId, exhibitionId,
                  ticketType, ticketType];

    } else if (report === 'inventory') {
        const category = readShortText(req.query.category, 'category', 50);
        const threshold = readWholeNumber(req.query.threshold,
            'threshold', 0, 1000000, DEFAULT_THRESHOLD);
        const stock = readChoice(req.query.stock, 'stock', ['all', 'low'], 'all');
        sql = `
            SELECT p.ProductID, p.ProductName, p.Category, p.QuantityInStock,
                   CASE WHEN p.IsActive = 1 THEN 'Active' ELSE 'Inactive' END AS ProductStatus,
                   sold.SaleID,
                   DATE_FORMAT(sold.SaleDateTime, '%Y-%m-%d %H:%i:%s') AS SaleDateTime,
                   sold.Quantity AS UnitsSold,
                   sold.UnitPriceAtSale,
                   sold.Quantity * sold.UnitPriceAtSale AS LineRevenue
            FROM GIFTSHOP_PRODUCT p
            LEFT JOIN (
                SELECT si.ProductID, si.SaleID, s.SaleDateTime,
                       si.Quantity, si.UnitPriceAtSale
                FROM GIFTSHOP_SALE_ITEM si
                JOIN GIFTSHOP_SALE s ON s.SaleID = si.SaleID
                WHERE s.SaleStatus = 'Completed'
                  AND DATE(s.SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                               AND COALESCE(?, '9999-12-31')
            ) sold ON sold.ProductID = p.ProductID
            WHERE (? IS NULL OR p.Category = ?)
              AND (? = 'all' OR p.QuantityInStock < ?)
            ORDER BY p.ProductName, sold.SaleDateTime DESC
        `;
        params = [startDate, endDate, category, category, stock, threshold];

    } else if (report === 'products') {
        sql = `
            SELECT s.SaleID,
                   DATE_FORMAT(s.SaleDateTime, '%Y-%m-%d %H:%i:%s') AS SaleDateTime,
                   p.ProductID, p.ProductName,
                   si.Quantity AS UnitsSold,
                   si.UnitPriceAtSale,
                   si.Quantity * si.UnitPriceAtSale AS LineRevenue
            FROM GIFTSHOP_SALE_ITEM si
            JOIN GIFTSHOP_SALE s ON s.SaleID = si.SaleID
            JOIN GIFTSHOP_PRODUCT p ON p.ProductID = si.ProductID
            WHERE s.SaleStatus = 'Completed'
              AND DATE(s.SaleDateTime) BETWEEN COALESCE(?, '1000-01-01')
                                           AND COALESCE(?, '9999-12-31')
            ORDER BY s.SaleDateTime DESC, s.SaleID DESC
        `;
        params = [startDate, endDate];

    } else {
        sql = `
            SELECT t.TicketID,
                   DATE_FORMAT(t.VisitDate, '%Y-%m-%d') AS VisitDate,
                   t.VisitorID,
                   CONCAT(v.FirstName, ' ', v.LastName) AS VisitorName,
                   ex.ExhibitionTitle AS Exhibition,
                   t.TicketType, t.TicketPrice
            FROM TICKET t
            JOIN EXHIBITION ex ON ex.ExhibitionID = t.ExhibitionID
            JOIN VISITOR v ON v.VisitorID = t.VisitorID
            WHERE t.VisitDate BETWEEN COALESCE(?, '1000-01-01')
                                  AND COALESCE(?, '9999-12-31')
            ORDER BY t.VisitDate DESC, t.TicketID DESC
        `;
        params = [startDate, endDate];
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
});



module.exports = router;