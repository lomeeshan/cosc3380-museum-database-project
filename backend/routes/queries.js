
const express = require('express');
const db = require('../db/connection');

const router = express.Router();

function readId(value, name) {
    const text = typeof value === 'string' ? value.trim() : '';
    const number = Number(text);

    if (!/^\d+$/.test(text) || number < 1 || number > 2147483647) {
        const error = new Error(`${name} is required and must be a positive whole number`);
        error.status = 400; 
        throw error;
    }
    return number;
}


const ARTIST_ARTWORKS_SQL = `
SELECT
    ar.ArtistID,
    ar.ArtistName,
    aw.ArtworkID,
    aw.AccessionNumber,
    aw.Title,
    aw.CreationYear,
    aw.Medium,
    aca.CreatorRole,
    c.CollectionName
FROM ARTIST ar
JOIN ARTIST_CREATES_ARTWORK aca ON aca.ArtistID   = ar.ArtistID
JOIN ARTWORK aw                 ON aw.ArtworkID   = aca.ArtworkID
JOIN COLLECTION c               ON c.CollectionID = aw.CollectionID
WHERE ar.ArtistID = ?
ORDER BY aw.CreationYear, aw.Title`;

router.get('/artist-artworks', async (req, res) => {
    const artistId = readId(req.query.artistId, 'artistId');
    const [rows] = await db.query(ARTIST_ARTWORKS_SQL, [artistId]);
    res.json(rows);
});


const EXHIBITION_STAFF_SQL = `
SELECT
    ex.ExhibitionID,
    ex.ExhibitionTitle,
    e.EmployeeID,
    CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
    e.JobTitle,
    d.DepartmentName,
    ewe.AssignmentRole,
    e.EmploymentStatus
FROM EXHIBITION ex
JOIN EMPLOYEE_WORKSON_EXHIBITION ewe ON ewe.ExhibitionID = ex.ExhibitionID
JOIN EMPLOYEE e                      ON e.EmployeeID     = ewe.EmployeeID
JOIN DEPARTMENT d                    ON d.DepartmentID   = e.DepartmentID
WHERE ex.ExhibitionID = ?
ORDER BY ewe.AssignmentRole, e.LastName`;

router.get('/exhibition-staff', async (req, res) => {
    const exhibitionId = readId(req.query.exhibitionId, 'exhibitionId');
    const [rows] = await db.query(EXHIBITION_STAFF_SQL, [exhibitionId]);
    res.json(rows);
});


const EXHIBITION_ARTWORKS_SQL = `
SELECT
    ex.ExhibitionID,
    ex.ExhibitionTitle,
    g.GalleryName,
    ape.DisplayOrder,
    aw.ArtworkID,
    aw.Title,
    aw.CreationYear,
    aw.Medium,
    GROUP_CONCAT(ar.ArtistName ORDER BY ar.ArtistName SEPARATOR ', ') AS Artists,
    ape.DisplayNotes
FROM EXHIBITION ex
JOIN GALLERY g                             ON g.GalleryID      = ex.GalleryID
JOIN ARTWORK_PARTICIPATESIN_EXHIBITION ape ON ape.ExhibitionID = ex.ExhibitionID
JOIN ARTWORK aw                            ON aw.ArtworkID     = ape.ArtworkID
LEFT JOIN ARTIST_CREATES_ARTWORK aca       ON aca.ArtworkID    = aw.ArtworkID
LEFT JOIN ARTIST ar                        ON ar.ArtistID      = aca.ArtistID
WHERE ex.ExhibitionID = ?
GROUP BY ex.ExhibitionID, ex.ExhibitionTitle, g.GalleryName,
         ape.DisplayOrder, aw.ArtworkID, aw.Title, aw.CreationYear,
         aw.Medium, ape.DisplayNotes
ORDER BY ape.DisplayOrder`;

router.get('/exhibition-artworks', async (req, res) => {
    const exhibitionId = readId(req.query.exhibitionId, 'exhibitionId');
    const [rows] = await db.query(EXHIBITION_ARTWORKS_SQL, [exhibitionId]);
    res.json(rows);
});


module.exports = router;
