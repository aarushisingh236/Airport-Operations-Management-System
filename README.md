# Airport Operations Management System

## 1. Project Overview

The **Airport Operations Management System** is a database-driven web application developed to support the management and monitoring of airport ground operations.

It provides a centralized dashboard for viewing flight schedules, gate assignments, passenger bookings, baggage details, ground operations, equipment, staff assignments and flight delays.

The project combines two database technologies:

- **MySQL:** Manages structured airport data using relational tables, SQL queries, transactions, views, stored procedures and triggers.
- **Neo4j:** Models connections between flights, gates, crew members, passengers, bookings, baggage, aircraft and airports, enabling relationship-based queries and analysis.

A web application built with Next.js brings the two databases together through a single interface.

## 2. Team Members

| Name | SRN |
|---|---|
| Aarushi Singh | PES2UG24CS015 |
| Akhila T | PES2UG24CS043 |

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 15, React 19 |
| Backend | Next.js API Route Handlers |
| Relational Database | MySQL 8 |
| Graph Database | Neo4j |
| MySQL Driver | mysql2 |
| Neo4j Driver | neo4j-driver |
| Authentication | JWT-based sessions using jose |
| Programming Language | JavaScript |
| Styling | CSS |
| Development Environment | Visual Studio Code |

## 4. System Features

### MySQL Features

- Management of flight schedules and information about airports, airlines, aircraft, terminals and gates.
- Passenger booking and baggage records.
- Ground operation tracking and equipment and staff assignments.
- Flight delay records.
- Gate conflict detection using time-interval overlap conditions.
- SQL views for consolidated flight operation summaries.
- Stored procedures for retrieving flight summaries.
- Triggers for automatically maintaining audit records.
- Correlated subqueries and transaction demonstrations, including rollback.
- Indexes to support query performance.

### Neo4j Features

- Flight-to-gate assignment analysis.
- Crew-to-flight relationship and roster analysis.
- Passenger, booking and baggage relationship traversal.
- Flight delay impact analysis.
- Aircraft utilisation analysis.
- Airport, terminal and gate relationship analysis.
- Graph-based exploration of connected airport entities.

### Web Application Features

- User login and role-based access.
- Airport operations dashboard.
- Flight statistics and schedule display.
- Gate conflict monitoring.
- Ground operation management.
- Audit information.
- Interactive advanced SQL demonstrations.
- Interactive Neo4j graph analytics.

## 5. Database Structure

### MySQL

The relational database is named `Airport_operation`. It contains tables for the main airport operations and supporting functionality, including:

- Airports, airlines, aircraft, terminals and gates.
- Flights and flight-gate assignments.
- Crew members and flight-crew assignments.
- Passengers, bookings and baggage.
- Ground operations, equipment and staff assignments.
- Weather, notifications and flight delays.
- User accounts and audit records.

The database also includes SQL views, triggers, a stored procedure and indexes to support reporting, auditing and query execution.

### Neo4j

The graph database represents airport operations using nodes such as:

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

Relationships connect these entities according to their operational associations. This structure supports graph traversal and analysis of connected airport activities.

## 6. Project Structure

```text
airport-operations-management-system/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   └── logout/route.js
│   │   ├── flights/route.js
│   │   ├── graph/
│   │   │   └── [flightNo]/route.js
│   │   ├── ground-operations/
│   │   │   └── [id]/route.js
│   │   ├── neo4j/
│   │   │   └── analytics/route.js
│   │   └── sql-demo/route.js
│   ├── components/
│   │   ├── Operations.js
│   │   ├── AdvancedSQL.js
│   │   └── Neo4jAnalytics.js
│   ├── login/page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── database/
│   ├── mysql/
│   │   ├── airport_operation.sql
│   │   └── advanced_queries.sql
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

## 7. Setup and Execution

### Prerequisites

- Node.js and npm
- MySQL 8
- Neo4j Desktop or a running Neo4j instance
- Visual Studio Code (recommended)

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd airport-operations-management-system
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env.local` file in the project root and use `.env.example` as a reference. Set the connection details for your local databases and a secure JWT secret.

The required variables are:

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

Use your own database credentials and replace the JWT secret with a secure random value. Do not commit `.env.local` to GitHub.

### Step 4: Set up MySQL

Open MySQL and execute the main database script:

```text
database/mysql/airport_operation.sql
```

This script sets up the relational database and its supporting objects and sample data. To run the additional SQL demonstrations, execute:

```text
database/mysql/advanced_queries.sql
```

**Note:** Inspect the main SQL script before running it again, as it may drop and recreate the database.

### Step 5: Set up Neo4j

Start your Neo4j database and open Neo4j Browser. Execute the following Cypher files in order:

1. `database/neo4j/01_constraints.cypher`
2. `database/neo4j/02_seed_graph.cypher`
3. `database/neo4j/03_queries.cypher`

The first file creates the graph constraints, the second loads the graph data, and the third contains the graph analysis queries.

### Step 6: Run the application

Start the Next.js development server:

```bash
npm run dev
```

Open the application in your browser at:

```text
http://localhost:3000
```

Sign in using an account configured in the MySQL `USER_ACCOUNT` table.

## 8. Database and Application Integration

The application uses Next.js API Route Handlers to communicate with the databases.

- The dashboard retrieves and displays operational information from MySQL.
- MySQL API routes handle flight information, SQL demonstrations and ground operation actions.
- The Neo4j driver connects the application to the graph database.
- Neo4j API routes execute predefined Cypher analytics queries.
- Authentication uses JWT-based sessions.
- Database triggers generate audit records when their defined database events occur.

## 9. Team Contributions

**Aarushi Singh — PES2UG24CS015**

- MySQL relational database design and implementation.
- SQL schema, sample data and advanced queries.
- Views, triggers, stored procedures and indexes.
- MySQL connectivity and API development.
- SQL dashboard functionality and ground operations features.
- Authentication and core application integration.

**Akhila T — PES2UG24CS043**

- Neo4j graph database design and implementation.
- Graph constraints and sample graph data.
- Cypher query development.
- Neo4j connectivity and API development.
- Interactive graph analytics component.
- Graph relationship testing and validation.

Both team members contribute to application integration, testing, documentation and final project validation.

## 10. Conclusion

The Airport Operations Management System demonstrates how relational and graph databases can be used together in an airport operations environment.

MySQL supports structured data storage, relational queries, transactions and database-level operations, while Neo4j supports relationship traversal and graph-based analysis. The Next.js application integrates both databases into a unified interface for monitoring and analysing airport ground operations.
