# Airport Operations Management System

## 1. Project Overview

The **Airport Operations Management System** is a database-driven web application designed to support airport ground operations and resource coordination.

The system provides a centralized interface for monitoring flight schedules, gate assignments, passenger bookings, baggage, ground operations, equipment, staff assignments and flight delays.

It uses two database paradigms:

- **MySQL:** Stores structured operational data and supports relational queries, transactions, views, stored procedures and triggers.
- **Neo4j:** Represents relationships between flights, gates, crew members, passengers, bookings, baggage, aircraft and airports through a graph database.

The application combines both databases to provide operational information and relationship-based analytics through a web dashboard.

## 2. Team Members

| Name | SRN |
|---|---|
| Aarushi Singh | PES2UG24CS015 |
| Akhila T | PES2UG24CS043 |

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 15, React 19 |
| Backend | Next.js Route Handlers |
| Relational Database | MySQL 8 |
| Graph Database | Neo4j |
| MySQL Driver | mysql2 |
| Neo4j Driver | neo4j-driver |
| Authentication | JWT-based sessions using jose |
| Programming Language | JavaScript |
| Development Environment | Visual Studio Code |

## 4. System Features

### MySQL Features

- Flight schedule management
- Airport, airline, aircraft, terminal and gate information
- Passenger bookings and baggage records
- Ground operation tracking
- Equipment and staff assignments
- Flight delay records
- Gate conflict detection using time-interval overlap
- SQL views for flight operation summaries
- Stored procedures for flight summaries
- Triggers for maintaining audit records
- Correlated subqueries and transaction demonstrations
- Indexes for improving query performance

### Neo4j Features

- Flight-to-gate assignment relationships
- Crew-to-flight relationships
- Passenger, booking and baggage relationship traversal
- Flight delay impact analysis
- Shared aircraft analysis
- Airport, terminal and gate relationship analysis
- Graph-based relationship exploration

### Web Application Features

- Login and role-based access
- Operational dashboard
- Flight statistics and schedule
- Gate conflict monitoring
- Ground operation management
- Audit information
- Advanced SQL demonstrations
- Interactive Neo4j analytics

## 5. Database Structure

### MySQL

The relational database contains operational and supporting tables for:

- Airports, airlines, aircraft, terminals and gates
- Flights and flight-gate assignments
- Crew and flight-crew assignments
- Passengers, bookings and baggage
- Ground operations, equipment and staff
- Weather, notifications and flight delays
- User accounts and audit records

It also includes SQL views, triggers, stored procedures and indexes.

### Neo4j

The graph database models airport operations using nodes such as:

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

Relationships represent operational connections between these entities, allowing graph traversal and relationship-based analysis.

## 6. Project Structure

```text
Airport-Operations-Management-System/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── operations/
│   │   └── neo4j/
│   │       └── analytics/
│   ├── components/
│   │   ├── Operations.js
│   │   ├── AdvancedSQL.js
│   │   └── Neo4jAnalytics.js
│   ├── login/
│   ├── page.js
│   └── layout.js
│
├── lib/
│   ├── auth.js
│   ├── db.js
│   └── neo4j.js
│
├── database/
│   ├── mysql/
│   │   ├── 01_schema.sql
│   │   ├── 02_seed_data.sql
│   │   └── 03_advanced_queries.sql
│   │
│   └── neo4j/
│       ├── 01_constraints.cypher
│       ├── 02_seed_graph.cypher
│       └── 03_queries.cypher
│
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

*The structure above represents the intended organization. Actual filenames may vary depending on the implementation.*

## 7. Setup and Execution

### Prerequisites

- Node.js and npm
- MySQL 8
- Neo4j Desktop or a running Neo4j instance
- Visual Studio Code

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Airport-Operations-Management-System
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env.local` file in the project root using `.env.example` as a reference.

Configure the MySQL and Neo4j connection details and the application session secret.

Do not commit `.env.local` to GitHub.

### Step 4: Set up MySQL

Run the SQL schema and seed scripts in the correct order using MySQL.

```text
database/mysql/01_schema.sql
database/mysql/02_seed_data.sql
```

Run the advanced SQL demonstration queries when required:

```text
database/mysql/03_advanced_queries.sql
```

**Note:** Check the schema script before rerunning it because it may drop and recreate the database.

### Step 5: Set up Neo4j

Open Neo4j Browser and execute the Cypher scripts in order:

```text
database/neo4j/01_constraints.cypher
database/neo4j/02_seed_graph.cypher
```

Use the query file to run the graph analytics demonstrations:

```text
database/neo4j/03_queries.cypher
```

### Step 6: Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Log in using the configured demonstration account credentials, if the seed data has been loaded.

## 8. Database and Application Integration

The application uses Next.js Route Handlers to communicate with the databases.

- MySQL operations are performed through the MySQL connection module.
- Neo4j graph queries are executed through the Neo4j driver module.
- The dashboard retrieves and presents operational information from both databases.
- Database triggers automatically maintain audit records when their defined database events occur.

## 9. Team Contributions

**Aarushi Singh — PES2UG24CS015**
- MySQL database design and implementation
- SQL schema, seed data and advanced queries
- SQL-based dashboard functionality
- Authentication and core application integration

**Akhila T — PES2UG24CS043**
- Neo4j graph database design and implementation
- Graph constraints, seed data and Cypher queries
- Neo4j analytics API
- Graph analytics interface and integration testing

Both team members contribute to integration, testing, documentation and validation of the complete application.

## 10. Conclusion

The Airport Operations Management System demonstrates the use of relational and graph databases in a practical operational setting.

MySQL supports structured data management, integrity constraints and advanced SQL operations, while Neo4j supports relationship traversal and graph-based analysis. Their integration through a Next.js application provides a unified interface for monitoring and analysing airport ground operations.