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



DROP TRIGGER IF EXISTS deactivate_low_stock_product;

DELIMITER $$

CREATE TRIGGER deactivate_low_stock_product
BEFORE UPDATE ON GIFTSHOP_PRODUCT
FOR EACH ROW
BEGIN
    IF OLD.QuantityInStock >= 5 AND NEW.QuantityInStock < 5 THEN
        SET NEW.IsActive = 0;
    END IF;
END$$

DELIMITER ;


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


