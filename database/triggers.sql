USE MuseumDatabase;

DELIMITER $$

CREATE TRIGGER set_ticket_expiration
BEFORE INSERT ON TICKET
FOR EACH ROW
BEGIN
    IF NEW.VisitDate IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Ticket visit date is required';
    END IF;

    SET NEW.ExpirationDateTime =
        TIMESTAMP(NEW.VisitDate, '23:59:00');
END$$

DELIMITER ;