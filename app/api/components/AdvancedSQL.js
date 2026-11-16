"use client";

import { useCallback, useEffect, useState } from "react";

const STATUS_OPTIONS = [
    "Scheduled",
    "Boarding",
    "Delayed",
    "Departed",
    "Arrived",
    "Cancelled"
];

function DataTable({ columns, rows, emptyText = "No matching records." }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table>
                <thead>
                    <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows?.length ? rows.map((row, index) => (
                        <tr key={row[columns[0].key] ?? index}>
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? "—")}
                                </td>
                            ))}
                        </tr>
                    )) : (
                        <tr><td colSpan={columns.length}>{emptyText}</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

const fieldStyle = {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 7,
    background: "#fff",
    color: "#172438",
    minWidth: 160
};

export default function AdvancedSQL({ role }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [flightId, setFlightId] = useState("");
    const [newStatus, setNewStatus] = useState("Boarding");
    const [triggerResult, setTriggerResult] = useState(null);

    const [procedureFlightId, setProcedureFlightId] = useState("1");
    const [procedureResult, setProcedureResult] = useState(null);

    const [equipmentId, setEquipmentId] = useState("1");
    const [targetStatus, setTargetStatus] = useState("In Use");
    const [transactionResult, setTransactionResult] = useState(null);

    const isAdmin = role === "ADMIN";

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/sql-demo", { cache: "no-store" });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not load SQL demonstration data.");
            setData(result);
            setFlightId((current) => current || String(result.flights?.[0]?.Flight_ID ?? ""));
            setEquipmentId((current) => current || String(result.equipment?.[0]?.Equipment_ID ?? ""));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    async function runAction(payload, onSuccess) {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const response = await fetch("/api/sql-demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "SQL operation failed.");
            onSuccess?.(result);
            setMessage(result.message || "SQL operation completed.");
            await loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    function updateFlightStatus(event) {
        event.preventDefault();
        setTriggerResult(null);
        runAction(
            { action: "update-status", flightId: Number(flightId), status: newStatus },
            (result) => setTriggerResult(result.audit)
        );
    }

    function callProcedure(event) {
        event.preventDefault();
        setProcedureResult(null);
        runAction(
            { action: "procedure", flightId: Number(procedureFlightId) },
            (result) => setProcedureResult(result.summary)
        );
    }

    function runTransaction(decision) {
        setTransactionResult(null);
        runAction(
            {
                action: "transaction",
                equipmentId: Number(equipmentId),
                targetStatus,
                decision
            },
            setTransactionResult
        );
    }

    const selectedFlight = data?.flights?.find((flight) => String(flight.Flight_ID) === String(flightId));
    const selectedEquipment = data?.equipment?.find((item) => String(item.Equipment_ID) === String(equipmentId));

    return (
        <section className="panel" id="advanced-sql">
            <h2>Advanced SQL Demonstration · MySQL</h2>
            <p className="muted">
                Interactive demonstrations of the database view, correlated subqueries,
                triggers, stored procedure, transaction and indexes.
            </p>

            {error && <div className="notice error">{error}</div>}
            {message && <div className="notice">{message}</div>}
            {loading && !data && <p className="muted">Loading SQL demonstration data…</p>}

            {data && (
                <>
                    {/* VIEW */}
                    <section style={{ marginTop: 22 }}>
                        <h3>1. View — V_FLIGHT_OPERATIONS_SUMMARY</h3>
                        <p className="muted">
                            This view joins FLIGHT, AIRLINE, AIRPORT, BOOKING and GROUND_OPERATION
                            to provide one consolidated flight operations summary.
                        </p>
                        <DataTable
                            columns={[
                                { key: "Flight_ID", label: "Flight ID" },
                                { key: "Flight_Number", label: "Flight" },
                                { key: "Status", label: "Status" },
                                { key: "Airline_Name", label: "Airline" },
                                { key: "Departure_Airport", label: "From" },
                                { key: "Arrival_Airport", label: "To" },
                                { key: "Passenger_Count", label: "Passengers" },
                                { key: "Ground_Operation_Count", label: "Ground operations" }
                            ]}
                            rows={data.viewRows}
                        />
                    </section>

                    {/* CORRELATED QUERIES */}
                    <section style={{ marginTop: 28 }}>
                        <h3>2. Correlated subqueries and NOT EXISTS</h3>
                        <p className="muted">
                            These queries are executed by MySQL when this dashboard loads.
                        </p>

                        <h4>Flights with more bookings than the average</h4>
                        <DataTable
                            columns={[
                                { key: "Flight_Number", label: "Flight" },
                                { key: "Booking_Count", label: "Booking count" }
                            ]}
                            rows={data.aboveAverageBookings}
                        />

                        <h4 style={{ marginTop: 20 }}>Passengers with more than one booking</h4>
                        <DataTable
                            columns={[
                                { key: "Passenger_ID", label: "Passenger ID" },
                                { key: "First_Name", label: "First name" },
                                { key: "Last_Name", label: "Last name" },
                                { key: "Booking_Count", label: "Bookings" }
                            ]}
                            rows={data.repeatPassengers}
                        />

                        <h4 style={{ marginTop: 20 }}>Flights without delay records — NOT EXISTS</h4>
                        <DataTable
                            columns={[
                                { key: "Flight_ID", label: "Flight ID" },
                                { key: "Flight_Number", label: "Flight" }
                            ]}
                            rows={data.flightsWithoutDelays}
                        />
                    </section>

                    {/* UPDATE TRIGGER */}
                    <section style={{ marginTop: 28 }}>
                        <h3>3. AFTER UPDATE trigger — TRG_FLIGHT_STATUS_AFTER_UPDATE</h3>
                        <p className="muted">
                            Change a flight status. MySQL automatically inserts OLD.Status and
                            NEW.Status into FLIGHT_STATUS_AUDIT.
                        </p>

                        {isAdmin ? (
                            <form onSubmit={updateFlightStatus} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                <select value={flightId} onChange={(e) => setFlightId(e.target.value)} style={fieldStyle} required>
                                    {data.flights.map((flight) => (
                                        <option key={flight.Flight_ID} value={flight.Flight_ID}>
                                            {flight.Flight_Number} — {flight.Status}
                                        </option>
                                    ))}
                                </select>
                                <span className="muted">Current: {selectedFlight?.Status ?? "—"}</span>
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={fieldStyle}>
                                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                                <button type="submit" disabled={busy || !flightId}>Update status</button>
                            </form>
                        ) : (
                            <p className="muted">Admin access is required to update flight status.</p>
                        )}

                        {triggerResult && (
                            <div className="notice" style={{ marginTop: 12 }}>
                                <strong>Trigger fired successfully.</strong>
                                {" "}Flight {triggerResult.Flight_ID}: {triggerResult.Old_Status} → {triggerResult.New_Status}
                                {" "}· Audit ID: {triggerResult.Status_Audit_ID}
                            </div>
                        )}

                        <h4 style={{ marginTop: 18 }}>Flight status audit history</h4>
                        <DataTable
                            columns={[
                                { key: "Status_Audit_ID", label: "Audit ID" },
                                { key: "Flight_ID", label: "Flight ID" },
                                { key: "Old_Status", label: "Old status" },
                                { key: "New_Status", label: "New status" },
                                { key: "Changed_At", label: "Changed at" }
                            ]}
                            rows={data.statusAudit}
                        />
                    </section>

                    {/* STORED PROCEDURE */}
                    <section style={{ marginTop: 28 }}>
                        <h3>4. Stored procedure — SP_GET_FLIGHT_SUMMARY</h3>
                        <p className="muted">
                            Calls the stored procedure with a selected Flight_ID and displays
                            its returned flight summary.
                        </p>
                        <form onSubmit={callProcedure} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            <select value={procedureFlightId} onChange={(e) => setProcedureFlightId(e.target.value)} style={fieldStyle}>
                                {data.flights.map((flight) => (
                                    <option key={flight.Flight_ID} value={flight.Flight_ID}>
                                        {flight.Flight_Number} (ID {flight.Flight_ID})
                                    </option>
                                ))}
                            </select>
                            <button type="submit" disabled={busy}>Call stored procedure</button>
                        </form>
                        {procedureResult && (
                            <div style={{ marginTop: 14 }}>
                                <DataTable
                                    columns={[
                                        { key: "Flight_ID", label: "Flight ID" },
                                        { key: "Flight_Number", label: "Flight" },
                                        { key: "Status", label: "Status" },
                                        { key: "Passenger_Count", label: "Passengers" }
                                    ]}
                                    rows={procedureResult}
                                    emptyText="The procedure returned no flight for this ID."
                                />
                            </div>
                        )}
                    </section>

                    {/* TRANSACTION */}
                    <section style={{ marginTop: 28 }}>
                        <h3>5. Transaction — START TRANSACTION / COMMIT / ROLLBACK</h3>
                        <p className="muted">
                            MySQL updates the equipment inside a transaction, reads the temporary
                            value, and then either commits or rolls back. The final value is shown
                            after the transaction ends.
                        </p>
                        {isAdmin ? (
                            <>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                    <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} style={fieldStyle}>
                                        {data.equipment.map((item) => (
                                            <option key={item.Equipment_ID} value={item.Equipment_ID}>
                                                {item.Equipment_Name} (ID {item.Equipment_ID})
                                            </option>
                                        ))}
                                    </select>
                                    <span className="muted">Current: {selectedEquipment?.Status ?? "—"}</span>
                                    <select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)} style={fieldStyle}>
                                        <option value="In Use">In Use</option>
                                        <option value="Available">Available</option>
                                    </select>
                                </div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                                    <button type="button" disabled={busy || !equipmentId} onClick={() => runTransaction("COMMIT")}>
                                        Run transaction & Commit
                                    </button>
                                    <button type="button" className="danger" disabled={busy || !equipmentId} onClick={() => runTransaction("ROLLBACK")}>
                                        Run transaction & Rollback
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="muted">Admin access is required to run the transaction demonstration.</p>
                        )}

                        {transactionResult && (
                            <div className="notice" style={{ marginTop: 14 }}>
                                <p><strong>Before:</strong> {transactionResult.before.Equipment_Name} — {transactionResult.before.Status}</p>
                                <p><strong>Inside transaction:</strong> {transactionResult.insideTransaction.Status}</p>
                                <p><strong>After {transactionResult.decision}:</strong> {transactionResult.final.Status}</p>
                                <strong>{transactionResult.message}</strong>
                            </div>
                        )}
                    </section>

                    {/* INDEXES */}
                    <section style={{ marginTop: 28 }}>
                        <h3>6. Indexes used by the project</h3>
                        <p className="muted">
                            These indexes are created in airport_operation.sql to help MySQL
                            locate records used by common flight, gate, booking and delay queries.
                        </p>
                        <DataTable
                            columns={[
                                { key: "name", label: "Index name" },
                                { key: "table", label: "Table" },
                                { key: "columns", label: "Indexed columns" },
                                { key: "purpose", label: "Purpose" }
                            ]}
                            rows={[
                                { name: "IDX_FLIGHT_STATUS_DATE", table: "FLIGHT", columns: "Status, Flight_Date", purpose: "Filter flights by status and date" },
                                { name: "IDX_GATE_ASSIGNMENT_INTERVAL", table: "FLIGHT_GATE_ASSIGNMENT", columns: "Gate_ID, Assigned_From, Assigned_To", purpose: "Support gate interval lookups" },
                                { name: "IDX_BOOKING_FLIGHT", table: "BOOKING", columns: "Flight_ID", purpose: "Find bookings for a flight" },
                                { name: "IDX_DELAY_FLIGHT", table: "DELAY", columns: "Flight_ID", purpose: "Find delay records for a flight" }
                            ]}
                        />
                    </section>
                </>
            )}
        </section>
    );
}
