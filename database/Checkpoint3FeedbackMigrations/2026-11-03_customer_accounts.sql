
USE MuseumDatabase_Test;

-- Add a role for customers.
INSERT INTO USER_ROLE (RoleName, RoleDescription)
SELECT 'Customer', 'Museum visitor account'
WHERE NOT EXISTS (
    SELECT 1
    FROM USER_ROLE
    WHERE RoleName = 'Customer'
);

-- Store login credentials for registered visitors.
CREATE TABLE IF NOT EXISTS CUSTOMER_ACCOUNT (
    AccountID INT UNSIGNED AUTO_INCREMENT,
    VisitorID INT UNSIGNED NOT NULL,
    RoleID INT UNSIGNED NOT NULL,
    Email VARCHAR(254) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    AccountStatus VARCHAR(30) NOT NULL DEFAULT 'Active',
    CreatedDateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (AccountID),

    UNIQUE KEY uq_customer_visitor (VisitorID),
    UNIQUE KEY uq_customer_email (Email),

    FOREIGN KEY (VisitorID)
        REFERENCES VISITOR(VisitorID)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (RoleID)
        REFERENCES USER_ROLE(RoleID)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);
