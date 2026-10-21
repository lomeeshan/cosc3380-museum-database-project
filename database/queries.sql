USE MuseumDatabase;

SET @ArtistID = 8;   

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
JOIN ARTIST_CREATES_ARTWORK aca ON aca.ArtistID     = ar.ArtistID
JOIN ARTWORK aw                 ON aw.ArtworkID     = aca.ArtworkID
JOIN COLLECTION c               ON c.CollectionID   = aw.CollectionID
WHERE ar.ArtistID = @ArtistID
ORDER BY aw.CreationYear, aw.Title;


SET @ExhibitionID = 1;   

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
WHERE ex.ExhibitionID = @ExhibitionID
ORDER BY ewe.AssignmentRole, e.LastName;


SET @ExhibitionID = 5;   

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
JOIN GALLERY g                              ON g.GalleryID     = ex.GalleryID
JOIN ARTWORK_PARTICIPATESIN_EXHIBITION ape  ON ape.ExhibitionID = ex.ExhibitionID
JOIN ARTWORK aw                             ON aw.ArtworkID    = ape.ArtworkID
LEFT JOIN ARTIST_CREATES_ARTWORK aca        ON aca.ArtworkID   = aw.ArtworkID
LEFT JOIN ARTIST ar                         ON ar.ArtistID     = aca.ArtistID
WHERE ex.ExhibitionID = @ExhibitionID
GROUP BY ex.ExhibitionID, ex.ExhibitionTitle, g.GalleryName,
         ape.DisplayOrder, aw.ArtworkID, aw.Title, aw.CreationYear,
         aw.Medium, ape.DisplayNotes
ORDER BY ape.DisplayOrder;