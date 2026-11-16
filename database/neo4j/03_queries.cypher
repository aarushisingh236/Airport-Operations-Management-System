
// Airport Operations Management System
// 03 - Neo4j demonstration queries
// Run ONE query at a time.


// Q1. Detect overlapping gate assignments.
// Expected: AI101 and 6E202 conflict at gate A1.

MATCH (f1:Flight)-[a1:ASSIGNED_TO]->(g:Gate)
      <-[a2:ASSIGNED_TO]-(f2:Flight)
WHERE f1.id < f2.id
  AND a1.startAt < a2.endAt
  AND a2.startAt < a1.endAt
RETURN
    g.number AS gate,
    f1.number AS flight_1,
    f2.number AS flight_2,
    a1.startAt AS flight_1_start,
    a1.endAt AS flight_1_end,
    a2.startAt AS flight_2_start,
    a2.endAt AS flight_2_end;


// Q2. Relationship neighbourhood of AI101.
// Switch the result to Graph view.

MATCH path = (f:Flight {number: 'AI101'})-[*1..3]-(n)
RETURN path;


// Q3. Crew roster for AI101.

MATCH (c:Crew)-[r:CREWS]->(f:Flight {number: 'AI101'})
RETURN
    c.name AS crew,
    c.role AS crew_type,
    r.role AS assigned_role;


// Q4. Passengers, bookings and baggage for AI101.

MATCH (p:Passenger)-[:MADE]->(b:Booking)
      -[:FOR_FLIGHT]->(f:Flight {number: 'AI101'})
OPTIONAL MATCH (b)-[:HAS_BAGGAGE]->(bag:Baggage)
RETURN
    p.name AS passenger,
    b.seat AS seat,
    b.status AS booking_status,
    bag.tag AS baggage_tag,
    bag.weight AS baggage_weight;


// Q5. Delay impact analysis.
// Counts distinct passengers affected by a delayed flight.

MATCH (f:Flight)-[d:DELAYED_BY]->(r:DelayReason)
OPTIONAL MATCH (p:Passenger)-[:MADE]->(:Booking)
      -[:FOR_FLIGHT]->(f)
RETURN
    f.number AS flight,
    r.description AS reason,
    d.minutes AS delay_minutes,
    count(DISTINCT p) AS passengers_affected;


// Q6. Aircraft used by multiple flights.

MATCH (f:Flight)-[:USES_AIRCRAFT]->(a:Aircraft)
      <-[:USES_AIRCRAFT]-(f2:Flight)
WHERE f.id < f2.id
RETURN
    a.reg AS aircraft,
    a.type AS aircraft_type,
    f.number AS flight_1,
    f2.number AS flight_2;


// Q7. Gate assignments by airport.

MATCH (ap:Airport)-[:HAS_TERMINAL]->(:Terminal)
      -[:HAS_GATE]->(g:Gate)
OPTIONAL MATCH (g)<-[:ASSIGNED_TO]-(f:Flight)
RETURN
    ap.code AS airport,
    g.number AS gate,
    count(f) AS assignments
ORDER BY assignments DESC;