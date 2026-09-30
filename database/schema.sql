USE MuseumDatabase;

CREATE TABLE COLLECTION (
    CollectionID INT UNSIGNED AUTO_INCREMENT,
    CollectionName VARCHAR(100) NOT NULL,
    Description VARCHAR(500),

    PRIMARY KEY (CollectionID)
);

CREATE TABLE ARTIST (
    ArtistID INT UNSIGNED AUTO_INCREMENT,
    ArtistName VARCHAR(150) NOT NULL,
    BirthYear INT,
    DeathYear INT,
    Nationality VARCHAR(100),
    Biography VARCHAR(500),

    PRIMARY KEY (ArtistID)
);

CREATE TABLE GALLERY (
    GalleryID INT UNSIGNED AUTO_INCREMENT,
    GalleryName VARCHAR(100) NOT NULL,
    Capacity INT,
    AccessibilityNotes VARCHAR(255),

    PRIMARY KEY (GalleryID)
);


CREATE TABLE VISITOR (
    VisitorID INT UNSIGNED AUTO_INCREMENT,
    FirstName VARCHAR(80) NOT NULL,
    LastName VARCHAR(80) NOT NULL,
    Email VARCHAR(254),
    Phone VARCHAR(25),

    PRIMARY KEY (VisitorID)
);

CREATE TABLE TICKET (
    TicketID INT UNSIGNED AUTO_INCREMENT,
    VisitorID INT UNSIGNED NOT NULL,
    TicketType VARCHAR(30) NOT NULL,
    TicketTime DATETIME NOT NULL,
    TicketPrice DECIMAL(8,2) NOT NULL,

    PRIMARY KEY (TicketID),

    FOREIGN KEY (VisitorID)
        REFERENCES VISITOR(VisitorID),

    CHECK (TicketPrice >= 0)
);

CREATE TABLE GIFTSHOP_PRODUCT (
    ProductID INT UNSIGNED AUTO_INCREMENT,
    ProductName VARCHAR(150) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    CurrentPrice DECIMAL(8,2) NOT NULL,
    QuantityInStock INT NOT NULL,
    IsActive BOOLEAN NOT NULL,

    PRIMARY KEY (ProductID),

    CONSTRAINT chk_giftshop_product_price
        CHECK (CurrentPrice >= 0),

    CONSTRAINT chk_giftshop_product_quantity
        CHECK (QuantityInStock >= 0)
);

CREATE TABLE DEPARTMENT (
    DepartmentID INT UNSIGNED AUTO_INCREMENT,
    DepartmentName VARCHAR(100) NOT NULL,
    OfficeLocation VARCHAR(100),
    PhoneExtension VARCHAR(10),

    PRIMARY KEY (DepartmentID)
);


CREATE TABLE USER_ROLE (
    RoleID INT UNSIGNED AUTO_INCREMENT,
    RoleName VARCHAR(50) NOT NULL,
    RoleDescription VARCHAR(255),

    PRIMARY KEY (RoleID)
);



CREATE TABLE ARTWORK (
    ArtworkID INT UNSIGNED AUTO_INCREMENT,
    CollectionID INT UNSIGNED NOT NULL,
    AccessionNumber VARCHAR(50) NOT NULL,
    Title VARCHAR(200) NOT NULL,
    CreationYear INT,
    Medium VARCHAR(100) NOT NULL,
    Dimensions VARCHAR(100),
    Description VARCHAR(500),

    PRIMARY KEY (ArtworkID),

    FOREIGN KEY (CollectionID)
        REFERENCES COLLECTION(CollectionID)
);

CREATE TABLE EXHIBITION (
    ExhibitionID INT UNSIGNED AUTO_INCREMENT,
    GalleryID INT UNSIGNED NOT NULL,
    ExhibitionTitle VARCHAR(200) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Description VARCHAR(500),
    Status VARCHAR(30) NOT NULL,

    PRIMARY KEY (ExhibitionID),

    FOREIGN KEY (GalleryID)
        REFERENCES GALLERY(GalleryID),

    CHECK (EndDate >= StartDate)
);



CREATE TABLE EMPLOYEE (
    EmployeeID INT UNSIGNED AUTO_INCREMENT,
    DepartmentID INT UNSIGNED NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    JobTitle VARCHAR(100) NOT NULL,
    HireDate DATE NOT NULL,
    Email VARCHAR(100),
    EmploymentStatus VARCHAR(30) NOT NULL,

    PRIMARY KEY (EmployeeID),

    FOREIGN KEY (DepartmentID)
        REFERENCES DEPARTMENT(DepartmentID)
);

CREATE TABLE GIFTSHOP_SALE (
    SaleID INT UNSIGNED AUTO_INCREMENT,
    EmployeeID INT UNSIGNED NOT NULL,
    SaleDateTime DATETIME NOT NULL,
    PaymentMethod VARCHAR(30) NOT NULL,
    SaleStatus VARCHAR(30) NOT NULL,

    PRIMARY KEY (SaleID),

    FOREIGN KEY (EmployeeID)
        REFERENCES EMPLOYEE(EmployeeID)
        
);

CREATE TABLE GIFTSHOP_SALE_ITEM (
    SaleID INT UNSIGNED NOT NULL,
    ProductID INT UNSIGNED NOT NULL,
    Quantity INT NOT NULL,
    UnitPriceAtSale DECIMAL(8,2) NOT NULL,

    PRIMARY KEY (SaleID, ProductID),

    FOREIGN KEY (SaleID)
        REFERENCES GIFTSHOP_SALE(SaleID),

    FOREIGN KEY (ProductID)
        REFERENCES GIFTSHOP_PRODUCT(ProductID),

    CHECK (Quantity > 0),
    CHECK (UnitPriceAtSale >= 0)
);


CREATE TABLE ARTIST_CREATES_ARTWORK (
    ArtistID INT UNSIGNED NOT NULL,
    ArtworkID INT UNSIGNED NOT NULL,
    CreatorRole VARCHAR(100),

    PRIMARY KEY (ArtistID, ArtworkID),

    FOREIGN KEY (ArtistID)
        REFERENCES ARTIST(ArtistID),

    FOREIGN KEY (ArtworkID)
        REFERENCES ARTWORK(ArtworkID)
);

CREATE TABLE ARTWORK_PARTICIPATESIN_EXHIBITION (
    ExhibitionID INT UNSIGNED NOT NULL,
    ArtworkID INT UNSIGNED NOT NULL,
    DisplayOrder INT,
    DisplayNotes VARCHAR(255),

    PRIMARY KEY (ExhibitionID, ArtworkID),

    FOREIGN KEY (ExhibitionID)
        REFERENCES EXHIBITION(ExhibitionID),

    FOREIGN KEY (ArtworkID)
        REFERENCES ARTWORK(ArtworkID)
);


CREATE TABLE EMPLOYEE_WORKSON_EXHIBITION (
    EmployeeID INT UNSIGNED NOT NULL,
    ExhibitionID INT UNSIGNED NOT NULL,
    AssignmentRole VARCHAR(100) NOT NULL,

    PRIMARY KEY (EmployeeID, ExhibitionID),

    FOREIGN KEY (EmployeeID)
        REFERENCES EMPLOYEE(EmployeeID),

    FOREIGN KEY (ExhibitionID)
        REFERENCES EXHIBITION(ExhibitionID)
);

CREATE TABLE EMPLOYEE_ACCOUNT (
    AccountID INT UNSIGNED AUTO_INCREMENT,
    EmployeeID INT UNSIGNED NOT NULL,
    RoleID INT UNSIGNED NOT NULL,
    Username VARCHAR(50) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    AccountStatus VARCHAR(30) NOT NULL,
    CreatedDateTime DATETIME NOT NULL,

    PRIMARY KEY (AccountID),
    UNIQUE (EmployeeID),
    UNIQUE (Username),

    FOREIGN KEY (EmployeeID)
        REFERENCES EMPLOYEE(EmployeeID),

    FOREIGN KEY (RoleID)
        REFERENCES USER_ROLE(RoleID)
);