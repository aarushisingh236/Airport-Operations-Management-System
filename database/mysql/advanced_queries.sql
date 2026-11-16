USE Airport_operation;


-- =====================================================
-- 1. CORRELATED SUBQUERY
-- Flights with more bookings than the average bookings
-- per flight.
-- =====================================================

SELECT
    f.Flight_Number,
    (
        SELECT COUNT(*)
        FROM BOOKING b
        WHERE b.Flight_ID = f.Flight_ID
    ) AS Booking_Count
FROM FLIGHT f
WHERE
    (
        SELECT COUNT(*)
        FROM BOOKING b
        WHERE b.Flight_ID = f.Flight_ID
    ) >
    (
        SELECT AVG(x.booking_count)
        FROM (
            SELECT COUNT(*) AS booking_count
            FROM BOOKING
            GROUP BY Flight_ID
        ) x
    );


-- =====================================================
-- 2. CORRELATED SUBQUERY
-- Passengers who have made more than one booking.
-- =====================================================

SELECT
    p.Passenger_ID,
    p.First_Name,
    p.Last_Name
FROM PASSENGER p
WHERE (
    SELECT COUNT(*)
    FROM BOOKING b
    WHERE b.Passenger_ID = p.Passenger_ID
) > 1;


-- =====================================================
-- 3. CORRELATED NOT EXISTS
-- Flights without any delay records.
-- =====================================================

SELECT
    f.Flight_ID,
    f.Flight_Number
FROM FLIGHT f
WHERE NOT EXISTS (
    SELECT 1
    FROM DELAY d
    WHERE d.Flight_ID = f.Flight_ID
);


-- =====================================================
-- 4. VIEW
-- Display the flight operations summary.
-- =====================================================

SELECT *
FROM V_FLIGHT_OPERATIONS_SUMMARY;


-- =====================================================
-- 5. STORED PROCEDURE
-- Get the summary for Flight_ID = 1.
-- =====================================================

CALL SP_GET_FLIGHT_SUMMARY(1);


-- =====================================================
-- 6. UPDATE TRIGGER TEST
-- Change Flight 2 status and inspect the audit table.
-- The trigger records the old and new status.
-- =====================================================

UPDATE FLIGHT
SET Status = 'Boarding'
WHERE Flight_ID = 2;

SELECT *
FROM FLIGHT_STATUS_AUDIT
ORDER BY Changed_At DESC;


-- =====================================================
-- 7. TRANSACTION TEST
-- Update equipment status, inspect it, then roll back.
-- The final SELECT should show the original status.
-- =====================================================

START TRANSACTION;

UPDATE EQUIPMENT
SET Status = 'In Use'
WHERE Equipment_ID = 1;

SELECT *
FROM EQUIPMENT
WHERE Equipment_ID = 1;

ROLLBACK;

SELECT *
FROM EQUIPMENT
WHERE Equipment_ID = 1;