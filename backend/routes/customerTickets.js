
const express = require('express');
const db = require('../db/connection');
const { requireCustomer } = require('../middleware/customerAuth');

const router = express.Router();

// Use the same prices as the existing staff ticket system
const PRICE = {
    Adult: 20,
    Child: 8,
    Student: 12,
    Senior: 14
};

// Check that the visit date is a real date
function validVisitDate(value) {
    if (
        typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(value + 'T00:00:00Z');

    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value;
}

// Get today's date using the museum's local time zone.
function todayInMuseumTimeZone() {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

router.use(requireCustomer);

// Also check that the customer account is still active
router.use(async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT a.VisitorID
             FROM CUSTOMER_ACCOUNT AS a
             JOIN USER_ROLE AS r
                ON a.RoleID = r.RoleID
             WHERE a.VisitorID = ?
               AND a.AccountStatus = 'Active'
               AND r.RoleName = 'Customer'
             LIMIT 1`,
            [req.customer.visitorId]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                error: 'Customer account is not active.'
            });
        }

        next();

    } catch (error) {
        next(error);
    }
});

// GET /api/customer/tickets
// Retrieve tickets belonging to the logged-in customer
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                t.TicketID,
                t.TicketType,
                t.TicketPrice,
                DATE_FORMAT(
                    t.VisitDate, '%Y-%m-%d'
                ) AS VisitDate,
                DATE_FORMAT(
                    t.ExpirationDateTime,
                    '%Y-%m-%d %H:%i:%s'
                ) AS ExpirationDateTime,
                e.ExhibitionTitle
             FROM TICKET AS t
             LEFT JOIN EXHIBITION AS e
                ON t.ExhibitionID = e.ExhibitionID
             WHERE t.VisitorID = ?
             ORDER BY t.TicketID DESC
             LIMIT 100`,
            [req.customer.visitorId]
        );

        res.json(rows);

    } catch (error) {
        next(error);
    }
});

// POST /api/customer/tickets
// Create a demo ticket for the logged-in customer
router.post('/', async (req, res, next) => {
    const { exhibitionId, ticketType, visitDate } = req.body || {};

    // NULL exhibitionID means general admission
    const isGeneralAdmission =
        exhibitionId === null || exhibitionId === '';

    const selectedExhibition = isGeneralAdmission
        ? null
        : Number(exhibitionId);

    if (
        (!isGeneralAdmission &&
            (!Number.isSafeInteger(selectedExhibition) ||
                selectedExhibition < 1)) ||
            !Object.hasOwn(PRICE, ticketType) ||
            !validVisitDate(visitDate)
    ) {
    return res.status(400).json({
        error: 'Select a valid admission, ticket type, and visit date.'
    });
}

    if (visitDate < todayInMuseumTimeZone()) {
    return res.status(400).json({
        error: 'Visit date cannot be in the past.'
    });
}

    try {
        // General Admission does not require an exhibition.
        // Exhibition-specific tickets still require a valid exhibition.
        if (!isGeneralAdmission) {
            const [exhibitions] = await db.execute(
                `SELECT ExhibitionID
                FROM EXHIBITION
                WHERE ExhibitionID = ?
                AND Status IN ('Active', 'Upcoming')
                AND ? BETWEEN StartDate AND EndDate
                AND ? >= CURDATE()`,
            [selectedExhibition, visitDate, visitDate]
    );

    if (exhibitions.length === 0) {
        return res.status(409).json({
            error: 'This exhibition is not available on the selected date.'
        });
    }
}
        const price = PRICE[ticketType];

        // VisitorID comes from the verified login session
        const [result] = await db.execute(
            `INSERT INTO TICKET
                (VisitorID, ExhibitionID, TicketType,
                 TicketTime, TicketPrice, VisitDate)
             VALUES (?, ?, ?, NOW(), ?, ?)`,
            [
                req.customer.visitorId,
                selectedExhibition,
                ticketType,
                price,
                visitDate
            ]
        );

        res.status(201).json({
            message: 'Demo ticket reserved successfully. No payment processed.',
            ticketId: result.insertId,
            price: price,
            visitDate: visitDate
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
