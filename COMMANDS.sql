-- =========================================================================
-- DATABASE NORMALIZATION DEMONSTRATION (0NF to 5NF)
-- Run these sequentially in MySQL Workbench to show to your evaluator.
-- =========================================================================

-- Create a fresh database for the demo
CREATE DATABASE IF NOT EXISTS normalization_demo;
USE normalization_demo;

-- =========================================================================
-- STEP 0: Unnormalized Form (UNF / 0NF)
-- Problem: Multi-valued attributes (Phone_Numbers, Hospitals) in a single column.
-- =========================================================================
DROP TABLE IF EXISTS Patients_UNF;
CREATE TABLE Patients_UNF (
    PatientID INT,
    PatientName VARCHAR(50),
    PatientDOB DATE,
    Phone_Numbers VARCHAR(100),
    DoctorID INT,
    DoctorName VARCHAR(50),
    Hospitals VARCHAR(100),
    OrganNeeded VARCHAR(50)
);

INSERT INTO Patients_UNF VALUES 
(1, 'John Doe', '1990-05-14', '555-0101, 555-0102', 101, 'Dr. Smith', 'City General, Hope Med', 'Kidney'),
(2, 'Jane Roe', '1985-08-20', '555-0201', 102, 'Dr. Adams', 'Hope Med', 'Liver');

-- RESULT 0NF
SELECT * FROM Patients_UNF;


-- =========================================================================
-- STEP 1: First Normal Form (1NF)
-- Rule: Eliminate repeating groups. Every column must hold atomic values.
-- Action: We separate the multiple phone numbers and hospitals into multiple rows.
-- The Primary Key is now a composite: (PatientID, Phone_Number, Hospital).
-- =========================================================================
DROP TABLE IF EXISTS Patients_1NF;
CREATE TABLE Patients_1NF (
    PatientID INT,
    PatientName VARCHAR(50),
    PatientDOB DATE,
    Phone_Number VARCHAR(20),
    DoctorID INT,
    DoctorName VARCHAR(50),
    Hospital VARCHAR(50),
    OrganNeeded VARCHAR(50)
);

-- Data is now atomic:
INSERT INTO Patients_1NF VALUES 
(1, 'John Doe', '1990-05-14', '555-0101', 101, 'Dr. Smith', 'City General', 'Kidney'),
(1, 'John Doe', '1990-05-14', '555-0101', 101, 'Dr. Smith', 'Hope Med', 'Kidney'),
(1, 'John Doe', '1990-05-14', '555-0102', 101, 'Dr. Smith', 'City General', 'Kidney'),
(1, 'John Doe', '1990-05-14', '555-0102', 101, 'Dr. Smith', 'Hope Med', 'Kidney'),
(2, 'Jane Roe', '1985-08-20', '555-0201', 102, 'Dr. Adams', 'Hope Med', 'Liver');

-- RESULT 1NF
SELECT * FROM Patients_1NF;


-- =========================================================================
-- STEP 2: Second Normal Form (2NF)
-- Rule: Must be in 1NF. Eliminate Partial Dependencies.
-- Problem in 1NF: PatientName and PatientDOB depend ONLY on PatientID, not on 
-- the full composite key (PatientID, Phone_Number, Hospital).
-- Action: Break into Patient info, Phone info, and Consultation info.
-- =========================================================================
DROP TABLE IF EXISTS Patient_Info_2NF;
DROP TABLE IF EXISTS Patient_Phones_2NF;
DROP TABLE IF EXISTS Patient_Consultations_2NF;

-- Non-key attributes dependent on the whole candidate key (PatientID)
CREATE TABLE Patient_Info_2NF (
    PatientID INT PRIMARY KEY,
    PatientName VARCHAR(50),
    PatientDOB DATE
);

-- Extracting multi-valued phones
CREATE TABLE Patient_Phones_2NF (
    PatientID INT,
    Phone_Number VARCHAR(20),
    PRIMARY KEY (PatientID, Phone_Number)
);

-- Extracting medical info and hospitals
CREATE TABLE Patient_Consultations_2NF (
    PatientID INT,
    Hospital VARCHAR(50),
    DoctorID INT,
    DoctorName VARCHAR(50),
    OrganNeeded VARCHAR(50)
);

-- Inserting Data derived from 1NF:
INSERT INTO Patient_Info_2NF VALUES (1, 'John Doe', '1990-05-14'), (2, 'Jane Roe', '1985-08-20');
INSERT INTO Patient_Phones_2NF VALUES (1, '555-0101'), (1, '555-0102'), (2, '555-0201');
INSERT INTO Patient_Consultations_2NF VALUES 
(1, 'City General', 101, 'Dr. Smith', 'Kidney'),
(1, 'Hope Med', 101, 'Dr. Smith', 'Kidney'),
(2, 'Hope Med', 102, 'Dr. Adams', 'Liver');

-- RESULTS 2NF
SELECT * FROM Patient_Info_2NF;
SELECT * FROM Patient_Phones_2NF;
SELECT * FROM Patient_Consultations_2NF;


-- =========================================================================
-- STEP 3: Third Normal Form (3NF)
-- Rule: Must be in 2NF. Eliminate Transitive Dependencies.
-- Problem in 2NF: In Consultations, DoctorName depends on DoctorID (not PatientID).
-- Action: Extract Doctor details into a separate Doctor table.
-- =========================================================================
DROP TABLE IF EXISTS Patient_Info_3NF;
DROP TABLE IF EXISTS Patient_Phones_3NF;
DROP TABLE IF EXISTS Doctor_Info_3NF;
DROP TABLE IF EXISTS Patient_Consultations_3NF;

-- Carried over from 2NF (Unchanged structure)
CREATE TABLE Patient_Info_3NF AS SELECT * FROM Patient_Info_2NF;
CREATE TABLE Patient_Phones_3NF AS SELECT * FROM Patient_Phones_2NF;

-- New Doctor Table (removes transitive dependency)
CREATE TABLE Doctor_Info_3NF (
    DoctorID INT PRIMARY KEY,
    DoctorName VARCHAR(50)
);

-- Consultations table now only has foreign keys, removing DoctorName
CREATE TABLE Patient_Consultations_3NF (
    PatientID INT,
    Hospital VARCHAR(50),
    DoctorID INT,
    OrganNeeded VARCHAR(50)
);

-- Insert Data Derived from 2NF:
INSERT INTO Doctor_Info_3NF VALUES (101, 'Dr. Smith'), (102, 'Dr. Adams');
INSERT INTO Patient_Consultations_3NF VALUES 
(1, 'City General', 101, 'Kidney'),
(1, 'Hope Med', 101, 'Kidney'),
(2, 'Hope Med', 102, 'Liver');

-- RESULTS 3NF
SELECT * FROM Doctor_Info_3NF;
SELECT * FROM Patient_Consultations_3NF;


-- =========================================================================
-- STEP 4: Boyce-Codd Normal Form (BCNF)
-- Rule: Must be in 3NF. Every determinant must be a candidate key.
-- Problem: Suppose a rule states: "A hospital has exactly one special doctor 
-- for a specific organ, and conversely, a doctor only specializes in ONE organ."
-- Here, DoctorID is a determinant for OrganNeeded, but it's not a candidate key for the whole row.
-- Action: Split into Doctor_Specialty and Patient_Doctor_Hospital.
-- =========================================================================
DROP TABLE IF EXISTS Doctor_Specialty_BCNF;
DROP TABLE IF EXISTS Patient_Treatment_BCNF;

-- Doctor specifies the exact organ
CREATE TABLE Doctor_Specialty_BCNF (
    DoctorID INT PRIMARY KEY,
    OrganNeeded VARCHAR(50)
);

-- Treatment maps the patient and hospital to the doctor
CREATE TABLE Patient_Treatment_BCNF (
    PatientID INT,
    Hospital VARCHAR(50),
    DoctorID INT
);

-- Insert Data Derived from 3NF:
INSERT INTO Doctor_Specialty_BCNF VALUES (101, 'Kidney'), (102, 'Liver');
INSERT INTO Patient_Treatment_BCNF VALUES 
(1, 'City General', 101),
(1, 'Hope Med', 101),
(2, 'Hope Med', 102);

-- RESULTS BCNF
SELECT * FROM Doctor_Specialty_BCNF;
SELECT * FROM Patient_Treatment_BCNF;


-- =========================================================================
-- STEP 5: Fourth Normal Form (4NF)
-- Rule: Must be in BCNF. Eliminate Multi-valued Dependencies.
-- Problem: Suppose a Doctor has multiple unrelated specialties AND works at 
-- multiple unrelated hospitals. Storing them in one table causes redundancy.
-- Example Table with Multi-Valued Dependency:
-- Doctor_Profile (DoctorID, Specialty, Hospital_Affiliation) -> Primary key (All 3)
-- Action: Separate into two tables.
-- =========================================================================
DROP TABLE IF EXISTS Doctor_Specialties_4NF;
DROP TABLE IF EXISTS Doctor_Hospitals_4NF;

CREATE TABLE Doctor_Specialties_4NF (
    DoctorID INT,
    Specialty VARCHAR(50),
    PRIMARY KEY (DoctorID, Specialty)
);

CREATE TABLE Doctor_Hospitals_4NF (
    DoctorID INT,
    Hospital VARCHAR(50),
    PRIMARY KEY (DoctorID, Hospital)
);

-- If Doctor 101 is Kidney & Heart specialist, working at City Gen & Hope Med:
INSERT INTO Doctor_Specialties_4NF VALUES (101, 'Kidney'), (101, 'Heart');
INSERT INTO Doctor_Hospitals_4NF VALUES (101, 'City General'), (101, 'Hope Med');

-- RESULTS 4NF
SELECT * FROM Doctor_Specialties_4NF;
SELECT * FROM Doctor_Hospitals_4NF;


-- =========================================================================
-- STEP 6: Fifth Normal Form (5NF)
-- Rule: Must be in 4NF. Eliminate cyclical join dependencies.
-- Problem: A Doctor handles a specific Organ (Type). A Hospital supports a 
-- specific Organ. A Doctor works at a specific Hospital.
-- If Doctor (101) does Kidney, Hospital (Hope Med) supports Kidney, 
-- does 101 perform Kidney at Hope Med? If this rule dictates full combinations, 
-- keeping it in one 3-part table creates anomalies. 
-- Action: Decompose into three binary relation tables.
-- =========================================================================
DROP TABLE IF EXISTS Doctor_Organ_5NF;
DROP TABLE IF EXISTS Hospital_Organ_5NF;
DROP TABLE IF EXISTS Doctor_Hospital_5NF;

CREATE TABLE Doctor_Organ_5NF (
    DoctorID INT,
    Organ VARCHAR(50),
    PRIMARY KEY (DoctorID, Organ)
);

CREATE TABLE Hospital_Organ_5NF (
    Hospital VARCHAR(50),
    Organ VARCHAR(50),
    PRIMARY KEY (Hospital, Organ)
);

CREATE TABLE Doctor_Hospital_5NF (
    DoctorID INT,
    Hospital VARCHAR(50),
    PRIMARY KEY (DoctorID, Hospital)
);

INSERT INTO Doctor_Organ_5NF VALUES (101, 'Kidney'), (102, 'Liver');
INSERT INTO Hospital_Organ_5NF VALUES ('City General', 'Kidney'), ('Hope Med', 'Kidney'), ('Hope Med', 'Liver');
INSERT INTO Doctor_Hospital_5NF VALUES (101, 'City General'), (101, 'Hope Med'), (102, 'Hope Med');

-- RESULTS 5NF
SELECT * FROM Doctor_Organ_5NF;
SELECT * FROM Hospital_Organ_5NF;
SELECT * FROM Doctor_Hospital_5NF;

-- END OF NORMALIZATION DEMONSTRATION
