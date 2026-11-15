USE MuseumDatabase;


-- BUSINESS-RULE TRIGGER 1: GIFT SHOP LOW STOCK
DROP TRIGGER IF EXISTS deactivate_low_stock_product;

DELIMITER $$

CREATE TRIGGER deactivate_low_stock_product
BEFORE UPDATE ON GIFTSHOP_PRODUCT
FOR EACH ROW
BEGIN

    -- Business rule: Products with zero inventory
    -- must not remain available for sale.
    IF NEW.QuantityInStock = 0 THEN

        -- Automatically deactivate the product.
        SET NEW.IsActive = 0;

        -- Only notify when stock first drops to zero.
        IF OLD.QuantityInStock > 0 THEN

            INSERT INTO MUSEUM_NOTIFICATION
                (NotificationType, EntityType, EntityID,
                 TargetRole, Message)
            VALUES
                (
                    'GiftShopOutOfStock',
                    'Product',
                    NEW.ProductID,
                    'Admin',
                    CONCAT(
                        'Gift shop product #', NEW.ProductID,
                        ' is out of stock and has been deactivated.'
                    )
                ),
                (
                    'GiftShopOutOfStock',
                    'Product',
                    NEW.ProductID,
                    'Sales Staff',
                    CONCAT(
                        'Gift shop product #', NEW.ProductID,
                        ' is out of stock and has been deactivated.'
                    )
                );

        END IF;

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
    -- Notify the Curator and Admin when maintenance is required.
    INSERT INTO MUSEUM_NOTIFICATION
        (NotificationType, EntityType, EntityID,
         TargetRole, Message)
    VALUES
        (
            'ArtworkMaintenance',
            'Artwork',
            NEW.ArtworkID,
            'Curator',
            CONCAT('Artwork #', NEW.ArtworkID,
                   ' requires maintenance. Work order opened.')
        ),
        (
            'ArtworkMaintenance',
            'Artwork',
            NEW.ArtworkID,
            'Admin',
            CONCAT('Artwork #', NEW.ArtworkID,
                   ' requires maintenance. Work order opened.')
        );


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