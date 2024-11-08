"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveData = saveData;
const sqlite3_1 = require("sqlite3");
const db = new sqlite3_1.Database("database.db");
function saveData(data) {
    const sql = `INSERT INTO invoices (data) VALUES (?)`;
    db.run(sql, [JSON.stringify(data)], (err) => {
        if (err)
            return console.error("Database error:", err.message);
        console.log("Data saved successfully!");
    });
}
