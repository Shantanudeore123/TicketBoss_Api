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

## Setup Instructions

1. Clone the repository:

```bash
git clone <your-repo-url>
cd ticketboss
