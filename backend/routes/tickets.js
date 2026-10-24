const express = require('express');
const db = require('../db/connection');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin, requireRole('Admin', 'Sales Staff'));


const PRICE = { Adult: 20, Child: 8, Student: 12, Senior: 14 };

function validVisitDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(date.getTime())
        && date.toISOString().slice(0, 10) === value;
}

router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query(`
            SELECT
                t.TicketID,
                DATE_FORMAT(t.TicketTime, '%b %e, %Y %h:%i %p') AS TicketTime,
                DATE_FORMAT(t.VisitDate, '%b %e, %Y') AS VisitDate,
                DATE_FORMAT(t.ExpirationDateTime, '%b %e, %Y %h:%i %p') AS ExpirationDateTime,
                t.TicketType,
                t.TicketPrice,

                CASE
                    WHEN t.ExpirationDateTime IS NULL THEN 'Unknown'
                    WHEN NOW() >= t.ExpirationDateTime THEN 'Expired'
                    ELSE 'Valid'
                END AS TicketStatus,

                CONCAT(v.FirstName, ' ', v.LastName) AS VisitorName,
                e.ExhibitionTitle

            FROM TICKET t
            JOIN VISITOR v
                ON t.VisitorID = v.VisitorID
            LEFT JOIN EXHIBITION e
                ON t.ExhibitionID = e.ExhibitionID

            ORDER BY t.TicketTime DESC
            LIMIT 150
        `);

        res.json(rows);

    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    const { visitorId, ticketType, exhibitionId, visitDate } = req.body || {};
    const exhibitionOK = exhibitionId == null || exhibitionId === ''
        || (Number.isSafeInteger(Number(exhibitionId)) && Number(exhibitionId) > 0);
    if (!Number.isSafeInteger(Number(visitorId)) || Number(visitorId) < 1
        || !Object.hasOwn(PRICE, ticketType)
        || !exhibitionOK || !validVisitDate(visitDate)) {
        return res.status(400).json({
            error: 'Select a valid visitor, ticket type, exhibition, and visit date (YYYY-MM-DD)'
        });
    }
    try {
        // The MySQL BEFORE INSERT trigger assigns ExpirationDateTime.
        const [result] = await db.execute(`
            INSERT INTO TICKET
                (VisitorID, ExhibitionID, TicketType, TicketTime, TicketPrice, VisitDate)
            VALUES (?, ?, ?, NOW(), ?, ?)
        `, [
            Number(visitorId),
            exhibitionId == null || exhibitionId === '' ? null : Number(exhibitionId),
            ticketType,
            PRICE[ticketType],
            visitDate
        ]);
        res.status(201).json({
            message: 'Ticket purchased',
            ticketId: result.insertId,
            price: PRICE[ticketType],
            visitDate: visitDate,
            expiresAt: visitDate + ' 23:59:00'
        });
    } catch (error) { next(error); }
});

module.exports = router;
