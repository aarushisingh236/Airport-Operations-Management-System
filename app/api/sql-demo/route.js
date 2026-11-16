import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getPool, query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_STATUSES = [
    "Scheduled",
    "Boarding",
    "Delayed",
    "Departed",
    "Arrived",
    "Cancelled"
];

export async function GET() {
    const access = await requireRole(["ADMIN", "OPERATOR"]);
    if (access.error) {
        return NextResponse.json({ error: access.error }, { status: access.status });
    }

    try {
        const [
            viewRows,
            aboveAverageBookings,
            repeatPassengers,
            flightsWithoutDelays,
            flights,
            statusAudit,
            equipment,
            operationAudit
        ] = await Promise.all([
            query(`
                SELECT *
                FROM V_FLIGHT_OPERATIONS_SUMMARY
                ORDER BY Flight_Date, Flight_ID
            `),
            query(`
                SELECT
                    f.Flight_ID,
                    f.Flight_Number,
                    (
                        SELECT COUNT(*)
                        FROM BOOKING b
                        WHERE b.Flight_ID = f.Flight_ID
                    ) AS Booking_Count
                FROM FLIGHT f
                WHERE (
                    SELECT COUNT(*)
                    FROM BOOKING b
                    WHERE b.Flight_ID = f.Flight_ID
                ) > (
                    SELECT AVG(x.booking_count)
                    FROM (
                        SELECT COUNT(*) AS booking_count
                        FROM BOOKING
                        GROUP BY Flight_ID
                    ) x
                )
                ORDER BY f.Flight_Number
            `),
            query(`
                SELECT
                    p.Passenger_ID,
                    p.First_Name,
                    p.Last_Name,
                    (
                        SELECT COUNT(*)
                        FROM BOOKING b
                        WHERE b.Passenger_ID = p.Passenger_ID
                    ) AS Booking_Count
                FROM PASSENGER p
                WHERE (
                    SELECT COUNT(*)
                    FROM BOOKING b
                    WHERE b.Passenger_ID = p.Passenger_ID
                ) > 1
                ORDER BY p.Passenger_ID
            `),
            query(`
                SELECT f.Flight_ID, f.Flight_Number
                FROM FLIGHT f
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM DELAY d
                    WHERE d.Flight_ID = f.Flight_ID
                )
                ORDER BY f.Flight_ID
            `),
            query(`
                SELECT Flight_ID, Flight_Number, Status
                FROM FLIGHT
                ORDER BY Flight_ID
            `),
            query(`
                SELECT Status_Audit_ID, Flight_ID, Old_Status, New_Status, Changed_At
                FROM FLIGHT_STATUS_AUDIT
                ORDER BY Changed_At DESC, Status_Audit_ID DESC
                LIMIT 20
            `),
            query(`
                SELECT Equipment_ID, Equipment_Name, Status, Location
                FROM EQUIPMENT
                ORDER BY Equipment_ID
            `),
            query(`
                SELECT Audit_ID, Operation_ID, Operation_Type, Flight_ID,
                       Old_Status, Deleted_At, Deleted_By
                FROM GROUND_OPERATION_AUDIT
                ORDER BY Audit_ID DESC
                LIMIT 10
            `)
        ]);

        return NextResponse.json({
            viewRows,
            aboveAverageBookings,
            repeatPassengers,
            flightsWithoutDelays,
            flights,
            statusAudit,
            equipment,
            operationAudit
        });
    } catch (error) {
        console.error("Advanced SQL GET error:", error);
        return NextResponse.json(
            { error: "Could not load SQL demonstration data. Check the MySQL setup and SQL objects." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const access = await requireRole(["ADMIN", "OPERATOR"]);
    if (access.error) {
        return NextResponse.json({ error: access.error }, { status: access.status });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { action } = body || {};

    try {
        if (action === "procedure") {
            const flightId = Number(body.flightId);
            if (!Number.isInteger(flightId) || flightId < 1) {
                return NextResponse.json({ error: "Choose a valid flight." }, { status: 400 });
            }

            const [resultSets] = await getPool().query(
                "CALL SP_GET_FLIGHT_SUMMARY(?)",
                [flightId]
            );
            const rows = Array.isArray(resultSets?.[0]) ? resultSets[0] : [];
            return NextResponse.json({ summary: rows });
        }

        if (action === "update-status") {
            if (access.session.role !== "ADMIN") {
                return NextResponse.json(
                    { error: "Only Admin can update flight status in this demonstration." },
                    { status: 403 }
                );
            }

            const flightId = Number(body.flightId);
            const status = String(body.status || "");
            if (!Number.isInteger(flightId) || flightId < 1 || !ALLOWED_STATUSES.includes(status)) {
                return NextResponse.json({ error: "Choose a valid flight and status." }, { status: 400 });
            }

            const currentRows = await query(
                "SELECT Flight_ID, Status FROM FLIGHT WHERE Flight_ID = ?",
                [flightId]
            );
            if (!currentRows.length) {
                return NextResponse.json({ error: "Flight not found." }, { status: 404 });
            }
            if (currentRows[0].Status === status) {
                return NextResponse.json(
                    { error: "The selected status is already set. Choose a different status to fire the trigger." },
                    { status: 400 }
                );
            }

            await query("UPDATE FLIGHT SET Status = ? WHERE Flight_ID = ?", [status, flightId]);

            const auditRows = await query(
                `SELECT Status_Audit_ID, Flight_ID, Old_Status, New_Status, Changed_At
                 FROM FLIGHT_STATUS_AUDIT
                 WHERE Flight_ID = ?
                 ORDER BY Changed_At DESC, Status_Audit_ID DESC
                 LIMIT 1`,
                [flightId]
            );

            return NextResponse.json({
                message: "Flight updated. MySQL AFTER UPDATE trigger inserted the audit record.",
                audit: auditRows[0] || null
            });
        }

        if (action === "transaction") {
            if (access.session.role !== "ADMIN") {
                return NextResponse.json(
                    { error: "Only Admin can run the transaction demonstration." },
                    { status: 403 }
                );
            }

            const equipmentId = Number(body.equipmentId);
            const targetStatus = String(body.targetStatus || "");
            const decision = String(body.decision || "");

            if (!Number.isInteger(equipmentId) || equipmentId < 1) {
                return NextResponse.json({ error: "Choose valid equipment." }, { status: 400 });
            }
            if (!["Available", "In Use"].includes(targetStatus)) {
                return NextResponse.json({ error: "Choose Available or In Use." }, { status: 400 });
            }
            if (!["COMMIT", "ROLLBACK"].includes(decision)) {
                return NextResponse.json({ error: "Choose Commit or Rollback." }, { status: 400 });
            }

            const connection = await getPool().getConnection();
            try {
                await connection.beginTransaction();

                const [beforeRows] = await connection.execute(
                    "SELECT Equipment_ID, Equipment_Name, Status FROM EQUIPMENT WHERE Equipment_ID = ? FOR UPDATE",
                    [equipmentId]
                );
                if (!beforeRows.length) {
                    await connection.rollback();
                    return NextResponse.json({ error: "Equipment not found." }, { status: 404 });
                }

                const before = beforeRows[0];

                await connection.execute(
                    "UPDATE EQUIPMENT SET Status = ? WHERE Equipment_ID = ?",
                    [targetStatus, equipmentId]
                );

                const [insideRows] = await connection.execute(
                    "SELECT Equipment_ID, Equipment_Name, Status FROM EQUIPMENT WHERE Equipment_ID = ?",
                    [equipmentId]
                );
                const insideTransaction = insideRows[0];

                if (decision === "COMMIT") {
                    await connection.commit();
                } else {
                    await connection.rollback();
                }

                const [afterRows] = await connection.execute(
                    "SELECT Equipment_ID, Equipment_Name, Status FROM EQUIPMENT WHERE Equipment_ID = ?",
                    [equipmentId]
                );

                return NextResponse.json({
                    decision,
                    before,
                    insideTransaction,
                    final: afterRows[0],
                    message: decision === "COMMIT"
                        ? "COMMIT completed. The equipment status change is permanent."
                        : "ROLLBACK completed. The equipment status change was undone."
                });
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        return NextResponse.json({ error: "Unknown SQL demonstration action." }, { status: 400 });
    } catch (error) {
        console.error("Advanced SQL POST error:", error);
        return NextResponse.json(
            { error: error.message || "The SQL demonstration failed." },
            { status: 500 }
        );
    }
}
