-- AIRPORT OPERATIONS MANAGEMENT SYSTEM
-- MySQL 8.x
-- WARNING: This script drops and recreates Airport_operation.

DROP DATABASE IF EXISTS Airport_operation;

CREATE DATABASE Airport_operation
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE Airport_operation;


-- =====================================================
-- 1. CORE TABLES
-- =====================================================

CREATE TABLE AIRPORT (
    Airport_ID INT PRIMARY KEY,
    Airport_Code VARCHAR(10) NOT NULL UNIQUE,
    Airport_Name VARCHAR(120) NOT NULL,
    City VARCHAR(80) NOT NULL,
    Country VARCHAR(80) NOT NULL
);

CREATE TABLE AIRLINE (
    Airline_Code VARCHAR(10) PRIMARY KEY,
    Airline_Name VARCHAR(100) NOT NULL,
    Contact_No VARCHAR(25)
);

CREATE TABLE AIRCRAFT (
    Aircraft_ID INT PRIMARY KEY,
    Registration_No VARCHAR(20) NOT NULL UNIQUE,
    Aircraft_Type VARCHAR(40) NOT NULL,
    Manufacturer VARCHAR(60),
    Capacity INT NOT NULL CHECK (Capacity > 0),
    Status VARCHAR(20) NOT NULL
);

CREATE TABLE TERMINAL (
    Terminal_ID INT PRIMARY KEY,
    Terminal_Name VARCHAR(30) NOT NULL,
    Location VARCHAR(100),
    Airport_ID INT NOT NULL,
    FOREIGN KEY (Airport_ID) REFERENCES AIRPORT(Airport_ID)
);

CREATE TABLE GATE (
    Gate_ID INT PRIMARY KEY,
    Gate_Number VARCHAR(15) NOT NULL,
    Gate_Type VARCHAR(30),
    Status VARCHAR(20) NOT NULL,
    Terminal_ID INT NOT NULL,
    FOREIGN KEY (Terminal_ID) REFERENCES TERMINAL(Terminal_ID),
    UNIQUE (Terminal_ID, Gate_Number)
);

CREATE TABLE FLIGHT (
    Flight_ID INT PRIMARY KEY,
    Flight_Number VARCHAR(20) NOT NULL,
    Flight_Date DATE NOT NULL,
    Airline_Code VARCHAR(10) NOT NULL,
    Aircraft_ID INT NOT NULL,
    Dep_Airport_ID INT NOT NULL,
    Arr_Airport_ID INT NOT NULL,
    Scheduled_Dep_Time DATETIME NOT NULL,
    Scheduled_Arr_Time DATETIME NOT NULL,
    Actual_Dep_Time DATETIME NULL,
    Actual_Arr_Time DATETIME NULL,
    Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Airline_Code) REFERENCES AIRLINE(Airline_Code),
    FOREIGN KEY (Aircraft_ID) REFERENCES AIRCRAFT(Aircraft_ID),
    FOREIGN KEY (Dep_Airport_ID) REFERENCES AIRPORT(Airport_ID),
    FOREIGN KEY (Arr_Airport_ID) REFERENCES AIRPORT(Airport_ID)
);

CREATE TABLE FLIGHT_GATE_ASSIGNMENT (
    Assignment_ID INT PRIMARY KEY,
    Flight_ID INT NOT NULL,
    Gate_ID INT NOT NULL,
    Assigned_From DATETIME NOT NULL,
    Assigned_To DATETIME NOT NULL,
    Assignment_Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Flight_ID) REFERENCES FLIGHT(Flight_ID),
    FOREIGN KEY (Gate_ID) REFERENCES GATE(Gate_ID),
    CHECK (Assigned_To > Assigned_From)
);

CREATE TABLE CREW (
    Crew_ID INT PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Role VARCHAR(40) NOT NULL,
    License_No VARCHAR(30) UNIQUE,
    Contact_No VARCHAR(25)
);

CREATE TABLE FLIGHT_CREW (
    Flight_ID INT NOT NULL,
    Crew_ID INT NOT NULL,
    Assigned_Role VARCHAR(40) NOT NULL,
    Check_In_Time DATETIME,
    PRIMARY KEY (Flight_ID, Crew_ID),
    FOREIGN KEY (Flight_ID) REFERENCES FLIGHT(Flight_ID),
    FOREIGN KEY (Crew_ID) REFERENCES CREW(Crew_ID)
);

CREATE TABLE PASSENGER (
    Passenger_ID INT PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Date_Of_Birth DATE,
    Gender CHAR(1),
    Passport_No VARCHAR(30) UNIQUE,
    Nationality VARCHAR(50),
    Contact_No VARCHAR(25)
);

CREATE TABLE BOOKING (
    Booking_ID INT PRIMARY KEY,
    Passenger_ID INT NOT NULL,
    Flight_ID INT NOT NULL,
    Seat_Number VARCHAR(10),
    Booking_Date DATETIME NOT NULL,
    Booking_Status VARCHAR(20) NOT NULL,
    Check_In_Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Passenger_ID) REFERENCES PASSENGER(Passenger_ID),
    FOREIGN KEY (Flight_ID) REFERENCES FLIGHT(Flight_ID),
    UNIQUE (Flight_ID, Seat_Number)
);

CREATE TABLE BAGGAGE (
    Baggage_ID INT PRIMARY KEY,
    Tag_Number VARCHAR(30) NOT NULL UNIQUE,
    Weight DECIMAL(6,2) NOT NULL CHECK (Weight > 0),
    Baggage_Status VARCHAR(25) NOT NULL,
    Booking_ID INT NOT NULL,
    FOREIGN KEY (Booking_ID) REFERENCES BOOKING(Booking_ID)
);

CREATE TABLE GROUND_OPERATION (
    Operation_ID INT PRIMARY KEY,
    Flight_ID INT NOT NULL,
    Operation_Type VARCHAR(50) NOT NULL,
    Description VARCHAR(255),
    Scheduled_Start DATETIME,
    Scheduled_End DATETIME,
    Actual_Start DATETIME,
    Actual_End DATETIME,
    Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Flight_ID) REFERENCES FLIGHT(Flight_ID)
);

CREATE TABLE EQUIPMENT (
    Equipment_ID INT PRIMARY KEY,
    Equipment_Name VARCHAR(80) NOT NULL,
    Equipment_Type VARCHAR(50),
    Status VARCHAR(20) NOT NULL,
    Location VARCHAR(100)
);

CREATE TABLE EQUIPMENT_ASSIGNMENT (
    Operation_ID INT NOT NULL,
    Equipment_ID INT NOT NULL,
    Assigned_From DATETIME,
    Assigned_To DATETIME,
    Status VARCHAR(20),
    PRIMARY KEY (Operation_ID, Equipment_ID),
    FOREIGN KEY (Operation_ID)
        REFERENCES GROUND_OPERATION(Operation_ID)
        ON DELETE CASCADE,
    FOREIGN KEY (Equipment_ID)
        REFERENCES EQUIPMENT(Equipment_ID)
);

CREATE TABLE STAFF (
    Staff_ID INT PRIMARY KEY,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Staff_Type VARCHAR(50) NOT NULL,
    Contact_No VARCHAR(25)
);

CREATE TABLE OPERATION_STAFF_ASSIGNMENT (
    Operation_ID INT NOT NULL,
    Staff_ID INT NOT NULL,
    Assigned_Role VARCHAR(50),
    Assigned_From DATETIME,
    Assigned_To DATETIME,
    PRIMARY KEY (Operation_ID, Staff_ID),
    FOREIGN KEY (Operation_ID)
        REFERENCES GROUND_OPERATION(Operation_ID)
        ON DELETE CASCADE,
    FOREIGN KEY (Staff_ID)
        REFERENCES STAFF(Staff_ID)
);

CREATE TABLE WEATHER (
    Weather_ID INT PRIMARY KEY,
    Airport_ID INT NOT NULL,
    Date_Time DATETIME NOT NULL,
    Weather_Condition VARCHAR(60),
    Visibility DECIMAL(6,2),
    Wind_Speed DECIMAL(6,2),
    FOREIGN KEY (Airport_ID) REFERENCES AIRPORT(Airport_ID)
);

CREATE TABLE NOTIFICATION (
    Notification_ID INT PRIMARY KEY,
    Passenger_ID INT NOT NULL,
    Flight_ID INT NOT NULL,
    Message VARCHAR(500) NOT NULL,
    Sent_Time DATETIME NOT NULL,
    Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (Passenger_ID) REFERENCES PASSENGER(Passenger_ID),
    FOREIGN KEY (Flight_ID) REFERENCES FLIGHT(Flight_ID)
);

CREATE TABLE DELAY_REASON (
    Reason_ID INT PRIMARY KEY,
    Reason_Description VARCHAR(120) NOT NULL
);

CREATE TABLE DELAY (
    Delay_ID INT PRIMARY KEY,
    Flight_ID INT NOT NULL,
    Reason_ID INT NOT NULL,
    Delay_Minutes INT NOT NULL CHECK (Delay_Minutes >= 0),
    Recorded_At DATETIME NOT NULL,
    Description VARCHAR(255),
    FOREIGN KEY (Flight_ID) REFERENCES FLIGHT(Flight_ID),
    FOREIGN KEY (Reason_ID) REFERENCES DELAY_REASON(Reason_ID)
);


-- =====================================================
-- 2. AUTHENTICATION AND AUDIT TABLES
-- =====================================================

CREATE TABLE USER_ACCOUNT (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(40) NOT NULL UNIQUE,
    Password_Hash CHAR(64) NOT NULL,
    Role ENUM('ADMIN', 'OPERATOR') NOT NULL,
    Is_Active BOOLEAN NOT NULL DEFAULT TRUE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE GROUND_OPERATION_AUDIT (
    Audit_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Operation_ID INT NOT NULL,
    Operation_Type VARCHAR(50) NOT NULL,
    Flight_ID INT NOT NULL,
    Old_Status VARCHAR(20),
    Deleted_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Deleted_By VARCHAR(80) NOT NULL
);

CREATE TABLE FLIGHT_STATUS_AUDIT (
    Status_Audit_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Flight_ID INT NOT NULL,
    Old_Status VARCHAR(20),
    New_Status VARCHAR(20),
    Changed_At TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 3. DEMO USERS
-- =====================================================

INSERT INTO USER_ACCOUNT
    (Username, Password_Hash, Role)
VALUES
    ('admin', SHA2('Admin@123', 256), 'ADMIN'),
    ('operator', SHA2('Operator@123', 256), 'OPERATOR');


-- =====================================================
-- 4. SAMPLE DATA
-- =====================================================

INSERT INTO AIRPORT VALUES
(1, 'BLR', 'Kempegowda International', 'Bengaluru', 'India'),
(2, 'DEL', 'Indira Gandhi International', 'Delhi', 'India'),
(3, 'BOM', 'Chhatrapati Shivaji Maharaj International', 'Mumbai', 'India');

INSERT INTO TERMINAL VALUES
(1, 'T1', 'North Wing', 1),
(2, 'T2', 'South Wing', 1);

INSERT INTO GATE VALUES
(1, 'A1', 'Domestic', 'Occupied', 1),
(2, 'A2', 'Domestic', 'Available', 1),
(3, 'B1', 'International', 'Available', 2);

INSERT INTO AIRLINE VALUES
('AI', 'Air India', '1800-180-1407'),
('6E', 'IndiGo', '0124-6173838');

INSERT INTO AIRCRAFT VALUES
(1, 'VT-ABC', 'A320', 'Airbus', 180, 'Active'),
(2, 'VT-XYZ', 'B737', 'Boeing', 160, 'Active');

INSERT INTO FLIGHT VALUES
(1, 'AI101', '2026-11-20', 'AI', 1, 1, 2,
 '2026-11-20 08:00:00', '2026-11-20 10:45:00',
 '2026-11-20 08:40:00', '2026-11-20 11:20:00', 'Delayed'),

(2, '6E202', '2026-11-20', '6E', 2, 1, 3,
 '2026-11-20 08:30:00', '2026-11-20 10:30:00',
 NULL, NULL, 'Scheduled'),

(3, 'AI303', '2026-11-20', 'AI', 1, 2, 1,
 '2026-11-20 14:00:00', '2026-11-20 16:40:00',
 NULL, NULL, 'Scheduled');

INSERT INTO FLIGHT_GATE_ASSIGNMENT VALUES
(1, 1, 1, '2026-11-20 07:00:00', '2026-11-20 08:40:00', 'Active'),
(2, 2, 1, '2026-11-20 08:00:00', '2026-11-20 09:00:00', 'Active'),
(3, 3, 2, '2026-11-20 13:00:00', '2026-11-20 14:00:00', 'Scheduled');

INSERT INTO CREW VALUES
(1, 'Ravi', 'Kumar', 'Pilot', 'LIC001', '9000000001'),
(2, 'Meera', 'Nair', 'Cabin Crew', 'LIC002', '9000000002');

INSERT INTO FLIGHT_CREW VALUES
(1, 1, 'Captain', '2026-11-20 06:00:00'),
(1, 2, 'Purser', '2026-11-20 06:15:00'),
(2, 1, 'Captain', '2026-11-20 06:30:00');

INSERT INTO PASSENGER VALUES
(1, 'Anita', 'Rao', '1998-05-10', 'F', 'P1234567', 'Indian', '9111111111'),
(2, 'John', 'Mathew', '1995-03-22', 'M', 'P7654321', 'Indian', '9222222222');

INSERT INTO BOOKING VALUES
(1, 1, 1, '12A', '2026-11-10 10:00:00', 'Confirmed', 'Checked-In'),
(2, 2, 1, '12B', '2026-11-11 11:00:00', 'Confirmed', 'Pending'),
(3, 1, 3, '7C', '2026-11-12 09:00:00', 'Confirmed', 'Pending');

INSERT INTO BAGGAGE VALUES
(1, 'TAG1001', 18.5, 'Loaded', 1),
(2, 'TAG1002', 22.0, 'Checked-In', 2);

INSERT INTO DELAY_REASON VALUES
(1, 'Weather'),
(2, 'Technical Fault'),
(3, 'Crew Shortage');

INSERT INTO DELAY VALUES
(1, 1, 1, 40, '2026-11-20 08:00:00', 'Fog at departure');

INSERT INTO GROUND_OPERATION VALUES
(1, 1, 'Refuelling', 'Fuel top-up',
 '2026-11-20 07:00:00', '2026-11-20 07:30:00',
 '2026-11-20 07:05:00', '2026-11-20 07:40:00', 'Completed'),

(2, 2, 'Baggage Loading', 'Load checked baggage',
 '2026-11-20 07:30:00', '2026-11-20 08:10:00',
 NULL, NULL, 'Scheduled');

INSERT INTO EQUIPMENT VALUES
(1, 'Fuel Truck 01', 'Fuel Truck', 'Available', 'T1'),
(2, 'Belt Loader 01', 'Belt Loader', 'Available', 'T1');

INSERT INTO EQUIPMENT_ASSIGNMENT VALUES
(1, 1, '2026-11-20 07:00:00', '2026-11-20 07:40:00', 'Completed'),
(2, 2, '2026-11-20 07:30:00', '2026-11-20 08:10:00', 'Scheduled');

INSERT INTO STAFF VALUES
(1, 'Kiran', 'Shetty', 'Ground Staff', '9333333333'),
(2, 'Nisha', 'Reddy', 'Baggage Staff', '9444444444');

INSERT INTO OPERATION_STAFF_ASSIGNMENT VALUES
(1, 1, 'Refuelling Supervisor', '2026-11-20 07:00:00', '2026-11-20 07:40:00'),
(2, 2, 'Baggage Handler', '2026-11-20 07:30:00', '2026-11-20 08:10:00');

INSERT INTO WEATHER VALUES
(1, 1, '2026-11-20 07:00:00', 'Fog', 2.5, 12.0);

INSERT INTO NOTIFICATION VALUES
(1, 1, 1, 'Your flight AI101 is delayed by 40 minutes.',
 '2026-11-20 08:05:00', 'Sent'),
(2, 2, 1, 'Your flight AI101 is delayed by 40 minutes.',
 '2026-11-20 08:05:00', 'Sent');


-- =====================================================
-- 5. VIEW
-- =====================================================

CREATE OR REPLACE VIEW V_FLIGHT_OPERATIONS_SUMMARY AS
SELECT
    f.Flight_ID,
    f.Flight_Number,
    f.Flight_Date,
    f.Status,
    al.Airline_Name,
    dep.Airport_Code AS Departure_Airport,
    arr.Airport_Code AS Arrival_Airport,
    COUNT(DISTINCT b.Booking_ID) AS Passenger_Count,
    COUNT(DISTINCT go.Operation_ID) AS Ground_Operation_Count
FROM FLIGHT f
JOIN AIRLINE al
    ON al.Airline_Code = f.Airline_Code
JOIN AIRPORT dep
    ON dep.Airport_ID = f.Dep_Airport_ID
JOIN AIRPORT arr
    ON arr.Airport_ID = f.Arr_Airport_ID
LEFT JOIN BOOKING b
    ON b.Flight_ID = f.Flight_ID
LEFT JOIN GROUND_OPERATION go
    ON go.Flight_ID = f.Flight_ID
GROUP BY
    f.Flight_ID,
    f.Flight_Number,
    f.Flight_Date,
    f.Status,
    al.Airline_Name,
    dep.Airport_Code,
    arr.Airport_Code;


-- =====================================================
-- 6. TRIGGERS AND STORED PROCEDURE
-- =====================================================

DELIMITER $$

CREATE TRIGGER TRG_GROUND_OPERATION_AFTER_DELETE
AFTER DELETE ON GROUND_OPERATION
FOR EACH ROW
BEGIN
    INSERT INTO GROUND_OPERATION_AUDIT
        (Operation_ID, Operation_Type, Flight_ID, Old_Status, Deleted_By)
    VALUES
        (OLD.Operation_ID, OLD.Operation_Type, OLD.Flight_ID,
         OLD.Status, COALESCE(@app_user, CURRENT_USER()));
END$$


CREATE TRIGGER TRG_FLIGHT_STATUS_AFTER_UPDATE
AFTER UPDATE ON FLIGHT
FOR EACH ROW
BEGIN
    IF NOT (OLD.Status <=> NEW.Status) THEN
        INSERT INTO FLIGHT_STATUS_AUDIT
            (Flight_ID, Old_Status, New_Status)
        VALUES
            (OLD.Flight_ID, OLD.Status, NEW.Status);
    END IF;
END$$


CREATE PROCEDURE SP_GET_FLIGHT_SUMMARY(IN p_flight_id INT)
BEGIN
    SELECT
        f.Flight_ID,
        f.Flight_Number,
        f.Status,
        COUNT(b.Booking_ID) AS Passenger_Count
    FROM FLIGHT f
    LEFT JOIN BOOKING b
        ON b.Flight_ID = f.Flight_ID
    WHERE f.Flight_ID = p_flight_id
    GROUP BY
        f.Flight_ID,
        f.Flight_Number,
        f.Status;
END$$

DELIMITER ;


-- =====================================================
-- 7. INDEXES
-- =====================================================

CREATE INDEX IDX_FLIGHT_STATUS_DATE
ON FLIGHT(Status, Flight_Date);

CREATE INDEX IDX_GATE_ASSIGNMENT_INTERVAL
ON FLIGHT_GATE_ASSIGNMENT(Gate_ID, Assigned_From, Assigned_To);

CREATE INDEX IDX_BOOKING_FLIGHT
ON BOOKING(Flight_ID);

CREATE INDEX IDX_DELAY_FLIGHT
ON DELAY(Flight_ID);