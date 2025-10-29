# TicketBoss_Api
# TicketBoss - Event Ticketing API

## Overview
TicketBoss is a tiny event-ticketing API built with Node.js, Express, and SQLite.  
It allows external partners to reserve seats for an event in real-time using **optimistic concurrency control**, preventing overselling.

This project is a coding challenge solution for a tech meetup ticketing system.
I done it using Postman where I check APi. 

---

## Features

- Automatic event bootstrap on first startup.
- Reserve seats with immediate accept/deny response.
- Cancel reservations and release seats back to the pool.
- Event summary endpoint to check seat availability and reservations.
- Validation for seat limits (1-10 per reservation).
- Simple persistent storage using SQLite.

---

## Tech Stack

- **Node.js** (v18+)
- **Express** – for API routing.
- **SQLite** (`better-sqlite3`) – lightweight database.
- **UUID** (`uuid` package) – generates unique reservation IDs.

---
When we open ticketboss.js and run it that time we get message 🎟️ TicketBoss API running on http://localhost:3000
if this message gets then we go to postman and give request for post http://localhost:3000/events and put this in body 
for events
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 500,
  "version": 0
}
we get output
200 ok in green
{
    "message": "Event created successfully"
}
 for Reservation 
 post http://localhost:3000/reservation
 in body 
 {
  "partnerId": "abc-corp",
  "seats": 3
}
output
{
  "reservationId": "some-uuid",
  "seats": 3,
  "status": "confirmed"
}
409 Conflict if not enough seats

400 Bad Request if seats ≤ 0 or > 10
cancel reservation
POST http://localhost:3000/events/E002/cancel
in body
{
  "seats": 2
}
output
{
  "message": "Cancelled 2 seat(s) successfully",
  "remainingSeats": 97
}
for update 
PUT http://localhost:3000/events/E002
in body
{
  "name": "Node.js Meetup (Updated)",
  "totalSeats": 120
}
output
200 ok 
{
    "message": "Event updated successfully"
}

## Setup Instructions

1. Clone the repository:

```bash
git clone <your-repo-url>
cd ticketboss
