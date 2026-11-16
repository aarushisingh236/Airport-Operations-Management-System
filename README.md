# Airport Operations Management System

## 1. Project Overview

The **Airport Operations Management System** is a database-driven web application developed to manage and monitor airport ground operations and resource coordination.

The application provides a centralized dashboard for monitoring flight schedules, gate assignments, passenger bookings, baggage, ground operations, equipment, staff assignments and flight delays.

The system integrates two different database paradigms:

- **MySQL:** Used for structured relational data management, SQL queries, transactions, views, stored procedures and triggers.
- **Neo4j:** Used for representing and analysing relationships between flights, gates, crew members, passengers, bookings, baggage, aircraft and airports.

The application is developed using Next.js and provides a web-based interface for accessing operational information and database analytics.

## 2. Team Members

| Name | SRN |
|---|---|
| Aarushi Singh | PES2UG24CS015 |
| Akhila T | PES2UG24CS043 |

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 15 |
| UI Library | React 19 |
| Backend | Next.js API Route Handlers |
| Relational Database | MySQL 8 |
| Graph Database | Neo4j |
| MySQL Connectivity | mysql2 |
| Neo4j Connectivity | neo4j-driver |
| Authentication | JWT using jose |
| Programming Language | JavaScript |
| Styling | CSS |
| Development Environment | Visual Studio Code |

## 4. System Features

### 4.1 MySQL Features

- Relational database design for airport operations.
- Flight, airline, airport, aircraft, terminal and gate management.
- Passenger, booking and baggage records.
- Ground operation management.
- Equipment and staff assignments.
- Flight delay records.
- Gate conflict detection using SQL interval-overlap conditions.
- SQL views for consolidated flight operation summaries.
- Correlated subqueries and NOT EXISTS queries.
- Stored procedures for flight summaries.
- Triggers for automatic audit record generation.
- Database transactions and rollback demonstrations.
- Indexes for query performance.

### 4.2 Neo4j Features

- Flight-to-gate assignment relationships.
- Crew-to-flight relationships and crew roster analysis.
- Passenger-to-booking-to-flight relationships.
- Booking-to-baggage relationship traversal.
- Flight delay impact analysis.
- Aircraft utilisation analysis.
- Airport, terminal and gate relationship analysis.
- Graph-based exploration of connected airport entities.

### 4.3 Web Application Features

- User login and authentication.
- Role-based access for ADMIN and OPERATOR users.
- Airport operations dashboard.
- Flight statistics and schedule.
- Gate conflict monitoring.
- Ground operations management.
- Deletion audit records.
- Interactive advanced SQL demonstrations.
- Interactive Neo4j graph analytics.

## 5. Database Design

### 5.1 MySQL Database

The relational database is named `Airport_operation`.

It contains 24 tables covering airport operations and supporting functionality.

The tables include:

- AIRPORT
- AIRLINE
- AIRCRAFT
- TERMINAL
- GATE
- FLIGHT
- FLIGHT_GATE_ASSIGNMENT
- CREW
- FLIGHT_CREW
- PASSENGER
- BOOKING
- BAGGAGE
- GROUND_OPERATION
- EQUIPMENT
- EQUIPMENT_ASSIGNMENT
- STAFF
- OPERATION_STAFF_ASSIGNMENT
- WEATHER
- NOTIFICATION
- DELAY_REASON
- DELAY
- USER_ACCOUNT
- GROUND_OPERATION_AUDIT
- FLIGHT_STATUS_AUDIT

The database also contains:

**View**
- V_FLIGHT_OPERATIONS_SUMMARY

**Triggers**
- TRG_GROUND_OPERATION_AFTER_DELETE
- TRG_FLIGHT_STATUS_AFTER_UPDATE

**Stored Procedure**
- SP_GET_FLIGHT_SUMMARY

**Indexes**
- IDX_FLIGHT_STATUS_DATE
- IDX_GATE_ASSIGNMENT_INTERVAL
- IDX_BOOKING_FLIGHT
- IDX_DELAY_FLIGHT

### 5.2 Neo4j Graph Database

The graph database represents airport operations through nodes and relationships.

**Node types**

- Flight
- Gate
- Crew
- Passenger
- Booking
- Baggage
- Aircraft
- Airport
- Terminal
- Airline
- DelayReason

**Relationship types**

- ASSIGNED_TO
- CREWS
- MADE
- FOR_FLIGHT
- HAS_BAGGAGE
- DELAYED_BY
- USES_AIRCRAFT
- HAS_TERMINAL
- HAS_GATE
- OPERATES
- DEPARTS_FROM
- ARRIVES_AT

These relationships support graph traversal and analysis of operational connections.

## 6. Project Folder Structure

```text
airport-operations-management-system/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.js
│   │   │   └── logout/
│   │   │       └── route.js
│   │   ├── flights/
│   │   │   └── route.js
│   │   ├── graph/
│   │   │   └── [flightNo]/
│   │   │       └── route.js
│   │   ├── ground-operations/
│   │   │   └── [id]/
│   │   │       └── route.js
│   │   ├── neo4j/
│   │   │   └── analytics/
│   │   │       └── route.js
│   │   └── sql-demo/
│   │       └── route.js
│   │
│   ├── components/
│   │   ├── AdvancedSQL.js
│   │   ├── Neo4jAnalytics.js
│   │   └── Operations.js
│   │
│   ├── login/
│   │   └── page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── database/
│   ├── mysql/
│   │   ├── advanced_queries.sql
│   │   └── airport_operation.sql
│   │
│   └── neo4j/
│       ├── 01_constraints.cypher
│       ├── 02_seed_graph.cypher
│       └── 03_queries.cypher
│
├── lib/
│   ├── auth.js
│   ├── db.js
│   └── neo4j.js
│
├── .env.example
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
└── README.md
```

## 7. Installation and Execution

### Prerequisites

- Node.js
- npm
- MySQL 8
- Neo4j Desktop or a running Neo4j database
- Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd airport-operations-management-system
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory.

Use `.env.example` as the reference and configure the following variables:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=Airport_operation

NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password

JWT_SECRET=your_random_secret_of_at_least_32_characters
```

Use your own database credentials and a secure JWT secret. Never upload `.env.local` to GitHub.

### Step 4: Configure MySQL

Open MySQL and execute:

```text
database/mysql/airport_operation.sql
```

This script creates the database, tables, sample records, views, triggers, stored procedure and indexes.

To execute the additional SQL demonstrations, run:

```text
database/mysql/advanced_queries.sql
```

**Note:** Inspect the main SQL script before rerunning it because it may drop and recreate the database.

### Step 5: Configure Neo4j

Start your Neo4j database and open Neo4j Browser.

Execute the following files in order:

1. `database/neo4j/01_constraints.cypher`
2. `database/neo4j/02_seed_graph.cypher`
3. `database/neo4j/03_queries.cypher`

The first two files configure and populate the graph database. The third contains graph analysis queries.

### Step 6: Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

Sign in using an account configured in the MySQL USER_ACCOUNT table.

## 8. Application Architecture

The application uses Next.js for both the frontend and backend.

- The dashboard retrieves operational information from MySQL.
- MySQL API routes handle flight information, SQL demonstrations and ground operation actions.
- The Neo4j driver connects the application to the graph database.
- Neo4j API routes execute predefined Cypher analytics queries.
- Authentication is managed through JWT-based sessions.
- Database triggers automatically generate audit records when the corresponding database events occur.

## 9. Team Contributions

### Aarushi Singh — PES2UG24CS015

- MySQL relational database design and implementation.
- SQL schema and sample data.
- Advanced SQL queries, views, triggers and stored procedures.
- MySQL connectivity and API development.
- SQL dashboard components and ground operations functionality.
- Authentication and core application integration.

### Akhila T — PES2UG24CS043

- Neo4j graph database design and implementation.
- Graph constraints and sample graph data.
- Cypher query development.
- Neo4j connectivity and API development.
- Interactive graph analytics component.
- Graph relationship testing and validation.

Both members contribute to application integration, testing, documentation and final project validation.

## 10. Conclusion

The Airport Operations Management System demonstrates the integration of relational and graph database technologies in an airport operations environment.

MySQL provides structured data management, advanced SQL functionality and transactional support, while Neo4j enables relationship-based analysis and graph traversal.

The Next.js application brings both database systems together through a unified dashboard for monitoring and analysing airport ground operations.
