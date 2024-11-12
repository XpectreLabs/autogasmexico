import { Database } from "sqlite3"

const db = new Database("database.db")

export function saveData(data: any) {
  const sql = `INSERT INTO invoices (data) VALUES (?)`
  db.run(sql, [JSON.stringify(data)], (err) => {
    if (err) return console.error("Database error:", err.message)
    //console.log("Data saved successfully!")
  })
}
