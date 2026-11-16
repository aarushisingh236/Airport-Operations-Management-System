
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runCypher } from "@/lib/neo4j";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Convert Neo4j values into values that can safely be sent as JSON.
function normalize(value) {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
        return value.map(normalize);
    }

    if (typeof value === "object") {
        // Neo4j Integer
        if (typeof value.toNumber === "function") {
            return value.toNumber();
        }

        // Neo4j Date, Time, DateTime and Duration values
        if (
            "year" in value &&
            "month" in value &&
            "day" in value &&
            typeof value.toString === "function"
        ) {
            return value.toString();
        }

        const result = {};
        for (const [key, item] of Object.entries(value)) {
            result[key] = normalize(item);
        }
        return result;
    }

    return value;
}

const queries = {
    // Q1: Detect overlapping gate assignments.
    q1: {
        title: "Gate conflict detection",
        cypher: `
            MATCH (f1:Flight)-[a1:ASSIGNED_TO]->(g:Gate)<-[a2:ASSIGNED_TO]-(f2:Flight)
            WHERE f1.id < f2.id
              AND a1.startAt < a2.endAt
              AND a2.startAt < a1.endAt
            RETURN
                g.number AS gate,
                f1.number AS flight_1,
                f2.number AS flight_2,
                toString(a1.startAt) AS flight_1_start,
                toString(a1.endAt) AS flight_1_end,
                toString(a2.startAt) AS flight_2_start,
                toString(a2.endAt) AS flight_2_end
            ORDER BY gate
        `,
        needsFlight: false
    },

    // Q2: Return the nodes and relationships around a selected flight.
    q2: {
        title: "Flight relationship neighbourhood",
        cypher: `
            MATCH path = (f:Flight {number: $flightNo})-[*1..3]-(n)
            WITH collect(path)[0..30] AS paths
            UNWIND paths AS p
            UNWIND nodes(p) AS node
            WITH paths, collect(DISTINCT node) AS allNodes
            UNWIND paths AS p
            UNWIND relationships(p) AS rel
            WITH allNodes, collect(DISTINCT rel) AS allRels
            RETURN
                [n IN allNodes | {
                    id: elementId(n),
                    labels: labels(n),
                    properties: properties(n)
                }] AS nodes,
                [r IN allRels | {
                    id: elementId(r),
                    type: type(r),
                    startNode: elementId(startNode(r)),
                    endNode: elementId(endNode(r)),
                    properties: properties(r)
                }] AS relationships
        `,
        needsFlight: true
    },

    // Q3: Crew roster for a selected flight.
    q3: {
        title: "Crew roster",
        cypher: `
            MATCH (c:Crew)-[r:CREWS]->(f:Flight {number: $flightNo})
            RETURN
                f.number AS flight,
                c.name AS crew,
                c.role AS crew_type,
                r.role AS assigned_role
            ORDER BY crew
        `,
        needsFlight: true
    },

    // Q4: Passengers, bookings and baggage for a selected flight.
    q4: {
        title: "Passengers and baggage",
        cypher: `
            MATCH (p:Passenger)-[:MADE]->(b:Booking)-[:FOR_FLIGHT]->(f:Flight {number: $flightNo})
            OPTIONAL MATCH (b)-[:HAS_BAGGAGE]->(bag:Baggage)
            RETURN
                f.number AS flight,
                p.name AS passenger,
                b.seat AS seat,
                b.status AS booking_status,
                bag.tag AS baggage_tag,
                bag.weight AS baggage_weight
            ORDER BY passenger
        `,
        needsFlight: true
    },

    // Q5: Delayed flights and affected passenger counts.
    q5: {
        title: "Delay impact analysis",
        cypher: `
            MATCH (f:Flight)-[d:DELAYED_BY]->(r:DelayReason)
            OPTIONAL MATCH (p:Passenger)-[:MADE]->(:Booking)-[:FOR_FLIGHT]->(f)
            RETURN
                f.number AS flight,
                f.status AS status,
                r.description AS reason,
                d.minutes AS delay_minutes,
                count(DISTINCT p) AS passengers_affected
            ORDER BY delay_minutes DESC
        `,
        needsFlight: false
    },

    // Q6: Aircraft shared by multiple flights.
    q6: {
        title: "Aircraft utilisation",
        cypher: `
            MATCH (f:Flight)-[:USES_AIRCRAFT]->(a:Aircraft)<-[:USES_AIRCRAFT]-(f2:Flight)
            WHERE f.id < f2.id
            RETURN
                a.reg AS aircraft,
                a.type AS aircraft_type,
                f.number AS flight_1,
                f2.number AS flight_2
            ORDER BY aircraft
        `,
        needsFlight: false
    },

    // Q7: Gate assignments grouped by airport.
    q7: {
        title: "Gate utilisation by airport",
        cypher: `
            MATCH (ap:Airport)-[:HAS_TERMINAL]->(:Terminal)-[:HAS_GATE]->(g:Gate)
            OPTIONAL MATCH (g)<-[:ASSIGNED_TO]-(f:Flight)
            RETURN
                ap.code AS airport,
                g.number AS gate,
                count(f) AS assignments
            ORDER BY airport, assignments DESC
        `,
        needsFlight: false
    }
};

export async function GET(request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Please log in to access Neo4j analytics." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const queryId = searchParams.get("query");
        const flightNo = searchParams.get("flightNo")?.trim();

        const selectedQuery = queries[queryId];

        if (!selectedQuery) {
            return NextResponse.json(
                { error: "Invalid Neo4j query selection." },
                { status: 400 }
            );
        }

        if (selectedQuery.needsFlight && !flightNo) {
            return NextResponse.json(
                { error: "Please provide a flight number." },
                { status: 400 }
            );
        }

        const params = selectedQuery.needsFlight
            ? { flightNo }
            : {};

        const records = await runCypher(
            selectedQuery.cypher,
            params
        );

        const data = records.map((record) => {
            const normalized = {};
            for (const [key, value] of Object.entries(record)) {
                normalized[key] = normalize(value);
            }
            return normalized;
        });

        return NextResponse.json({
            title: selectedQuery.title,
            queryId,
            data
        });
    } catch (error) {
        console.error("Neo4j analytics error:", error);

        return NextResponse.json(
            { error: "Unable to retrieve Neo4j analytics. Check the Neo4j connection and graph data." },
            { status: 500 }
        );
    }
}
