
require("dotenv").config();

const express = require("express");
const path = require("path");
const db = require("./db/connection");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to receive JSON data
app.use(express.json());

// Connect our backend to the frontend folder
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// Test route to check if the backend is running
app.get("/api/health", (req, res) => {
    res.json({
        message: "Museum Database server is running"
    });
});

app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT COUNT(*) AS totalArtworks FROM ARTWORK"
        );

        res.json({
            message: "MySQL connection successful",
            totalArtworks: rows[0].totalArtworks
        });

    } catch (error) {
        console.error("Database test failed:", error.message);

        res.status(500).json({
            error: "Database connection or query failed"
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
