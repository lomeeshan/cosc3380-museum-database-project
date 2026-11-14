
# COSC 3380 — Museum Database Project

## 1. Submitted Files

- `database/MuseumDatabase_Final_Submission.sql` — Final populated MySQL database containing all tables, data, constraints, and 3 triggers.
- `database/schema.sql` — Original database table definitions and relationships.
- `database/seed.sql` — Sample database records.
- `database/triggers.sql` — MySQL trigger definitions.
- `database/queries.sql` — SQL queries.
- `database/reports.sql` — SQL reports.
- `backend/` — Node.js/Express server, authentication, database connection, and API routes.
- `frontend/` — HTML, CSS, and JavaScript files for the UI
- `documentation/` — Project documentation.
- `README.md` — File descriptions and installation instructions.

## 2. Installation Instructions

### Step 1: Install Required Software

The project requires MySQL 8, MySQL Workbench, Node.js, and npm.

**macOS (Terminal)**

Install Homebrew if it is not already installed:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install the required software:

```bash
brew install mysql@8.4
brew install --cask mysqlworkbench
brew install node
```

Start MySQL:

```bash
brew services start mysql@8.4
```

Add MySQL to the current terminal's PATH:

```bash
export PATH="$(brew --prefix mysql@8.4)/bin:$PATH"
```

Configure the local MySQL root account:

```bash
mysql_secure_installation
```

**Windows (PowerShell)**

Install MySQL Server, MySQL Workbench, and Node.js:

```powershell
winget install --id Oracle.MySQL --exact
winget install --id Oracle.MySQLWorkbench --exact
winget install --id OpenJS.NodeJS --exact
```

Complete the MySQL installation prompts and configure the root password. Restart PowerShell after installation.

**Verify installation:**

```bash
mysql --version
node --version
npm --version
```

### Step 2: Import the Database

1. Open MySQL Workbench.
2. Connect to the local MySQL server.
3. Navigate to **Server → Data Import**.
4. Select **Import from Self-Contained File**.
5. Choose `database/MuseumDatabase_Final_Submission.sql`.
6. Click **Start Import**.

The SQL dump file creates the `MuseumDatabase` schema and imports all populated tables, constraints, and triggers.

Do not run `schema.sql`, `seed.sql`, or `triggers.sql` after importing the final dump.

### Step 3: Install Backend Dependencies

Open Terminal or PowerShell in the project folder:

```bash
cd backend
npm ci
```

### Step 4: Configure Environment Variables

Copy the example configuration:

**macOS:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Open `backend/.env` and enter:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=MuseumDatabase
PORT=3000
JWT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS_LONG
```

Replace `YOUR_MYSQL_PASSWORD` with the local MySQL password and set a random JWT secret of at least 32 characters.

Do not include `DB_SSL_CA` for a local MySQL connection.

### Step 5: Start the Application

From the `backend` directory:

```bash
npm start
```

### Step 6: Open the Website

In a web browser, visit:

http://localhost:3000/login.html

To verify database connectivity, visit:

http://localhost:3000/api/health

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

Use the separately supplied demonstration credentials to log in as Admin, Curator, Sales Staff, or Customer.

