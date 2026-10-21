Sample Data for Muesuem Database
USE MueseumDatabase;
INSERT INTO COLLECTION( CollectionID, CollectionName,Description) VALUES
(1, 'Impressionist Paintings', 'A collection of impressionist paintings from the late 19th century.'),
(2, 'Ancient Sculptures', 'A collection of sculptures from ancient civilizations.'),
(3, 'Modern Art', 'A collection of contemporary and modern art pieces.'),
(4, 'Photography', 'A collection of photographs from various eras and styles.'),
(5, 'Renaissance Art', 'A collection of art from the Renaissance period.'),
(6, 'Asian Art', 'A collection of art from various Asian cultures and time periods.');

INSERT INTO ARTIST( ArtistID, ArtistName,BirthYear, DeathYear, Nationality, Biography) VALUES
(1, 'Claude Monet', 1840, 1926, 'French', 'A founder of French Impressionist painting.'),
(2, 'Auguste Rodin', 1840, 1917, 'French', 'A renowned sculptor known for works like The Thinker.'),
(3, 'Pablo Picasso', 1881, 1973, 'Spanish', 'A co-founder of the Cubist movement and a prolific artist.'),
(4, 'Ansel Adams', 1902, 1984, 'American', 'A photographer known for his black-and-white landscape photographs of the American West.'),
(5, 'Leonardo da Vinci', 1452, 1519, 'Italian', 'A polymath of the Renaissance period known for works like the Mona Lisa and The Last Supper.'),
(6, 'Hokusai', 1760, 1849, 'Japanese', 'A Japanese artist best known for his woodblock print series Thirty-Six Views of Mount Fuji.'),
(7, 'Georgia O’Keeffe', 1887, 1986, 'American', 'An American modernist artist known for her paintings of enlarged flowers and New Mexico landscapes.'),
(8, 'Vincent van Gogh', 1853, 1890, 'Dutch', 'A post-impressionist painter known for his expressive use of color and bold brushwork.'),
(9, 'Frida Kahlo', 1907, 1954, 'Mexican', 'A Mexican painter known for her self-portraits and works inspired by nature and Mexican culture.'),
(10, 'Jackson Pollock', 1912, 1956, 'American', 'An influential American painter and a major figure in the abstract expressionist movement.');

INSERT INTO GALLERY( GalleryID, GalleryName, Capacity, AccessibilityNotes) VALUES
(1, 'Main Exhibition Hall', 200, 'Wheelchair accessible with ramps and elevators.'),
(2, 'Sculpture Garden', 100, 'Outdoor area with paved paths and seating.'),
(3, 'Photography Studio', 50, 'Limited accessibility due to stairs.'),
(4, 'Modern Art Wing', 150, 'Fully accessible with wide doorways and ramps.'),
(5, 'Renaissance Art Room', 80, 'Accessible with assistance for visitors with mobility issues.'),
(6, 'Asian Art Gallery', 120, 'Accessible with elevators and ramps for visitors with disabilities.');

INSERT INTO VISITOR( VisitorID, FirstName, LastName, Email, Phone) VALUES
(1, 'John', 'Doe', 'john.doe@gmail.com', '555-1234'),
(2, 'Jane', 'Smith', 'jane.smith@gmail.com', '555-5678'),
(3, 'Alice', 'Johnson', 'alice.johnson@gmail.com', '555-9012'),
(4, 'Bob', 'Brown', 'bob.brown@gmail.com', '555-3456'),
(5, 'Charlie', 'Davis', 'charlie.davis@gmail.com', '555-7890'),
(6, 'Diana', 'Evans', 'diana.evans@gmail.com', '555-1111'),
(7, 'Ethan', 'Foster', NULL, '555-2222'),
(8, 'Fiona', 'Garcia', 'fiona.garcia@gmail.com', NULL);

INSERT INTO GIFTSHOP_PRODUCT( ProductID, ProductName, Category, CurrentPrice, QuantityInStock, IsActive) VALUES
(1, 'Museum T-Shirt', 'Apparel', 19.99, 50, TRUE),
(2, 'Art Print', 'Art', 29.99, 30, TRUE),
(3, 'Sculpture Replica', 'Sculpture', 49.99, 20, TRUE),
(4, 'Postcard Set', 'Stationery', 9.99, 100, TRUE),
(5, 'Coffee Table Book', 'Books', 39.99, 15, TRUE),
(6, 'Museum Mug', 'Drinkware', 14.99, 40, TRUE),
(7, 'Art Puzzle', 'Toys & Games', 24.99, 25, TRUE),
(8, 'Museum Tote Bag', 'Accessories', 19.99, 60, TRUE),
(9, 'Art Calendar', 'Stationery', 12.99, 80, TRUE),
(10, 'Sculpture Miniature', 'Sculpture', 34.99, 10, TRUE);

INSERT INTO DEPARTMENT( DepartmentID, DepartmentName, OfficeLocation, PhoneExtension) VALUES
(1, 'Curatorial', 'Administration Building, Room 101', '2100'),
(2, 'Education', 'Education Building, Room 201', '1500'),
(3, 'Conservation', 'Conservation Lab, Room 301', '3100'),
(4, 'Visitor Services', 'Visitor Services Desk, Room 401', '4100'),
(5, 'Marketing', 'Marketing Office, Room 501', '5100'),
(6, 'Development', 'Development Office, Room 601', '6100');

INSERT INTO EMPLOYEE ( EmployeeID, DepartmentID ,FirstName, LastName, JobTitle, HireDate ,Email, EmploymentStatus) VALUES
(1, 1, 'Emily', 'Clark', 'Curator', '2020-01-15', 'emily.clark@museum.edu', 'Active'),
(2, 2, 'James', 'Thompson', 'Educator', '2019-03-20', 'james.thompson@museum.edu', 'Active'),
(3, 3, 'Sarah', 'Lee', 'Conservator', '2018-07-10', 'sarah.lee@museum.edu', 'Active'),
(4, 4, 'Laura', 'Martinez', 'Visitor Services Coordinator', '2021-05-01', 'laura.martinez@museum.edu', 'Active'),
(5, 5, 'David', 'Wilson', 'Marketing Manager', '2020-11-10', 'david.wilson@museum.edu', 'Active'),
(6, 6, 'Rachel', 'Kim', 'Development Officer', '2019-09-01', 'rachel.kim@museum.edu', 'Active'),
(7, 1, 'Michael', 'Brown', 'Assistant Curator', '2021-02-15', 'michael.brown@museum.edu', 'Terminated'),
(8, 2, 'Olivia', 'Davis', 'Education Assistant', '2020-06-01', 'olivia.davis@museum.edu', 'On Leave'),
(9, 3, 'Daniel', 'Garcia', 'Conservation Technician', '2019-08-20', 'daniel.garcia@museum.edu', 'Terminated'),
(10, 4, 'Sophia', 'Hernandez', 'Visitor Services Assistant', '2021-04-15', 'sophia.hernandez@museum.edu', 'Active'),
(11, 5, 'Matthew', 'Lopez', 'Marketing Assistant', '2020-10-01', 'matthew.lopez@museum.edu', 'Active'),
(12, 6, 'Isabella', 'Gonzalez', 'Development Assistant', '2019-12-01', 'isabella.gonzalez@museum.edu', 'Active'),
(13, 1, 'William', 'Perez', 'Curatorial Intern', '2021-07-01', 'william.perez@museum.edu', 'Active'),
(14, 2, 'Ava', 'Robinson', 'Education Intern', '2020-08-01', 'ava.robinson@museum.edu', 'Active'),
(15, 3, 'Ethan', 'Clark', 'Conservation Intern', '2019-09-01', 'ethan.clark@museum.edu', 'Active');

INSERT INTO ARTWORK (ArtworkID, CollectionID, AccessionNumber, Title, YearCreated, Medium, Dimensions, Description) VALUES
(1, 1, 'IMP-001', 'Water Lilies', 1906, 'Oil on Canvas', '200 cm x 180 cm', 'A series of approximately 250 oil paintings by Claude Monet.'),
(2, 2, 'ANC-001', 'The Thinker', 1904, 'Bronze Sculpture', 'Height: 186 cm', 'A bronze sculpture by Auguste Rodin, depicting a man in deep thought.'),
(3, 3, 'MOD-001', 'Les Demoiselles d Avignon', 1907, 'Oil on Canvas', '243.9 cm x 233.7 cm', 'A large oil painting by Pablo Picasso that portrays five nude female prostitutes.'),
(4, 4, 'PHO-001', 'Moonrise, Hernandez', 1941, 'Photograph', '40.6 cm x 50.8 cm', 'A black-and-white photograph by Ansel Adams capturing the moon rising over the village of Hernandez.'),
(5, 5, 'REN-001', 'Mona Lisa', 1503, 'Oil on Poplar Panel', '77 cm x 53 cm', 'A portrait painting by Leonardo da Vinci and one of the most famous artworks in the world.'),
(6, 6, 'ASI-001', 'The Great Wave off Kanagawa', 1831, 'Woodblock Print', '25.7 cm x 37.9 cm', 'A woodblock print by Hokusai depicting a large wave threatening boats off the coast of Kanagawa.'),
(7, 1, 'IMP-002', 'Starry Night', 1889, 'Oil on Canvas', '73.7 cm x 92.1 cm', 'A famous painting by Vincent van Gogh depicting a swirling night sky over a small town.'),
(8, 2, 'ANC-002', 'Venus de Milo', -130, 'Marble Sculpture', 'Height: 203 cm', 'An ancient Greek statue of the goddess Aphrodite, known for its missing arms.'),
(9, 3, 'MOD-002', 'Campbell s Soup Cans', 1962, 'Synthetic Polymer Paint on Canvas', '51 cm x 41 cm (each)', 'A series of paintings by Andy Warhol depicting various flavors of Campbell s soup cans.'),
(10, 4, 'PHO-002', 'Afghan Girl', 1984, 'Photograph', '30.5 cm x 40.6 cm', 'A photograph by Steve McCurry of a young Afghan girl with striking green eyes.');

INSERT INTO EXHIBITION (ExhibitionID, GalleryID ,ExhibitionTitle, StartDate, EndDate, Description, Status) VALUES
(1, 'Impressionist Masters', '2024-01-15', '2024-04-15', 'An exhibition showcasing the works of the great Impressionist painters.'),
(2, 'Sculptures Through Time', '2024-05-01', '2024-08-01', 'A journey through the history of sculpture from ancient to modern times.'),
(3, 'Modern Art Revolution', '2024-09-01', '2024-12-01', 'An exhibition highlighting the revolutionary movements in modern art.'),
(4, 'Photography: A Visual Journey', '2025-01-10', '2025-04-10', 'An exhibition exploring the evolution of photography as an art form.'),
(5, 'Renaissance Wonders', '2025-05-15', '2025-08-15', 'A collection of masterpieces from the Renaissance period.'),
(6, 'Asian Art Treasures', '2025-09-20', '2025-12-20', 'An exhibition celebrating the rich artistic heritage of Asia.');

INSERT INTO ARTIST_CREATES_ARTWORK (ArtistID, ArtworkID, CreatorRole) VALUES
(1, 1, 'Painter'),
(2, 2, 'Sculptor'),
(3, 3, 'Painter'),
(4, 4, 'Designer'),
(5, 5, 'Painter'),
(6, 6, 'Printmaker'),
(7, 7, 'Painter'),
(8, 8, 'Sculptor'),
(9, 9, 'Painter'),
(10, 10, 'Painter');

INSERT INTO ARTWORK_PARTICPATESIN_EXHIBITION (ExhibitionID, ArtworkID, DisplayOrder, DisplayNotes) VALUES
(1, 1, 1, 'Displayed in the main hall with special lighting.'),
(2, 2, 1, 'Placed in the center of the gallery for optimal viewing.'),
(3, 3, 1, 'Displayed alongside other modern art pieces.'),
(4, 4, 1, 'Featured in a dedicated photography section.'),
(5, 5, 1, 'Displayed in a secure glass case with controlled lighting.'),
(6, 6, 1, 'Placed in a traditional Japanese art section.'),
(7, 7, 1, 'Displayed in a special exhibition on post-impressionism.'),
(8, 8, 1, 'Placed in an ancient sculpture section with contextual information.'),
(9, 9, 1, 'Displayed in a pop art section with interactive elements.'),
(10, 10, 1, 'Featured in an abstract expressionism section.');

INSERT INTO EMPLOYEE_WORKSON_EXHIBTION (EmployeeID, ExhibitionID, AssignmentRole) VALUES
(1, 1, 'Curator'),
(2, 2, 'Educator'),
(3, 3, 'Conservator'),
(4, 4, 'Visitor Services Coordinator'),
(5, 5, 'Marketing Manager'),
(6, 6, 'Development Officer'),
(7, 1, 'Assistant Curator'),
(8, 2, 'Education Assistant'),
(9, 3, 'Conservation Technician'),
(10, 4, 'Visitor Services Assistant'),
(11, 5, 'Marketing Assistant'),
(12, 6, 'Development Assistant'),
(13, 1, 'Curatorial Intern'),
(14, 2, 'Education Intern'),
(15, 3, 'Conservation Intern');

INSERT INTO TICKET (TicketID, VisitorID, ExhibitionID, TicketType, TicketTime , TicketPrice, ExpirationDateTime) VALUES
(1, 1, 1,'Exhibtion' ,'2024-01-10 09:12:00', 35.00 , '2024-01-10 23:59:59'),
(2, 2, 2,'Student','2025-09-08' ,15.00, '2025-09-08 23:59:59'),
(3, 3, 3,'Senior','2024-10-11' ,18.00, '2024-10-11 23:59:59'),
(4, 4, 4,'Adult','2025-01-05' ,20.00, '2025-01-05 23:59:59'),
(5, 5, 5,'Student','2025-05-10' ,15.00, '2025-05-10 23:59:59'),
(6, 6, 6,'Senior','2025-09-15' ,18.00, '2025-09-15 23:59:59'),
(7, 7, 1,'Adult','2024-01-01', 20.00, '2024-01-01 23:59:59'),
(8, 8, 2,'Student','2025-09-08' ,15.00, '2025-09-08 23:59:59'),
(9, 1, 3,'Senior','2024-10-11' ,18.00, '2024-10-11 23:59:59'),
(10, 2,4,'Adult','2025-01-05' ,20.00, '2025-01-05 23:59:59'),
(11,9, NULL, 'General Admission', '2024-06-15 10:00:00', 25.00, '2024-06-15 23:59:59'),
(12,10, NULL, 'General Admission', '2024-06-16 14:30:00', 25.00, '2024-06-16 23:59:59'),
(13,11,NULL, 'Senior', '2024-06-17 09:00:00', 18.00, '2024-06-17 23:59:59'),
(14,12,NULL, 'Student', '2024-06-18 11:15:00', 15.00, '2024-06-18 23:59:59'),
(15,13,NULL, 'Adult', '2024-06-19 13:45:00', 20.00, '2024-06-19 23:59:59');


INSERT INTO GIFTSHOP_SALE (SaleID, EmployeeID, SaleDateTime, PaymentMethod, SaleStatus) VALUES
(1, 1, '2024-06-15 10:30:00', 'Credit Card', 'Completed'),
(2, 2, '2024-06-16 14:45:00', 'Cash', 'Completed'),
(3, 3, '2024-06-17 09:15:00', 'Credit Card', 'Completed'),
(4, 4, '2024-06-18 11:30:00', 'Debit Card', 'Completed'),
(5, 5, '2024-06-19 13:50:00', 'Cash', 'Completed'),
(6, 3, '2024-06-20 15:00:00', 'Credit Card', 'Voided'),
(7, 2, '2024-06-21 16:10:00', 'Cash', 'Voided'),
(8, 1, '2024-06-22 17:20:00', 'Debit Card', 'Voided'),
(9, 4, '2024-06-23 18:30:00', 'Credit Card', 'Completed'),
(10, 5, '2024-06-24 19:40:00', 'Cash', 'Completed');

INSERT INTO GIFTSHOP_SALE_ITEM (SaleID, ProductID, Quantity, UnitPriceAtSale) VALUES
(1, 1, 2, 19.99),
(1, 2, 1, 29.99),
(2, 3, 1, 49.99),
(2, 4, 3, 9.99),
(3, 5, 1, 39.99),
(3, 6, 2, 14.99),
(4, 7, 1, 24.99),
(4, 8, 2, 19.99),
(5, 9, 1, 12.99),
(5, 10, 1, 34.99);








