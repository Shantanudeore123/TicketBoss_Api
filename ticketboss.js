const express = require("express");
const sqlite3 = require("better-sqlite3");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ======== MIDDLEWARE ======
app.use(cors());
app.use(express.json()); // Only JSON parser

//====== DATABASE =======
const db = new sqlite3("ticketboss.db");

// users table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    confirmed INTEGER DEFAULT 0
  )
`
).run();

// Events table
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT UNIQUE,
    name TEXT,
    totalSeats INTEGER,
    availableSeats INTEGER,
    reservationCount INTEGER,
    version INTEGER
  )
`
).run();

// ===== DEBUG ROUTE ========
// Temporary: check what JSON body the server receives
app.post("/test", (req, res) => {
  console.log("BODY RECEIVED:", req.body);
  res.json({ received: req.body });
});

// ====================== USER ROUTES ======================

// Get all users
app.get("/users", (req, res) => {
  try {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add user
app.post("/add", (req, res) => {
  const body = req.body || {};
  const { name, email, confirmed } = body;

  if (!name || !email)
    return res.status(400).json({ error: "Name and email required" });

  try {
    db.prepare(
      "INSERT INTO users (name, email, confirmed) VALUES (?, ?, ?)"
    ).run(name, email, confirmed || 0);
    res.json({ message: "User added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//  Cancel reserved seats
app.post("/events/:eventId/cancel", (req, res) => {
  const { eventId } = req.params;
  const { seats } = req.body;

  try {
    const event = db
      .prepare("SELECT * FROM events WHERE eventId = ?")
      .get(eventId);

    if (!event) return res.status(404).json({ error: "Event not found" });
    if (seats <= 0)
      return res.status(400).json({ error: "Invalid seat number" });
    if (event.reservationCount < seats)
      return res
        .status(400)
        .json({ error: "Cannot cancel more seats than reserved" });

    const newAvailable = event.availableSeats + seats;
    const newCount = event.reservationCount - seats;

    db.prepare(
      `
      UPDATE events 
      SET availableSeats = ?, reservationCount = ?, version = version + 1 
      WHERE eventId = ?
    `
    ).run(newAvailable, newCount, eventId);

    res.json({
      message: `Cancelled ${seats} seat(s) successfully`,
      remainingSeats: newAvailable,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update
app.put("/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  const { name, totalSeats } = req.body;

  try {
    const event = db
      .prepare("SELECT * FROM events WHERE eventId = ?")
      .get(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const availableSeats = totalSeats
      ? totalSeats - event.reservationCount
      : event.availableSeats;

    db.prepare(
      `
      UPDATE events 
      SET name = COALESCE(?, name), totalSeats = COALESCE(?, totalSeats), availableSeats = ? 
      WHERE eventId = ?
    `
    ).run(name, totalSeats, availableSeats, eventId);

    res.json({ message: "Event updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm Customer
app.put("/confirm/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE users SET confirmed = 1 WHERE id = ?").run(id);
    res.json({ message: "User confirmed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Customer
app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// = Event Route=//

// Add event
app.post("/events", (req, res) => {
  const body = req.body || {};
  const {
    eventId,
    name,
    totalSeats,
    availableSeats,
    reservationCount,
    version,
  } = body;

  if (!eventId || !name)
    return res.status(400).json({ error: "eventId and name required" });

  try {
    db.prepare(
      `
      INSERT INTO events (eventId, name, totalSeats, availableSeats, reservationCount, version)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(
      eventId,
      name,
      totalSeats || 0,
      availableSeats || 0,
      reservationCount || 0,
      version || 0
    );

    res.json({ message: "Event created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all events
app.get("/events", (req, res) => {
  try {
    const events = db.prepare("SELECT * FROM events").all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reserve seats for event
app.post("/events/:eventId/reserve", (req, res) => {
  const { eventId } = req.params;
  const { seats } = req.body || {};

  if (!seats || seats <= 0)
    return res.status(400).json({ error: "Invalid number of seats" });

  try {
    const event = db
      .prepare("SELECT * FROM events WHERE eventId = ?")
      .get(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.availableSeats < seats)
      return res.status(400).json({ error: "Not enough seats available" });

    const newAvailable = event.availableSeats - seats;
    const newCount = event.reservationCount + seats;

    db.prepare(
      `
      UPDATE events
      SET availableSeats = ?, reservationCount = ?, version = version + 1
      WHERE eventId = ?
    `
    ).run(newAvailable, newCount, eventId);

    res.json({
      message: `Reserved ${seats} seat(s) successfully`,
      remainingSeats: newAvailable,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==== ticketboss START ====
app.listen(PORT, () => {
  console.log(`🎟️ TicketBoss API running on http://localhost:${PORT}`);
});
