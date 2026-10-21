USE MuseumDatabase;

INSERT INTO COLLECTION (CollectionID, CollectionName, Description) VALUES
(1, 'European Art',               'Painting and sculpture from Europe, Renaissance through Impressionism.'),
(2, 'American Art',               'American painting and sculpture from the 18th to 20th centuries.'),
(3, 'Modern & Contemporary Art',  'Works from the 20th and 21st centuries, including abstract art.'),
(4, 'Asian Art',                  'Prints, ceramics, and paintings from East and South Asia.'),
(5, 'Latin American Art',         'Modern and contemporary art from Latin America.'),
(6, 'Photography',                'Photographs and photo-based works, including Houston artists.');

INSERT INTO ARTIST (ArtistID, ArtistName, BirthYear, DeathYear, Nationality, Biography) VALUES
(1,  'Claude Monet',          1840, 1926, 'French',   'Founder of French Impressionism, known for his Water Lilies series.'),
(2,  'Vincent van Gogh',      1853, 1890, 'Dutch',    'Post-Impressionist painter known for bold color and expressive brushwork.'),
(3,  'Edgar Degas',           1834, 1917, 'French',   'Impressionist painter and sculptor, famous for images of dancers.'),
(4,  'Rembrandt van Rijn',    1606, 1669, 'Dutch',    'Dutch Golden Age painter and printmaker, known for his self-portraits.'),
(5,  'Georgia O''Keeffe',     1887, 1986, 'American', 'American modernist known for large-scale flowers and New Mexico landscapes.'),
(6,  'Mark Rothko',           1903, 1970, 'American', 'Abstract Expressionist known for color field paintings.'),
(7,  'Katsushika Hokusai',    1760, 1849, 'Japanese', 'Ukiyo-e printmaker, creator of Thirty-six Views of Mount Fuji.'),
(8,  'Frida Kahlo',           1907, 1954, 'Mexican',  'Mexican painter known for self-portraits and Mexican folk imagery.'),
(9,  'Elena Ruiz',            1985, NULL, 'American', 'Houston-based painter exploring bayous and city neighborhoods. (Fictional sample artist.)'),
(10, 'Marcus Bell',           1979, NULL, 'American', 'Houston documentary photographer. (Fictional sample artist.)');

INSERT INTO GALLERY (GalleryID, GalleryName, Capacity, AccessibilityNotes) VALUES
(1, 'North Wing Gallery',     200, 'Wheelchair accessible; elevator access from main lobby.'),
(2, 'Impressionism Hall',     150, 'Wheelchair accessible; seating benches available.'),
(3, 'Modern Gallery',         250, 'Wheelchair accessible; audio guides available.'),
(4, 'Asian Art Pavilion',      80, 'Low lighting to protect prints; ramp entrance.'),
(5, 'Photography Room',        60, 'Wheelchair accessible; large-print labels available.');

INSERT INTO VISITOR (VisitorID, FirstName, LastName, Email, Phone) VALUES
(1,  'Ashley',   'Johnson',   'ashley.johnson@example.com',   '713-555-0101'),
(2,  'Kevin',    'Tran',      'kevin.tran@example.com',       '713-555-0102'),
(3,  'Margaret', 'Wilson',    'margaret.wilson@example.com',  '713-555-0103'),
(4,  'Luis',     'Garcia',    'luis.garcia@example.com',      '832-555-0104'),
(5,  'Aaliyah',  'Brown',     'aaliyah.brown@example.com',    '832-555-0105'),
(6,  'Ethan',    'Davis',     'ethan.davis@example.com',      '281-555-0106'),
(7,  'Mei',      'Lin',       'mei.lin@example.com',          '713-555-0107'),
(8,  'Robert',   'Anderson',  'robert.anderson@example.com',  '281-555-0108'),
(9,  'Fatima',   'Khan',      'fatima.khan@example.com',      '832-555-0109'),
(10, 'Noah',     'Martinez',  'noah.martinez@example.com',    '713-555-0110'),
(11, 'Linda',    'Moore',     NULL,                           '281-555-0111'),
(12, 'Diego',    'Lopez',     'diego.lopez@example.com',      NULL);

INSERT INTO GIFTSHOP_PRODUCT (ProductID, ProductName, Category, CurrentPrice, QuantityInStock, IsActive) VALUES
(1,  'Water Lilies Tote Bag',          'Accessories',  24.99,  40, TRUE),
(2,  'Great Wave Poster',              'Prints',       19.99,  60, TRUE),
(3,  'Frida Kahlo Exhibition Catalog', 'Books',        45.00,  25, TRUE),
(4,  'Impressionism Coloring Book',    'Books',        12.50,   3, FALSE),  
(5,  'Museum Logo Mug',                'Housewares',   16.00,  35, TRUE),
(6,  'Hokusai Silk Scarf',             'Accessories',  58.00,   0, FALSE),  
(7,  'Van Gogh Puzzle (1000 pc)',      'Toys & Games', 29.95,  18, TRUE),
(8,  'Kids Art Kit',                   'Toys & Games', 22.00,   2, FALSE),  
(9,  'Postcard Set (12)',              'Stationery',    9.99, 120, TRUE),
(10, 'Rothko Notebook',                'Stationery',   14.00,  30, TRUE),
(11, 'Monet Umbrella',                 'Accessories',  35.00,   5, FALSE); 

INSERT INTO DEPARTMENT (DepartmentID, DepartmentName, OfficeLocation, PhoneExtension) VALUES
(1, 'Curatorial',         'Administration Building, Room 210', '2100'),
(2, 'Visitor Services',   'Main Lobby',                        '1000'),
(3, 'Retail Operations',  'Gift Shop Office',                  '1500'),
(4, 'Security',           'Security Office, Lower Level',      '9100'),
(5, 'Education',          'Learning Center, Room 105',         '3100'),
(6, 'Administration',     'Administration Building, Room 300', '3000');

INSERT INTO EMPLOYEE (EmployeeID, DepartmentID, FirstName, LastName, JobTitle, HireDate, Email, EmploymentStatus) VALUES
(1,  1, 'Jason',   'Miller',    'Chief Curator',            '2015-03-02', 'jason.miller@museum.example',    'Active'),
(2,  1, 'Priya',   'Patel',     'Associate Curator',        '2019-08-19', 'priya.patel@museum.example',     'Active'),
(3,  2, 'Daniel',  'Nguyen',    'Visitor Services Manager', '2017-01-09', 'daniel.nguyen@museum.example',   'Active'),
(4,  2, 'Sofia',   'Hernandez', 'Ticketing Associate',      '2022-06-13', 'sofia.hernandez@museum.example', 'Active'),
(5,  3, 'Andre',   'Thompson',  'Gift Shop Manager',        '2018-04-23', 'andre.thompson@museum.example',  'Active'),
(6,  3, 'Emily',   'Chen',      'Sales Associate',          '2023-02-06', 'emily.chen@museum.example',      'Active'),
(7,  3, 'Carlos',  'Ramirez',   'Sales Associate',          '2024-05-20', 'carlos.ramirez@museum.example',  'Active'),
(8,  4, 'Grace',   'Okafor',    'Security Supervisor',      '2016-10-03', 'grace.okafor@museum.example',    'Active'),
(9,  5, 'Liam',    'Walsh',     'Education Coordinator',    '2020-09-14', 'liam.walsh@museum.example',      'Active'),
(10, 6, 'Hannah',  'Kim',       'Operations Director',      '2014-07-07', 'hannah.kim@museum.example',      'Active'),
(11, 1, 'Omar',    'Haddad',    'Exhibition Designer',      '2021-11-01', 'omar.haddad@museum.example',     'On Leave'),
(12, 3, 'Rachel',  'Brooks',    'Sales Associate',          '2022-03-14', 'rachel.brooks@museum.example',   'Terminated');

INSERT INTO ARTWORK (ArtworkID, CollectionID, AccessionNumber, Title, CreationYear, Medium, Dimensions, Description) VALUES
(1,  1, 'ACC-1968.014', 'Water Lilies',                                         1907, 'Oil on canvas',                  '93 x 81 cm',     'Part of Monet''s series painted at his garden in Giverny.'),
(2,  1, 'ACC-1974.112', 'The Rocks',                                            1888, 'Oil on canvas',                  '55 x 66 cm',     'Rocky landscape painted near Arles.'),
(3,  1, 'ACC-1981.030', 'Little Dancer Aged Fourteen',                          1881, 'Bronze, tulle, and satin ribbon', '99 cm high',     'Bronze cast of Degas''s famous wax sculpture.'),
(4,  1, 'ACC-1990.007', 'Self-Portrait with Two Circles',                       1665, 'Oil on canvas',                  '114 x 94 cm',    'Late self-portrait by Rembrandt.'),
(5,  2, 'ACC-2001.045', 'Jimson Weed/White Flower No. 1',                       1932, 'Oil on canvas',                  '122 x 102 cm',   'Large-scale flower painting.'),
(6,  3, 'ACC-1997.088', 'No. 61 (Rust and Blue)',                               1953, 'Oil on canvas',                  '294 x 232 cm',   'Color field painting.'),
(7,  4, 'ACC-1985.201', 'The Great Wave off Kanagawa',                          1831, 'Woodblock print',                '26 x 38 cm',     'From the series Thirty-six Views of Mount Fuji.'),
(8,  4, 'ACC-1985.202', 'Fine Wind, Clear Morning (Red Fuji)',                  1831, 'Woodblock print',                '26 x 38 cm',     'From the series Thirty-six Views of Mount Fuji.'),
(9,  5, 'ACC-2010.019', 'Self-Portrait with Thorn Necklace and Hummingbird',    1940, 'Oil on canvas',                  '62 x 48 cm',     'Self-portrait with symbolic animals and plants.'),
(10, 5, 'ACC-2012.003', 'The Two Fridas',                                       1939, 'Oil on canvas',                  '173 x 173 cm',   'Double self-portrait.'),
(11, 3, 'ACC-2022.011', 'Bayou at Dusk',                                        2021, 'Acrylic on canvas',              '120 x 150 cm',   'Buffalo Bayou at sunset. (Sample artwork.)'),
(12, 6, 'ACC-2024.005', 'Third Ward Morning',                                   2023, 'Mixed media and photograph',     '100 x 140 cm',   'Collaborative work combining painting and photography. (Sample artwork.)'),
(13, 6, 'ACC-2020.027', 'Untitled (Ship Channel)',                              2019, 'Gelatin silver print',           '50 x 60 cm',     'Black-and-white view of the Houston Ship Channel. (Sample artwork.)');

INSERT INTO EXHIBITION (ExhibitionID, GalleryID, ExhibitionTitle, StartDate, EndDate, Description, Status) VALUES
(1, 2, 'Light & Color: Impressionist Masters',      '2026-03-01', '2026-06-30', 'Monet, Van Gogh, and Degas on light and movement.',       'Completed'),
(2, 4, 'Hokusai and the Floating World',            '2026-05-15', '2026-09-15', 'Japanese woodblock prints from the Edo period.',         'Completed'),
(3, 1, 'American Modernism',                        '2026-08-01', '2027-01-31', 'O''Keeffe, Rothko, and the rise of American modern art.', 'Active'),
(4, 3, 'Frida Kahlo: Portraits of Self',            '2026-09-10', '2027-02-28', 'Self-portraits and identity in the work of Frida Kahlo.', 'Active'),
(5, 5, 'Houston Voices: Contemporary Local Artists','2026-12-01', '2027-04-30', 'New work by Houston painters and photographers.',          'Upcoming'),
(6, 2, 'Rembrandt to Monet: Four Centuries',        '2026-10-01', '2027-03-31', 'European masterworks from the permanent collection.',      'Active');

INSERT INTO ARTIST_CREATES_ARTWORK (ArtistID, ArtworkID, CreatorRole) VALUES
(1,  1,  'Painter'),
(2,  2,  'Painter'),
(3,  3,  'Sculptor'),
(4,  4,  'Painter'),
(5,  5,  'Painter'),
(6,  6,  'Painter'),
(7,  7,  'Designer'),
(7,  8,  'Designer'),
(8,  9,  'Painter'),
(8,  10, 'Painter'),
(9,  11, 'Painter'),
(9,  12, 'Painter'),       
(10, 12, 'Photographer'),
(10, 13, 'Photographer');


INSERT INTO ARTWORK_PARTICIPATESIN_EXHIBITION (ExhibitionID, ArtworkID, DisplayOrder, DisplayNotes) VALUES
(1, 1,  1, 'Opening wall, natural light.'),
(1, 2,  2, NULL),
(1, 3,  3, 'Center of room, glass case.'),
(2, 7,  1, 'Low-light display; rotated every 3 months.'),
(2, 8,  2, 'Low-light display.'),
(3, 5,  1, NULL),
(3, 6,  2, 'Requires full wall.'),
(4, 9,  1, 'Featured piece.'),
(4, 10, 2, NULL),
(5, 11, 1, NULL),
(5, 12, 2, 'Includes artist statement panel.'),
(5, 13, 3, NULL),
(6, 4,  1, NULL),
(6, 1,  2, 'Returned from Impressionist exhibition.'),
(6, 3,  3, 'Glass case.');

INSERT INTO EMPLOYEE_WORKSON_EXHIBITION (EmployeeID, ExhibitionID, AssignmentRole) VALUES
(1,  1, 'Lead Curator'),
(2,  1, 'Research Curator'),
(11, 1, 'Exhibition Designer'),
(2,  2, 'Lead Curator'),
(8,  2, 'Security Lead'),
(1,  3, 'Lead Curator'),
(9,  3, 'Education Programs'),
(2,  4, 'Lead Curator'),
(11, 4, 'Exhibition Designer'),
(8,  4, 'Security Lead'),
(1,  5, 'Lead Curator'),
(9,  5, 'Community Outreach'),
(1,  6, 'Lead Curator'),
(3,  6, 'Visitor Experience');


INSERT INTO TICKET (TicketID, VisitorID, ExhibitionID, TicketType, TicketTime, TicketPrice, VisitDate) VALUES

(1,  1,  1,    'Adult',             '2026-03-05 09:12:00', 20.00, '2026-03-07'),
(2,  2,  1,    'Student',           '2026-03-20 18:30:00', 12.00, '2026-03-21'),
(3,  3,  1,    'Senior',            '2026-04-11 10:05:00', 14.00, '2026-04-11'),
(4,  4,  1,    'Adult',             '2026-05-02 13:40:00', 20.00, '2026-05-03'),
(5,  5,  1,    'Child',             '2026-05-02 13:41:00',  8.00, '2026-05-03'),
(6,  6,  1,    'Adult',             '2026-06-14 11:20:00', 20.00, '2026-06-14'),
(7,  7,  NULL, 'Adult',             '2026-04-18 10:00:00', 20.00, '2026-04-18'),
(8,  8,  NULL, 'Adult',             '2026-05-23 12:15:00', 20.00, '2026-05-23'),
(9,  2,  2,    'Adult',             '2026-06-01 14:00:00', 20.00, '2026-06-02'),
(10, 9,  2,    'Adult',             '2026-07-09 09:45:00', 20.00, '2026-07-10'),
(11, 10, 2,    'Student',           '2026-07-22 16:10:00', 12.00, '2026-07-22'),
(12, 11, 2,    'Senior',            '2026-08-15 10:30:00', 14.00, '2026-08-15'),
(13, 1,  2,    'Adult',             '2026-09-01 11:00:00', 20.00, '2026-09-03'),
(14, 12, NULL, 'Adult',             '2026-07-04 10:20:00', 20.00, '2026-07-04'),
(15, 3,  NULL, 'Senior',            '2026-07-18 13:15:00', 14.00, '2026-07-18'),
(16, 4,  3,    'Adult',             '2026-08-02 10:05:00', 20.00, '2026-08-02'),
(17, 6,  3,    'Adult',             '2026-08-20 15:30:00', 20.00, '2026-08-22'),
(18, 8,  3,    'Adult',             '2026-09-05 11:45:00', 20.00, '2026-09-05'),
(19, 10, 3,    'Student',           '2026-09-18 17:00:00', 12.00, '2026-09-19'),
(20, 5,  3,    'Child',             '2026-09-26 12:00:00',  8.00, '2026-09-26'),
(21, 7,  4,    'Adult',             '2026-09-10 09:00:00', 20.00, '2026-09-10'),
(22, 9,  4,    'Adult',             '2026-09-12 14:25:00', 20.00, '2026-09-13'),
(23, 11, 4,    'Senior',            '2026-09-27 10:40:00', 14.00, '2026-09-27'),
(24, 12, 4,    'Adult',             '2026-10-03 13:10:00', 20.00, '2026-10-04'),
(25, 1,  4,    'Adult',             '2026-10-10 11:30:00', 20.00, '2026-10-10'),
(26, 2,  6,    'Adult',             '2026-10-01 10:00:00', 20.00, '2026-10-01'),
(27, 3,  6,    'Senior',            '2026-10-08 12:20:00', 14.00, '2026-10-08'),
(28, 6,  6,    'Adult',             '2026-10-15 15:05:00', 20.00, '2026-10-17'),
(29, 4,  NULL, 'Adult',             '2026-10-11 09:50:00', 20.00, '2026-10-11'),
(30, 5,  4,    'Adult',             '2026-10-18 20:15:00', 20.00, '2026-11-07'),
(31, 9,  5,    'Adult',             '2026-10-18 21:00:00', 20.00, '2026-12-05');

INSERT INTO GIFTSHOP_SALE (SaleID, EmployeeID, SaleDateTime, PaymentMethod, SaleStatus) VALUES
(1,  6,  '2026-06-05 10:15:00', 'Credit Card', 'Completed'),
(2,  12, '2026-06-12 14:40:00', 'Cash',        'Completed'),
(3,  5,  '2026-06-28 11:05:00', 'Credit Card', 'Completed'),
(4,  7,  '2026-07-03 16:20:00', 'Debit Card',  'Completed'),
(5,  6,  '2026-07-19 13:00:00', 'Mobile Pay',  'Completed'),
(6,  7,  '2026-07-27 15:45:00', 'Cash',        'Refunded'),
(7,  5,  '2026-08-08 12:30:00', 'Credit Card', 'Completed'),
(8,  6,  '2026-08-21 10:50:00', 'Credit Card', 'Completed'),
(9,  7,  '2026-09-02 11:15:00', 'Debit Card',  'Completed'),
(10, 6,  '2026-09-14 14:05:00', 'Credit Card', 'Completed'),
(11, 5,  '2026-09-29 16:35:00', 'Mobile Pay',  'Completed'),
(12, 7,  '2026-10-04 10:20:00', 'Cash',        'Completed'),
(13, 6,  '2026-10-11 13:55:00', 'Credit Card', 'Completed'),
(14, 5,  '2026-10-16 15:10:00', 'Credit Card', 'Completed');

INSERT INTO GIFTSHOP_SALE_ITEM (SaleID, ProductID, Quantity, UnitPriceAtSale) VALUES
(1,  1,  1, 24.99),
(1,  9,  2,  9.99),
(2,  4,  1, 12.50),
(2,  5,  1, 16.00),
(3,  7,  1, 29.95),
(3,  2,  1, 17.99),
(4,  2,  2, 17.99),
(4,  9,  1,  9.99),
(5,  6,  1, 58.00),
(5,  1,  1, 24.99),
(6,  10, 1, 14.00),
(7,  8,  2, 22.00),
(7,  4,  1, 12.50),
(8,  11, 1, 35.00),
(8,  5,  2, 16.00),
(9,  7,  1, 29.95),
(9,  9,  3,  9.99),
(10, 3,  2, 45.00),
(10, 6,  1, 58.00),
(11, 1,  2, 24.99),
(11, 10, 2, 14.00),
(12, 3,  1, 45.00),
(12, 9,  1,  9.99),
(13, 8,  1, 22.00),
(13, 5,  1, 16.00),
(13, 2,  1, 19.99),
(14, 3,  1, 45.00),
(14, 7,  1, 29.95);

SELECT 'COLLECTION' AS TableName, COUNT(*) AS RowCount FROM COLLECTION
UNION ALL SELECT 'ARTIST', COUNT(*) FROM ARTIST
UNION ALL SELECT 'GALLERY', COUNT(*) FROM GALLERY
UNION ALL SELECT 'VISITOR', COUNT(*) FROM VISITOR
UNION ALL SELECT 'GIFTSHOP_PRODUCT', COUNT(*) FROM GIFTSHOP_PRODUCT
UNION ALL SELECT 'DEPARTMENT', COUNT(*) FROM DEPARTMENT
UNION ALL SELECT 'EMPLOYEE', COUNT(*) FROM EMPLOYEE
UNION ALL SELECT 'ARTWORK', COUNT(*) FROM ARTWORK
UNION ALL SELECT 'EXHIBITION', COUNT(*) FROM EXHIBITION
UNION ALL SELECT 'ARTIST_CREATES_ARTWORK', COUNT(*) FROM ARTIST_CREATES_ARTWORK
UNION ALL SELECT 'ARTWORK_PARTICIPATESIN_EXHIBITION', COUNT(*) FROM ARTWORK_PARTICIPATESIN_EXHIBITION
UNION ALL SELECT 'EMPLOYEE_WORKSON_EXHIBITION', COUNT(*) FROM EMPLOYEE_WORKSON_EXHIBITION
UNION ALL SELECT 'TICKET', COUNT(*) FROM TICKET
UNION ALL SELECT 'GIFTSHOP_SALE', COUNT(*) FROM GIFTSHOP_SALE
UNION ALL SELECT 'GIFTSHOP_SALE_ITEM', COUNT(*) FROM GIFTSHOP_SALE_ITEM;