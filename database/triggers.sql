USE MuseumDatabase;


-- BUSINESS-RULE TRIGGER 1: GIFT SHOP LOW STOCK
DROP TRIGGER IF EXISTS deactivate_low_stock_product;

DELIMITER $$

CREATE TRIGGER deactivate_low_stock_product
BEFORE UPDATE ON GIFTSHOP_PRODUCT
FOR EACH ROW
BEGIN
    IF NEW.QuantityInStock = 0 THEN
        SET NEW.IsActive = 0;
    END IF;
END$$

DELIMITER ;



-- BUSINESS-RULE TRIGGER 2: ARTWORK MAINTENANCE
DROP TRIGGER IF EXISTS manage_artwork_maintenance;

DELIMITER $$

CREATE TRIGGER manage_artwork_maintenance
BEFORE UPDATE ON ARTWORK
FOR EACH ROW
BEGIN

    -- Deactivate artwork requiring maintenance.
    IF NEW.NeedsMaintenance = 1 THEN
        SET NEW.IsActive = 0;
    END IF;

    -- Automatically create a maintenance work order.
    IF OLD.NeedsMaintenance = 0
       AND NEW.NeedsMaintenance = 1 THEN

        INSERT INTO ARTWORK_MAINTENANCE_LOG
            (ArtworkID, Status)
        VALUES
            (NEW.ArtworkID, 'Open');

    -- Automatically resolve the existing work order.
    ELSEIF OLD.NeedsMaintenance = 1
       AND NEW.NeedsMaintenance = 0 THEN

        UPDATE ARTWORK_MAINTENANCE_LOG
        SET Status = 'Resolved',
            ResolvedAt = NOW()
        WHERE ArtworkID = NEW.ArtworkID
          AND Status = 'Open';

    END IF;

END$$

DELIMITER ;

-- NON-GRADED TRIGGER: TICKET EXPIRATION
-- WE DO NOT WANT THE TICKET-EXPIRATION TRIGGER TO BE GRADED

DROP TRIGGER IF EXISTS set_ticket_expiration;

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