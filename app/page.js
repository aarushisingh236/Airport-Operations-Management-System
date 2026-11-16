
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import Operations from "./components/Operations";
import AdvancedSQL from "./components/AdvancedSQL";
import Neo4jAnalytics from "./components/Neo4jAnalytics";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
    const s = await getSession();

    if (!s) redirect("/login");

    // Dashboard statistics
    const [stats] = await query(`
        SELECT
            (SELECT COUNT(*) FROM FLIGHT) AS flights,
            (SELECT COUNT(*) FROM FLIGHT WHERE Status = 'Delayed') AS delayed_flights,
            (SELECT COUNT(*) FROM PASSENGER) AS passengers,
            (SELECT COUNT(*) FROM GATE) AS gates
    `);

    // Flight schedule reads from the SQL VIEW, with scheduled departure time added.
    const flights = await query(`
        SELECT
            v.Flight_ID,
            v.Flight_Number,
            v.Status,
            v.Airline_Name,
            v.Departure_Airport AS Origin,
            v.Arrival_Airport AS Destination,
            f.Scheduled_Dep_Time,
            v.Passenger_Count
        FROM V_FLIGHT_OPERATIONS_SUMMARY v
        JOIN FLIGHT f
            ON f.Flight_ID = v.Flight_ID
        ORDER BY f.Scheduled_Dep_Time
    `);

    // Gate conflict detection using interval overlap
    const conflicts = await query(`
        SELECT
            g.Gate_Number,
            f1.Flight_Number AS f1,
            f2.Flight_Number AS f2
        FROM FLIGHT_GATE_ASSIGNMENT a
        JOIN FLIGHT_GATE_ASSIGNMENT b
            ON a.Gate_ID = b.Gate_ID
            AND a.Assignment_ID < b.Assignment_ID
            AND a.Assigned_From < b.Assigned_To
            AND b.Assigned_From < a.Assigned_To
        JOIN GATE g
            ON g.Gate_ID = a.Gate_ID
        JOIN FLIGHT f1
            ON f1.Flight_ID = a.Flight_ID
        JOIN FLIGHT f2
            ON f2.Flight_ID = b.Flight_ID
    `);

    // Ground operations
    const ops = await query(`
        SELECT
            go.Operation_ID,
            go.Operation_Type,
            go.Status,
            f.Flight_Number
        FROM GROUND_OPERATION go
        JOIN FLIGHT f
            ON f.Flight_ID = go.Flight_ID
        ORDER BY go.Operation_ID
    `);

    // Deleted ground operation audit records
    const audit = await query(`
        SELECT *
        FROM GROUND_OPERATION_AUDIT
        ORDER BY Audit_ID DESC
        LIMIT 10
    `);

    // Flight delay records
    const delays = await query(`
        SELECT
            f.Flight_Number,
            dr.Reason_Description,
            d.Delay_Minutes
        FROM DELAY d
        JOIN FLIGHT f
            ON f.Flight_ID = d.Flight_ID
        JOIN DELAY_REASON dr
            ON dr.Reason_ID = d.Reason_ID
    `);

    return (
        <main className="page">

            {/* Header */}
            <header className="topbar">
                <div>
                    <div className="brand">
                        ✈ Airport Operations Management
                    </div>

                    <div className="muted">
                        Signed in as {s.username} · Role: {s.role}
                    </div>
                </div>

                <form action="/api/auth/logout" method="post">
                    <button className="secondary">
                        Log out
                    </button>
                </form>
            </header>

            {/* Dashboard statistics */}
            <section className="cards">
                {[
                    [stats.flights, "Flights"],
                    [stats.delayed_flights, "Delayed"],
                    [stats.passengers, "Passengers"],
                    [stats.gates, "Gates"]
                ].map(([v, l]) => (
                    <div className="card" key={l}>
                        <strong>{v}</strong>
                        <span className="muted">{l}</span>
                    </div>
                ))}
            </section>

            {/* Flight schedule */}
            <section className="panel">
                <h2>Flight schedule · MySQL</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Flight</th>
                            <th>Airline</th>
                            <th>Route</th>
                            <th>Departure</th>
                            <th>Passengers</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {flights.map(f => (
                            <tr key={f.Flight_Number}>
                                <td>{f.Flight_Number}</td>
                                <td>{f.Airline_Name}</td>
                                <td>
                                    {f.Origin} → {f.Destination}
                                </td>
                                <td>{String(f.Scheduled_Dep_Time)}</td>
                                <td>{f.Passenger_Count}</td>
                                <td>{f.Status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Gate conflicts */}
            <section className="panel">
                <h2>Gate conflicts · SQL interval overlap query</h2>

                {conflicts.length ? (
                    conflicts.map((c, i) => (
                        <p key={i}>
                            Gate <b>{c.Gate_Number}</b>: {c.f1} overlaps with {c.f2}
                        </p>
                    ))
                ) : (
                    <p>No conflicts found.</p>
                )}
            </section>

            {/* Delay records */}
            <section className="panel">
                <h2>Delay records</h2>

                {delays.map((d, i) => (
                    <p key={i}>
                        {d.Flight_Number}: {d.Delay_Minutes} minutes ·{" "}
                        {d.Reason_Description}
                    </p>
                ))}
            </section>

            {/* Advanced SQL demonstrations */}
            <AdvancedSQL role={s.role} />

            {/* Ground operations and audit */}
            <Operations
                operations={ops}
                auditRows={audit}
                role={s.role}
            />

            {/* Neo4j Graph Analytics */}
            <Neo4jAnalytics />

        </main>
    );
}
