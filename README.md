
COSC 3380 Museum Database Project
Files
- MuseumDatabase_Final_Submission.sql — Final populated database dump, contains the tables, data, constraints, and triggers.
- database/schema.sql — Table definitions and relationships
- database/seed.sql — Sample records
- database/triggers.sql — MySQL triggers
- database/queries.sql — SQL queries
- database/reports.sql — SQL queries for the website's three reports
- backend/ — Node.js/Express server, API routes, authentication, and database connection
- frontend/ — HTML, CSS, JavaScript, and website images
- documentation/ — Supporting project documentation
- README.md — Installation instructions and file descriptions
Installation Instructions
1. Install the required software
Install MySQL 8, MySQL Workbench, and Node.js from their official websites. npm is included with Node.js. During MySQL setup, configure a password for the local MySQL user.

Open a terminal or command prompt and verify the installations by running these commands individually:
- mysql --version
- node --version
- npm --version
If a command is not recognized, complete the relevant installation and ensure that the program is added to your system's PATH.
2. Import the database
1. Open MySQL Workbench and connect to your local MySQL server.
2. Go to Server > Data Import and select Import from Self-Contained File.
3. Select MuseumDatabase_Final_Submission.sql from the submission folder, then click Start Import.
The dump creates the MuseumDatabase database and imports the populated tables and triggers. Do not run schema.sql, seed.sql, or triggers.sql after importing this dump.
3. Install the backend dependencies
Open a terminal or command prompt in the extracted source code folder. Run:
- cd backend
- npm ci
4. Configure the database connection
In the backend folder, make a copy of .env.example and name it .env. Open .env in a text editor and set:
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD=YOUR_MYSQL_PASSWORD
- DB_NAME=MuseumDatabase
- PORT=3000
- JWT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS_LONG
Replace YOUR_MYSQL_PASSWORD with your local MySQL password and set a random JWT secret of at least 32 characters. A local database connection does not need DB_SSL_CA.
5. Start the website
From the backend folder, run npm start.

Open http://localhost:3000/login.html in a browser. To check database connectivity, open http://localhost:3000/api/health. The response should include status: ok and database: connected.

Use the demonstration credentials provided in the submission email to log in as Admin, Curator, Sales Staff, or Customer.