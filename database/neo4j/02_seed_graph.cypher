
// Airport Operations Management System
// 02 - Neo4j graph database seed
// Idempotent seed: safe to run more than once.

// STEP 1: Remove leftover unlabeled nodes from earlier attempts.
// This project expects every node to have a label.

MATCH (n)
WHERE size(labels(n)) = 0
DETACH DELETE n;


// STEP 2: CREATE AIRPORTS

MERGE (blr:Airport {id: 1})
SET blr.code = 'BLR',
    blr.name = 'Kempegowda International',
    blr.city = 'Bengaluru',
    blr.country = 'India';

MERGE (del:Airport {id: 2})
SET del.code = 'DEL',
    del.name = 'Indira Gandhi International',
    del.city = 'Delhi',
    del.country = 'India';

MERGE (bom:Airport {id: 3})
SET bom.code = 'BOM',
    bom.name = 'Chhatrapati Shivaji Maharaj International',
    bom.city = 'Mumbai',
    bom.country = 'India';


// STEP 3: CREATE TERMINALS

MERGE (t1:Terminal {id: 1})
SET t1.name = 'T1';

MERGE (t2:Terminal {id: 2})
SET t2.name = 'T2';


// STEP 4: CREATE GATES

MERGE (g1:Gate {id: 1})
SET g1.number = 'A1',
    g1.type = 'Domestic';

MERGE (g2:Gate {id: 2})
SET g2.number = 'A2',
    g2.type = 'Domestic';

MERGE (g3:Gate {id: 3})
SET g3.number = 'B1',
    g3.type = 'International';


// STEP 5: CREATE AIRLINES

MERGE (ai:Airline {code: 'AI'})
SET ai.name = 'Air India';

MERGE (indigo:Airline {code: '6E'})
SET indigo.name = 'IndiGo';


// STEP 6: CREATE AIRCRAFT

MERGE (ac1:Aircraft {id: 1})
SET ac1.reg = 'VT-ABC',
    ac1.type = 'A320';

MERGE (ac2:Aircraft {id: 2})
SET ac2.reg = 'VT-XYZ',
    ac2.type = 'B737';


// STEP 7: CREATE FLIGHTS

MERGE (f1:Flight {id: 1})
SET f1.number = 'AI101',
    f1.status = 'Delayed';

MERGE (f2:Flight {id: 2})
SET f2.number = '6E202',
    f2.status = 'Scheduled';

MERGE (f3:Flight {id: 3})
SET f3.number = 'AI303',
    f3.status = 'Scheduled';


// STEP 8: CREATE CREW

MERGE (c1:Crew {id: 1})
SET c1.name = 'Ravi Kumar',
    c1.role = 'Pilot';

MERGE (c2:Crew {id: 2})
SET c2.name = 'Meera Nair',
    c2.role = 'Cabin Crew';


// STEP 9: CREATE PASSENGERS

MERGE (p1:Passenger {id: 1})
SET p1.name = 'Anita Rao';

MERGE (p2:Passenger {id: 2})
SET p2.name = 'John Mathew';


// STEP 10: CREATE BOOKINGS

MERGE (b1:Booking {id: 1})
SET b1.seat = '12A',
    b1.status = 'Confirmed';

MERGE (b2:Booking {id: 2})
SET b2.seat = '12B',
    b2.status = 'Confirmed';

MERGE (b3:Booking {id: 3})
SET b3.seat = '7C',
    b3.status = 'Confirmed';


// STEP 11: CREATE BAGGAGE

MERGE (bag1:Baggage {id: 1})
SET bag1.tag = 'TAG1001',
    bag1.weight = 18.5;

MERGE (bag2:Baggage {id: 2})
SET bag2.tag = 'TAG1002',
    bag2.weight = 22.0;


// STEP 12: CREATE DELAY REASON

MERGE (reason:DelayReason {id: 1})
SET reason.description = 'Weather';


// STEP 13: CREATE AIRPORT-TERMINAL RELATIONSHIPS

MATCH (blr:Airport {id: 1}),
      (t1:Terminal {id: 1})
MERGE (blr)-[:HAS_TERMINAL]->(t1);

MATCH (blr:Airport {id: 1}),
      (t2:Terminal {id: 2})
MERGE (blr)-[:HAS_TERMINAL]->(t2);


// STEP 14: CREATE TERMINAL-GATE RELATIONSHIPS

MATCH (t1:Terminal {id: 1}),
      (g1:Gate {id: 1})
MERGE (t1)-[:HAS_GATE]->(g1);

MATCH (t1:Terminal {id: 1}),
      (g2:Gate {id: 2})
MERGE (t1)-[:HAS_GATE]->(g2);

MATCH (t2:Terminal {id: 2}),
      (g3:Gate {id: 3})
MERGE (t2)-[:HAS_GATE]->(g3);


// STEP 15: AIRLINE-FLIGHT RELATIONSHIPS

MATCH (ai:Airline {code: 'AI'}),
      (f1:Flight {id: 1})
MERGE (ai)-[:OPERATES]->(f1);

MATCH (indigo:Airline {code: '6E'}),
      (f2:Flight {id: 2})
MERGE (indigo)-[:OPERATES]->(f2);

MATCH (ai:Airline {code: 'AI'}),
      (f3:Flight {id: 3})
MERGE (ai)-[:OPERATES]->(f3);


// STEP 16: FLIGHT-AIRCRAFT RELATIONSHIPS

MATCH (f1:Flight {id: 1}),
      (ac1:Aircraft {id: 1})
MERGE (f1)-[:USES_AIRCRAFT]->(ac1);

MATCH (f2:Flight {id: 2}),
      (ac2:Aircraft {id: 2})
MERGE (f2)-[:USES_AIRCRAFT]->(ac2);

MATCH (f3:Flight {id: 3}),
      (ac1:Aircraft {id: 1})
MERGE (f3)-[:USES_AIRCRAFT]->(ac1);


// STEP 17: FLIGHT-DEPARTURE AND ARRIVAL RELATIONSHIPS

MATCH (f1:Flight {id: 1}),
      (blr:Airport {id: 1}),
      (del:Airport {id: 2})
MERGE (f1)-[:DEPARTS_FROM]->(blr)
MERGE (f1)-[:ARRIVES_AT]->(del);

MATCH (f2:Flight {id: 2}),
      (blr:Airport {id: 1}),
      (bom:Airport {id: 3})
MERGE (f2)-[:DEPARTS_FROM]->(blr)
MERGE (f2)-[:ARRIVES_AT]->(bom);

MATCH (f3:Flight {id: 3}),
      (del:Airport {id: 2}),
      (blr:Airport {id: 1})
MERGE (f3)-[:DEPARTS_FROM]->(del)
MERGE (f3)-[:ARRIVES_AT]->(blr);


// STEP 18: FLIGHT-GATE ASSIGNMENTS

MATCH (f1:Flight {id: 1}),
      (g1:Gate {id: 1})
MERGE (f1)-[a1:ASSIGNED_TO]->(g1)
SET a1.startAt = datetime('2026-11-02T07:00:00'),
    a1.endAt = datetime('2026-11-02T08:40:00');

MATCH (f2:Flight {id: 2}),
      (g1:Gate {id: 1})
MERGE (f2)-[a2:ASSIGNED_TO]->(g1)
SET a2.startAt = datetime('2026-11-02T08:00:00'),
    a2.endAt = datetime('2026-11-02T09:00:00');

MATCH (f3:Flight {id: 3}),
      (g2:Gate {id: 2})
MERGE (f3)-[a3:ASSIGNED_TO]->(g2)
SET a3.startAt = datetime('2026-11-02T13:00:00'),
    a3.endAt = datetime('2026-11-02T14:00:00');


// STEP 19: CREW-FLIGHT RELATIONSHIPS

MATCH (c1:Crew {id: 1}),
      (f1:Flight {id: 1})
MERGE (c1)-[r1:CREWS]->(f1)
SET r1.role = 'Captain';

MATCH (c2:Crew {id: 2}),
      (f1:Flight {id: 1})
MERGE (c2)-[r2:CREWS]->(f1)
SET r2.role = 'Purser';

MATCH (c1:Crew {id: 1}),
      (f2:Flight {id: 2})
MERGE (c1)-[r3:CREWS]->(f2)
SET r3.role = 'Captain';


// STEP 20: PASSENGER-BOOKING-FLIGHT RELATIONSHIPS

MATCH (p1:Passenger {id: 1}),
      (b1:Booking {id: 1}),
      (f1:Flight {id: 1})
MERGE (p1)-[:MADE]->(b1)
MERGE (b1)-[:FOR_FLIGHT]->(f1);

MATCH (p2:Passenger {id: 2}),
      (b2:Booking {id: 2}),
      (f1:Flight {id: 1})
MERGE (p2)-[:MADE]->(b2)
MERGE (b2)-[:FOR_FLIGHT]->(f1);

MATCH (p1:Passenger {id: 1}),
      (b3:Booking {id: 3}),
      (f3:Flight {id: 3})
MERGE (p1)-[:MADE]->(b3)
MERGE (b3)-[:FOR_FLIGHT]->(f3);


// STEP 21: BOOKING-BAGGAGE RELATIONSHIPS

MATCH (b1:Booking {id: 1}),
      (bag1:Baggage {id: 1})
MERGE (b1)-[:HAS_BAGGAGE]->(bag1);

MATCH (b2:Booking {id: 2}),
      (bag2:Baggage {id: 2})
MERGE (b2)-[:HAS_BAGGAGE]->(bag2);


// STEP 22: FLIGHT-DELAY RELATIONSHIP

MATCH (f1:Flight {id: 1}),
      (reason:DelayReason {id: 1})
MERGE (f1)-[d:DELAYED_BY]->(reason)
SET d.minutes = 40;


// END OF SEED SCRIPT
