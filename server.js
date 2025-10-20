const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

// Open the database in readonly mode
const DB_PATH = path.join(__dirname, 'data/f1.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("❌ Could not open DB:", err.message);
    process.exit(1);
  }
  console.log("✅ Opened DB:", DB_PATH);
});

// Helper - Not found 
function notFound(res, msg = "No data found.") {
  return res.status(404).json({ error: msg });
}

// Helper - Is Integer
const isInt = (v) => Number.isInteger(Number(v));

// Helper - Bad Request
function badReq(res, msg) { return res.status(400).json({ error: msg }); }

// Helper - Health Check
// app.get("/", (req, res) => res.json({ 
//   API_STATUS: "RUNNING", 
//   uptime: process.uptime(),
//   message: "Welcome to the F1 Data API, made by Anmol Verma" 
// }));
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>F1 Data API</title>
      <style>
        body {
          font-family:Arial,sans-serif;
          margin:40px;
          background-color:#979797ff;
          color:#333;
        }
        h1 {
          color: #2c2c2cff;
        }
        h2 {
          color: #2c2c2cff;
        }
        ul {
          list-style-type:none;
          padding:0;
        }
        li {
          margin:10px 0;
        }
        a {
          color:#0066cc;
          text-decoration:none;
          padding:8px 12px;
          display:inline-block;
          border:1px solid #464646ff;
          border-radius:4px;
          background-color: #313131ff;
          color:  #ffffffff
        }
        a:hover {
          background-color: #ffffffff;
          border-color:#999;
          color:  #313131ff ;
        }
        p {
          color: #000000ff;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to the F1 Data API</h1>
      <p>Made by Anmol Verma</p>
      <p>Status: <strong>RUNNING</strong> | Uptime: ${process.uptime().toFixed(1)}s</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><a href="/api/circuits">GET /api/circuits</a></li>
        <li><a href="/api/circuits/monaco">GET /api/circuits/:circuitRef</a></li>
        <li><a href="/api/circuits/season/2020">GET /api/circuits/season/:year</a></li>
        <li><a href="/api/constructors">GET /api/constructors</a></li>
        <li><a href="/api/constructors/mclaren">GET /api/constructors/:ref</a></li>
        <li><a href="/api/drivers">GET /api/drivers</a></li>
        <li><a href="/api/drivers/hamilton">GET /api/drivers/:ref</a></li>
        <li><a href="/api/drivers/search/sch">GET /api/drivers/search/:substring</a></li>
        <li><a href="/api/drivers/race/1106">GET /api/drivers/race/:raceId</a></li>
        <li><a href="/api/races/1106">GET /api/races/:raceId</a></li>
        <li><a href="/api/races/season/2020">GET /api/races/season/:year</a></li>
        <li><a href="/api/races/season/2022/4">GET /api/races/season/:year/:round</a></li>
        <li><a href="/api/races/circuits/monza">GET /api/races/circuits/:ref</a></li>
        <li><a href="/api/races/circuits/monza/season/2015/2020">GET /api/races/circuits/:ref/season/:start/:end</a></li>
        <li><a href="/api/results/1106">GET /api/results/:raceId</a></li>
        <li><a href="/api/results/driver/max_verstappen">GET /api/results/driver/:ref</a></li>
        <li><a href="/api/results/drivers/sainz/seasons/2022/2022">GET /api/results/drivers/:ref/seasons/:start/:end</a></li>
        <li><a href="/api/qualifying/1106">GET /api/qualifying/:raceId</a></li>
        <li><a href="/api/standings/drivers/1106">GET /api/standings/drivers/:raceId</a></li>
        <li><a href="/api/standings/constructors/1106">GET /api/standings/constructors/:raceId</a></li>
      </ul>
    </body>
    </html>
  `);
});

// 1) /api/circuits - Return all circuits from f1.db
// Returns all the circuits
app.get("/api/circuits", (req, res) => {
  const sql = `SELECT * FROM circuits;`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) return notFound(res);
    res.json(rows);
  });
});

// 2) /api/circuits/ref
// Returns just the specified circuit (use the circuitRef field), e.g., /api/circuits/monaco
app.get("/api/circuits/:circuitRef", (req, res) => {
  const { circuitRef } = req.params;
  const sql = `SELECT * FROM circuits WHERE circuitRef = ?;`;
  db.get(sql, [circuitRef], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return notFound(res);
    res.json(row);
  });
});

// 3) /api/circuits/season/year
// Returns the circuits used in a given season (order by round in ascending order), e.g., /api/circuits/season/2020
app.get("/api/circuits/season/:year", (req, res) => {
  const { year } = req.params;
  const sql = `
    SELECT c.*
    FROM circuits c
    JOIN races r ON c.circuitId = r.circuitId
    WHERE r.year = ?
    ORDER BY r.round ASC;
  `;
  db.all(sql, [year], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return notFound(res, `No circuits found for season ${year}.`);
    res.json(rows);
  });
});

// 4) /api/constructors
// Returns all the constructors
app.get("/api/constructors", (req, res) => {
  db.all("SELECT * FROM constructors;", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res);
    res.json(rows);
  });
});

// 5) /api/constructors/ref
// Returns just the specified constructor (use the constructorRef field), e.g., /api/constructors/mclaren
app.get("/api/constructors/:ref", (req, res) => {
  const { ref } = req.params;
  db.get("SELECT * FROM constructors WHERE constructorRef = ?;", [ref], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return notFound(res, `No constructor found with ref '${ref}'.`);
    res.json(row);
  });
});

// 6) /api/drivers
// Returns all the drivers
app.get("/api/drivers", (req, res) => {
  db.all("SELECT * FROM drivers;", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res);
    res.json(rows);
  });
});

// 7) /api/drivers/ref
// Returns just the specified driver (use the driverRef field), e.g., /api/drivers/hamilton
app.get("/api/drivers/:ref", (req, res) => {
  const { ref } = req.params;
  db.get("SELECT * FROM drivers WHERE driverRef = ?;", [ref], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return notFound(res, `No driver found with ref '${ref}'.`);
    res.json(row);
  });
});

// 8) /api/drivers/search/substring
// Returns the drivers whose surname (case insensitive) begins with the provided substring, e.g., /api/drivers/search/sch
app.get("/api/drivers/search/:substring", (req, res) => {
  const { substring } = req.params;
  const sql = `
    SELECT * FROM drivers
    WHERE LOWER(surname) LIKE LOWER(?) || '%'
    ORDER BY surname ASC, forename ASC;
  `;
  db.all(sql, [substring], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No drivers with surname starting '${substring}'.`);
    res.json(rows);
  });
});

// 9) /api/drivers/race/raceId
// Returns the drivers within a given race, e.g., /api/drivers/race/1106
app.get("/api/drivers/race/:raceId", (req, res) => {
  const { raceId } = req.params;
  if (!isInt(raceId)) return badReq(res, "raceId must be an integer.");
  const sql = `
    SELECT d.*
    FROM results r
    JOIN drivers d ON d.driverId = r.driverId
    WHERE r.raceId = ?
    ORDER BY r.grid ASC;
  `;
  db.all(sql, [raceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No drivers found for raceId ${raceId}.`);
    res.json(rows);
  });
});

// 10) /api/races/raceId
// Returns just the specified race. Don’t provide the foreign key for the circuit; instead provide the circuit name, location, and country

app.get("/api/races/:raceId", (req, res) => {
  const { raceId } = req.params;
  if (!isInt(raceId)) return badReq(res, "raceId must be an integer.");
  const sql = `
    SELECT
      r.raceId, r.year, r.round, r.name, r.date, r.time, r.url,
      c.name AS circuitName, c.location, c.country
    FROM races r
    JOIN circuits c ON c.circuitId = r.circuitId
    WHERE r.raceId = ?;
  `;
  db.get(sql, [raceId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return notFound(res, `No race found with id ${raceId}.`);
    res.json(row);
  });
});

// 11) /api/races/season/year
// Returns the races within a given season ordered by round,e.g., /api/races/season/2020
app.get("/api/races/season/:year", (req, res) => {
  const { year } = req.params;
  if (!isInt(year)) return badReq(res, "Year must be an integer.");
  db.all("SELECT * FROM races WHERE year = ? ORDER BY round ASC;", [year], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No races for season ${year}.`);
    res.json(rows);
  });
});

// 12) /api/races/season/year/round
/* Returns a specific race within a given season specified by the round number, 
e.g., to return the 4th race in the 2022 season: /api/races/season/2022/4 */
app.get("/api/races/season/:year/:round", (req, res) => {
  const { year, round } = req.params;
  if (!isInt(year) || !isInt(round)) return badReq(res, "Year and round must be integers.");
  db.get("SELECT * FROM races WHERE year = ? AND round = ?;", [year, round], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return notFound(res, `No race for season ${year}, round ${round}.`);
    res.json(row);
  });
});

// 13) /api/races/circuits/ref
// Returns all the races for a given circuit (use the circuitRef field), ordered by year, e.g. /api/races/circuits/monza
app.get("/api/races/circuits/:ref", (req, res) => {
  const { ref } = req.params;
  const sql = `
    SELECT r.*
    FROM races r
    JOIN circuits c ON c.circuitId = r.circuitId
    WHERE c.circuitRef = ?
    ORDER BY r.year ASC, r.round ASC;
  `;
  db.all(sql, [ref], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No races for circuit '${ref}'.`);
    res.json(rows);
  });
});

// 14) /api/races/circuits/ref/season/start/end
// Returns all the races for a given circuit between two years(include the races in the provided years), 
// e.g., /api/races/circuits/monza/season/2015/2020
//       /api/races/circuits/monza/season/2020/2020
app.get("/api/races/circuits/:ref/season/:start/:end", (req, res) => {
  const { ref, start, end } = req.params;
  if (!isInt(start) || !isInt(end)) return badReq(res, "start and end must be integers.");
  if (Number(end) < Number(start)) return badReq(res, "end year must be >= start year.");

  const sql = `
    SELECT r.*
    FROM races r
    JOIN circuits c ON c.circuitId = r.circuitId
    WHERE c.circuitRef = ?
      AND r.year BETWEEN ? AND ?
    ORDER BY r.year ASC, r.round ASC;
  `;
  db.all(sql, [ref, start, end], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length)
      return notFound(res, `No races for '${ref}' between ${start} and ${end}.`);
    res.json(rows);
  });
});

// 15) /api/results/raceId
/* Returns the results for the specified race, e.g.,
/api/results/1106
Don’t provide the foreign keys for the race, driver, and
constructor; instead provide the following fields: driver
(driverRef, code, forename, surname), race (name, round, year,
date), constructor (name, constructorRef, nationality).
Sort by the field grid in ascending order (1st place first, 2nd
place second, etc). */
app.get("/api/results/:raceId", (req, res) => {
  const { raceId } = req.params;
  if (!isInt(raceId)) return badReq(res, "raceId must be an integer.");
  const sql = `
    SELECT
      r.resultId, r.position, r.positionText, r.points, r.grid, r.laps, r.statusId,
      -- race
      ra.name   AS race_name,   ra.round AS race_round, ra.year AS race_year, ra.date AS race_date,
      -- driver
      d.driverRef AS driver_ref, d.code AS driver_code, d.forename AS driver_forename, d.surname AS driver_surname,
      -- constructor
      c.name AS constructor_name, c.constructorRef AS constructor_ref, c.nationality AS constructor_nationality
    FROM results r
    JOIN races ra       ON ra.raceId = r.raceId
    JOIN drivers d      ON d.driverId = r.driverId
    JOIN constructors c ON c.constructorId = r.constructorId
    WHERE r.raceId = ?
    ORDER BY r.grid ASC;
  `;
  db.all(sql, [raceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No results for raceId ${raceId}.`);
    res.json(rows);
  });
});

// 16) /api/results/driver/ref
// Returns all the results for a given driver, e.g., /api/results/driver/max_verstappen
app.get("/api/results/driver/:ref", (req, res) => {
  const { ref } = req.params;
  const sql = `
    SELECT
      r.resultId, r.position, r.points, r.grid, r.laps, r.statusId,
      ra.raceId, ra.year, ra.round, ra.name, ra.date,
      c.name AS constructor_name, c.constructorRef AS constructor_ref
    FROM results r
    JOIN drivers d      ON d.driverId = r.driverId
    JOIN races ra       ON ra.raceId = r.raceId
    JOIN constructors c ON c.constructorId = r.constructorId
    WHERE d.driverRef = ?
    ORDER BY ra.year ASC, ra.round ASC;
  `;
  db.all(sql, [ref], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No results for driver '${ref}'.`);
    res.json(rows);
  });
});

// 17) /api/results/drivers/ref/seasons/start/end
// Returns all the results for a given driver between two years, e.g., /api/results/drivers/sainz/seasons/2022/2022
app.get("/api/results/drivers/:ref/seasons/:start/:end", (req, res) => {
  const { ref, start, end } = req.params;
  if (!isInt(start) || !isInt(end)) return badReq(res, "start and end must be integers.");
  if (Number(end) < Number(start)) return badReq(res, "end year must be >= start year.");
  const sql = `
    SELECT
      r.resultId, r.position, r.points, r.grid, r.laps, r.statusId,
      ra.raceId, ra.year, ra.round, ra.name, ra.date,
      c.name AS constructor_name, c.constructorRef AS constructor_ref
    FROM results r
    JOIN drivers d      ON d.driverId = r.driverId
    JOIN races ra       ON ra.raceId = r.raceId
    JOIN constructors c ON c.constructorId = r.constructorId
    WHERE d.driverRef = ?
      AND ra.year BETWEEN ? AND ?
    ORDER BY ra.year ASC, ra.round ASC;
  `;
  db.all(sql, [ref, start, end], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length)
      return notFound(res, `No results for '${ref}' between ${start} and ${end}.`);
    res.json(rows);
  });
});

// 18) /api/qualifying/raceId
/* Returns the qualifying results for the specified race, e.g.,
/api/qualifying/1106
Provide the same fields as with results for the foreign keys.
Sort by the field position in ascending order. */
app.get("/api/qualifying/:raceId", (req, res) => {
  const { raceId } = req.params;
  if (!isInt(raceId)) return badReq(res, "raceId must be an integer.");
  const sql = `
    SELECT
      q.qualifyId, q.position, q.q1, q.q2, q.q3,
      ra.name AS race_name, ra.round AS race_round, ra.year AS race_year, ra.date AS race_date,
      d.driverRef AS driver_ref, d.code AS driver_code, d.forename AS driver_forename, d.surname AS driver_surname,
      c.name AS constructor_name, c.constructorRef AS constructor_ref, c.nationality AS constructor_nationality
    FROM qualifying q
    JOIN races ra       ON ra.raceId = q.raceId
    JOIN drivers d      ON d.driverId = q.driverId
    JOIN constructors c ON c.constructorId = q.constructorId
    WHERE q.raceId = ?
    ORDER BY q.position ASC;
  `;
  db.all(sql, [raceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No qualifying for raceId ${raceId}.`);
    res.json(rows);
  });
});

// 19) /api/standings/drivers/raceId
/* Returns the current season driver standings table for the
specified race, sorted by position in ascending order.
Provide the same fields as with results for the driver. */
app.get("/api/standings/drivers/:raceId", (req, res) => {
  const { raceId } = req.params;
  if (!isInt(raceId)) return badReq(res, "raceId must be an integer.");
  const sql = `
    SELECT
      ds.position, ds.points, ds.wins,
      d.driverRef AS driver_ref, d.code AS driver_code, d.forename AS driver_forename, d.surname AS driver_surname
    FROM driverStandings ds
    JOIN drivers d ON d.driverId = ds.driverId
    WHERE ds.raceId = ?
    ORDER BY ds.position ASC;
  `;
  db.all(sql, [raceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No driver standings for raceId ${raceId}.`);
    res.json(rows);
  });
});

// 20)  /api/standings/constructors/raceId
/* Returns the current season constructors standings table for
the specified race, sorted by position in ascending order.
Provide the same fields as with results for the constructor. */
app.get("/api/standings/constructors/:raceId", (req, res) => {
  const { raceId } = req.params;
  if (!isInt(raceId)) return badReq(res, "raceId must be an integer.");
  const sql = `
    SELECT
      cs.position, cs.points, cs.wins,
      c.name AS constructor_name, c.constructorRef AS constructor_ref, c.nationality AS constructor_nationality
    FROM constructorStandings cs
    JOIN constructors c ON c.constructorId = cs.constructorId
    WHERE cs.raceId = ?
    ORDER BY cs.position ASC;
  `;
  db.all(sql, [raceId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows?.length) return notFound(res, `No constructor standings for raceId ${raceId}.`);
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));

