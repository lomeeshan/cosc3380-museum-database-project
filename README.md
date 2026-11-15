Team 4 Museum Database Project Files:

MuseumDatabase_Final_Submission.sql (Final SQL Dump)

database/schema.sql (Schema for the museum database)

database/seed.sql (Example data to populate the database)

database/triggers.sql (MySQL Triggers)

database/queries.sql (3 SQL Queries)

backend/ (Node.js + Express application with API routes, authentication and database connection)

frontend/ (HTML, CSS, JS and Images for the website)

Installation:

1. Install required software:

Install MySQL 8, MySQL Workbench and Node.js using the official websites. Whilst installing MySQL, set up a password for the local MySQL user.

2. Setting up the database:

Open MySQL Workbench and connect to your local MySQL database.

Click on Import from Self-Contained File.

Choose the SQL Dump file named 'MuseumDatabase_Final_Submission.sql' from the submission folder and click Start Import. This will create the MuseumDatabase and import the populated tables and triggers. Do not run schema.sql, seed.sql or triggers.sql.

3. Install backend dependencies:

Open a terminal/command prompt in the unzipped source code folder. Enter:

cd backend

npm ci

4. Database connection:

In the backend folder, copy the .env.example file we have provided and rename it '.env'. Open '.env' and fill in:

DB_HOST=127.0.0.1

DB_PORT=3306

DB_USER=root

DB_PASSWORD=YOUR_MYSQL_PASSWORD

DB_NAME=MuseumDatabase

PORT=3000

JWT_SECRET= Set this to a JSON Web Token Secret (minimum length 32 characters). Replace YOUR_MYSQL_PASSWORD with your local MySQL password and set the JWT secret to a random value that is 32 characters or longer.

5. Run the website:

From the backend folder enter:

npm start

Open the login page using http://localhost:3000/login.html. To check if you have connected to the database: http://localhost:3000/api/health. You should see a response of status: ok and database: connected.