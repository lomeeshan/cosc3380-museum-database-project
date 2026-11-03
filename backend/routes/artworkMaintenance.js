
const express = require('express');
const db = require('../db/connection');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();

 // GET /api/artworks/maintenance/orders
 // Admins and Curators can view maintenance history, but only curators can make a work order
 router.get(
   '/maintenance/orders',
   requireLogin,
   requireRole('Admin', 'Curator'),
   async (req, res, next) => {
     try {
       const [rows] = await db.query(`
         SELECT
           m.MaintenanceID,
           m.ArtworkID,
           a.Title,
           m.ReportedAt,
           m.ResolvedAt,
           m.Status
         FROM ARTWORK_MAINTENANCE_LOG AS m
         JOIN ARTWORK AS a
           ON m.ArtworkID = a.ArtworkID
         ORDER BY m.MaintenanceID DESC
         LIMIT 100
       `);

       res.json(rows);
     } catch (error) {
       next(error);
     }
   }
 );

// Only logged-in Curators can use these
router.use(requireLogin, requireRole('Curator'));

// PATCH /api/artworks/:id/maintenance
router.patch('/:id/maintenance', async (req, res, next) => {
    const artworkId = Number(req.params.id);
    const { needsMaintenance } = req.body || {};

    // Validate the artwork ID.
    if (
        !/^[1-9]\d*$/.test(req.params.id) ||
        !Number.isSafeInteger(artworkId)
    ) {
        return res.status(400).json({
            error: 'Invalid artwork ID.'
        });
    }

    // Require true or false
    if (typeof needsMaintenance !== 'boolean') {
        return res.status(400).json({
            error: 'needsMaintenance must be true or false.'
        });
    }

    try {
        let result;

        if (needsMaintenance) {
            // Trigger automatically sets IsActive = 0
            [result] = await db.execute(
                `UPDATE ARTWORK
                 SET NeedsMaintenance = 1
                 WHERE ArtworkID = ?`,
                [artworkId]
            );
        } else {
            // The Curator completes maintenance and reactivates artwork
            [result] = await db.execute(
                `UPDATE ARTWORK
                 SET NeedsMaintenance = 0,
                     IsActive = 1
                 WHERE ArtworkID = ?`,
                [artworkId]
            );
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Artwork not found.'
            });
        }

        // Read the actual values after the trigger has executed
        const [rows] = await db.execute(
            `SELECT
                ArtworkID,
                Title,
                NeedsMaintenance,
                IsActive
             FROM ARTWORK
             WHERE ArtworkID = ?`,
            [artworkId]
        );

        return res.json({
            message: needsMaintenance
                ? 'Artwork deactivated for maintenance.'
                : 'Artwork maintenance completed and artwork reactivated.',
            artwork: rows[0]
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
