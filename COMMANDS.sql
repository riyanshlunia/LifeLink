-- USE organ_donation_db; -- Make sure to select your database first!

-- ==========================================
-- 1. DATABASE STRUCTURE OVEVIEW
-- ==========================================

-- Show all tables in the system
SHOW TABLES;

-- Describe the structure of key tables (Columns, Types, Keys)
DESCRIBE users;
DESCRIBE donors;
DESCRIBE recipients;
DESCRIBE organs;
DESCRIBE matchings;
DESCRIBE transplant_records;
DESCRIBE hospitals;
DESCRIBE doctors;

-- ==========================================
-- 2. BASIC DATA RETRIEVAL (Checking Data)
-- ==========================================

-- List the first 5 Users registered in the system
SELECT id, full_name, email, role, created_at FROM users LIMIT 5;

-- List all Hospitals
SELECT * FROM hospitals;

-- List active available Organs
SELECT * FROM organs WHERE status = 'Available';

-- ==========================================
-- 3. COMPLEX JOIN QUERIES (Demonstrating Relationships)
-- ==========================================

-- A. DETAILED ORGAN INFORMATION
-- Join Organs with Donors to see who donated which organ
-- Question: "Show me all available hearts and the donor's blood group."
SELECT 
    o.id AS OrganID, 
    o.organ_type AS OrganType, 
    o.status AS Status,
    d.full_name AS DonorName, 
    d.blood_group AS BloodGroup, 
    d.age AS DonorAge
FROM organs o
INNER JOIN donors d ON o.donor_id = d.id
WHERE o.status = 'Available';

-- B. WAITING LIST ANALYSIS
-- Filter Recipients to show critical cases
-- Question: "List all critical patients waiting for a Kidney."
SELECT 
    r.id AS RecipientID,
    r.full_name AS PatientName,
    r.age AS Age,
    r.blood_group AS BloodGroup,
    r.urgency_level AS Urgency,
    r.email AS ContactEmail
FROM recipients r
WHERE r.required_organ = 'kidney' AND r.urgency_level = 'critical';

-- C. COMPREHENSIVE MATCHING REPORT
-- Join Matchings -> Recipient -> Organ -> Donor
-- Question: "Show me all matches with full details of donor and recipient."
SELECT 
    m.id AS MatchID,
    m.compatibility_score AS Score,
    m.match_date AS DateMatched,
    r.full_name AS RecipientName,
    d.full_name AS DonorName,
    o.organ_type AS Organ,
    d.blood_group AS OrganBloodGroup
FROM matchings m
JOIN recipients r ON m.recipient_id = r.id
JOIN organs o ON m.organ_id = o.id
JOIN donors d ON m.donor_id = d.id
ORDER BY m.compatibility_score DESC;

-- ==========================================
-- 4. ADVANCED DATABASE FEATURES (Views, Procedures, Triggers)
-- ==========================================

-- A. VIEW DEMONSTRATION
-- Selecting from the pre-created 'active_organs_view'
-- This view abstracts the complexity of joining donors and organs for availability checks.
SELECT * FROM active_organs_view;

-- B. STORED PROCEDURE EXECUTION
-- Run the automated matching algorithm manually
CALL run_matching_algorithm();

-- ==========================================
-- 5. AGGREGATE OPERATIONS & ANALYSIS (GROUP BY / HAVING)
-- ==========================================

-- Count available organs by type
SELECT organ_type, COUNT(*) as count 
FROM organs 
WHERE status = 'Available' 
GROUP BY organ_type;

-- Find Donors above Average Age per Blood Group
SELECT blood_group, AVG(age) as avg_age 
FROM donors 
GROUP BY blood_group 
HAVING AVG(age) > 30;

-- ==========================================
-- 6. SET OPERATIONS (UNION)
-- ==========================================

-- List all unique cities involved in the system (Donors + Recipients)
SELECT city FROM donors
UNION
SELECT city FROM recipients;

-- ==========================================
-- 7. SUBQUERIES & NESTED LOGIC
-- ==========================================

-- Find recipients waiting longer than the average waiting time of all recipients
SELECT full_name, waiting_since 
FROM recipients 
WHERE waiting_since < (SELECT AVG(waiting_since) FROM recipients);

-- ==========================================
-- 8. SHOWCASING PROCEDURAL LOGIC-- USE organ_donation_db; -- Make sure to select your database first!

-- ==========================================
-- 1. DATABASE STRUCTURE OVEVIEW
-- ==========================================

-- Show all tables in the system
SHOW TABLES;

-- Describe the structure of key tables (Columns, Types, Keys)
DESCRIBE users;
DESCRIBE donors;
DESCRIBE recipients;
DESCRIBE organs;
DESCRIBE matchings;
DESCRIBE transplant_records;
DESCRIBE hospitals;
DESCRIBE doctors;

-- ==========================================
-- 2. BASIC DATA RETRIEVAL (Checking Data)
-- ==========================================

-- List the first 5 Users registered in the system
SELECT id, full_name, email, role, created_at FROM users LIMIT 5;

-- List all Hospitals
SELECT * FROM hospitals;

-- List active available Organs
SELECT * FROM organs WHERE status = 'Available';

-- ==========================================
-- 3. COMPLEX JOIN QUERIES (Demonstrating Relationships)
-- ==========================================

-- A. DETAILED ORGAN INFORMATION
-- Join Organs with Donors to see who donated which organ
-- Question: "Show me all available hearts and the donor's blood group."
SELECT 
    o.id AS OrganID, 
    o.organ_type AS OrganType, 
    o.status AS Status,
    d.full_name AS DonorName, 
    d.blood_group AS BloodGroup, 
    d.age AS DonorAge
FROM organs o
INNER JOIN donors d ON o.donor_id = d.id
WHERE o.status = 'Available';

-- B. WAITING LIST ANALYSIS
-- Filter Recipients to show critical cases
-- Question: "List all critical patients waiting for a Kidney."
SELECT 
    r.id AS RecipientID,
    r.full_name AS PatientName,
    r.age AS Age,
    r.blood_group AS BloodGroup,
    r.urgency_level AS Urgency,
    r.email AS ContactEmail
FROM recipients r
WHERE r.required_organ = 'kidney' AND r.urgency_level = 'critical';

-- C. COMPREHENSIVE MATCHING REPORT
-- Join Matchings -> Recipient -> Organ -> Donor
-- Question: "Show me all matches with full details of donor and recipient."
SELECT 
    m.id AS MatchID,
    m.compatibility_score AS Score,
    m.match_date AS DateMatched,
    r.full_name AS RecipientName,
    d.full_name AS DonorName,
    o.organ_type AS Organ,
    d.blood_group AS OrganBloodGroup
FROM matchings m
JOIN recipients r ON m.recipient_id = r.id
JOIN organs o ON m.organ_id = o.id
JOIN donors d ON m.donor_id = d.id
ORDER BY m.compatibility_score DESC;

-- ==========================================
-- 4. ADVANCED DATABASE FEATURES (Views, Procedures, Triggers)
-- ==========================================

-- A. VIEW DEMONSTRATION
-- Selecting from the pre-created 'active_organs_view'
-- This view abstracts the complexity of joining donors and organs for availability checks.
SELECT * FROM active_organs_view;

-- B. STORED PROCEDURE EXECUTION
-- Run the automated matching algorithm manually
CALL run_matching_algorithm();

-- ==========================================
-- 5. AGGREGATE OPERATIONS & ANALYSIS (GROUP BY / HAVING)
-- ==========================================

-- Count available organs by type
SELECT organ_type, COUNT(*) as count 
FROM organs 
WHERE status = 'Available' 
GROUP BY organ_type;

-- Find Donors above Average Age per Blood Group
SELECT blood_group, AVG(age) as avg_age 
FROM donors 
GROUP BY blood_group 
HAVING AVG(age) > 30;

-- ==========================================
-- 6. SET OPERATIONS (UNION)
-- ==========================================

-- List all unique cities involved in the system (Donors + Recipients)
SELECT city FROM donors
UNION
SELECT city FROM recipients;

-- ==========================================
-- 7. SUBQUERIES & NESTED LOGIC
-- ==========================================

-- Find recipients waiting longer than the average waiting time of all recipients
SELECT full_name, waiting_since 
FROM recipients 
WHERE waiting_since < (SELECT AVG(waiting_since) FROM recipients);

-- ==========================================
-- 8. SHOWCASING PROCEDURAL LOGIC
-- ==========================================

-- Display the Stored Procedure Logic (For Presentation)
SHOW CREATE PROCEDURE run_matching_algorithm;
SHOW CREATE TRIGGER log_new_matching;

-- Execute Procedure (Already shown above, repeated for flow)
CALL run_matching_algorithm();


-- ==========================================
-- 9. AUDIT VERIFICATION (TRIGGER PROOF)
-- ==========================================

-- Check the Audit Logs to verify the log_new_matching trigger execution
SELECT * FROM audit_logs 
WHERE action = 'AUTOMATED_MATCH' 
ORDER BY created_at DESC 
LIMIT 10;

-- ==========================================

-- Display the Stored Procedure Logic (For Presentation)
SHOW CREATE PROCEDURE run_matching_algorithm;
SHOW CREATE TRIGGER log_new_matching;

-- Execute Procedure (Already shown above, repeated for flow)
CALL run_matching_algorithm();


-- ==========================================
-- 9. AUDIT VERIFICATION (TRIGGER PROOF)
-- ==========================================

-- Check the Audit Logs to verify the log_new_matching trigger execution
SELECT * FROM audit_logs 
WHERE action = 'AUTOMATED_MATCH' 
ORDER BY created_at DESC 
LIMIT 10;
