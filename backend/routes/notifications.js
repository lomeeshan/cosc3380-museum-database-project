
const express = require('express');
const db = require('../db/connection');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();

// Only authenticated museum employees can view notifications.
router.use(
    requireLogin,
    requireRole('Admin', 'Curator', 'Sales Staff')
);

// GET /api/notifications
router.get('/', async (req, res, next) => {
    try {
        // Show only notifications intended for this user's role.
        const [notifications] = await db.execute(
            `SELECT
                NotificationID,
                NotificationType,
                EntityType,
                EntityID,
                Message,
                CreatedAt
             FROM MUSEUM_NOTIFICATION
             WHERE TargetRole = ?
             ORDER BY CreatedAt DESC, NotificationID DESC
             LIMIT 20`,
            [req.user.role]
        );

        res.json(notifications);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
