const express = require('express');
const db = require('../db/connection');
const router = express.Router();

router.get('/exhibitions', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT ex.ExhibitionID,ex.ExhibitionTitle,ex.Description,ex.Status,DATE_FORMAT(ex.StartDate,'%Y-%m-%d') AS StartDate,DATE_FORMAT(ex.EndDate,'%Y-%m-%d') AS EndDate,g.GalleryName FROM EXHIBITION ex JOIN GALLERY g ON g.GalleryID=ex.GalleryID ORDER BY ex.StartDate DESC LIMIT 100"
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/artworks', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT ArtworkID, Title, Medium, CreationYear, Description FROM ARTWORK WHERE IsActive = 1 ORDER BY ArtworkID DESC LIMIT 100'
    );
    res.json(rows);
  } catch (e) { next(e); }
});

module.exports = router;
