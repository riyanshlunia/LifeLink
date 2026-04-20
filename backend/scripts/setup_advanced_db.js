const sequelize = require('../config/database');

async function setupAdvancedDB() {
  try {
    console.log('🔌 Connecting to database...');

    // NORMALIZATION UP TO 5NF (Example Schema)
    // 1NF: Atomic values, primary key
    // 2NF: No partial dependency
    // 3NF: No transitive dependency
    // BCNF: All determinants are candidate keys
    // 4NF: No multi-valued dependencies
    // 5NF: No join dependencies
    console.log('Creating normalized tables...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS person_base (
        person_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        dob DATE,
        gender VARCHAR(10)
      );
      CREATE TABLE IF NOT EXISTS person_contact (
        person_id INT,
        contact_type VARCHAR(20),
        contact_value VARCHAR(100),
        PRIMARY KEY (person_id, contact_type, contact_value),
        FOREIGN KEY (person_id) REFERENCES person_base(person_id)
      );
      CREATE TABLE IF NOT EXISTS person_blood_type (
        person_id INT PRIMARY KEY,
        blood_group VARCHAR(5),
        FOREIGN KEY (person_id) REFERENCES person_base(person_id)
      );
      CREATE TABLE IF NOT EXISTS donor_medical_history (
        donor_id INT,
        condition_name VARCHAR(100),
        PRIMARY KEY (donor_id, condition_name),
        FOREIGN KEY (donor_id) REFERENCES person_base(person_id)
      );
      CREATE TABLE IF NOT EXISTS organ_types (
        organ_type_id INT PRIMARY KEY AUTO_INCREMENT,
        organ_name VARCHAR(50) UNIQUE
      );
      CREATE TABLE IF NOT EXISTS hospital_locations (
        hospital_id INT PRIMARY KEY AUTO_INCREMENT,
        hospital_name VARCHAR(100),
        city VARCHAR(50),
        state VARCHAR(50)
      );
      -- Added 'version' column for Optimistic Concurrency Control
      CREATE TABLE IF NOT EXISTS donor_organ_availability (
        donor_id INT,
        organ_type_id INT,
        status VARCHAR(20),
        version INT DEFAULT 1,
        PRIMARY KEY (donor_id, organ_type_id),
        FOREIGN KEY (donor_id) REFERENCES person_base(person_id),
        FOREIGN KEY (organ_type_id) REFERENCES organ_types(organ_type_id)
      );
    `);

    // TRANSACTIONS, CONCURRENCY CONTROL & LOCKING MECHANISMS
    console.log('Creating Transaction Control Procedures...');

    // Transcation 1: Register New Donor (Basic Transaction Control)
    await sequelize.query(`DROP PROCEDURE IF EXISTS register_donor`);
    await sequelize.query(`
      CREATE PROCEDURE register_donor(
        IN p_fname VARCHAR(50), IN p_lname VARCHAR(50), IN p_dob DATE, IN p_gender VARCHAR(10), IN p_blood VARCHAR(5)
      )
      BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
          ROLLBACK;
        END;
        START TRANSACTION;
        INSERT INTO person_base(first_name, last_name, dob, gender) VALUES (p_fname, p_lname, p_dob, p_gender);
        SET @new_id = LAST_INSERT_ID();
        INSERT INTO person_blood_type(person_id, blood_group) VALUES (@new_id, p_blood);
        COMMIT;
      END;
    `);

    // Transcation 2: Log Organ Availability
    await sequelize.query(`DROP PROCEDURE IF EXISTS log_organ`);
    await sequelize.query(`
      CREATE PROCEDURE log_organ(IN p_donor INT, IN p_organ INT)
      BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; END;
        START TRANSACTION;
        INSERT INTO donor_organ_availability(donor_id, organ_type_id, status) VALUES (p_donor, p_organ, 'Available');
        COMMIT;
      END;
    `);

    // Transcation 3: Update Hospital Location (Concurrency Control via Strict Isolation)
    // Ensures SERIALIZABLE isolation level so no other transactions interfere while this reads/writes.
    await sequelize.query(`DROP PROCEDURE IF EXISTS update_hospital`);
    await sequelize.query(`
      CREATE PROCEDURE update_hospital(IN p_id INT, IN p_city VARCHAR(50), IN p_state VARCHAR(50))
      BEGIN
        DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; END;
        
        SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
        START TRANSACTION;
        UPDATE hospital_locations SET city = p_city, state = p_state WHERE hospital_id = p_id;
        COMMIT;
      END;
    `);

    // Transcation 4: Update Organ Status (Optimistic Concurrency Control)
    // Relies on a 'version' column check to ensure the strict state hasn't been modified by another process
    await sequelize.query(`DROP PROCEDURE IF EXISTS update_organ_status_optimistic`);
    await sequelize.query(`
      CREATE PROCEDURE update_organ_status_optimistic(IN p_donor INT, IN p_organ INT, IN p_new_status VARCHAR(20), IN p_expected_version INT)
      BEGIN
        DECLARE v_rows_affected INT;
        DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; END;
        
        START TRANSACTION;
        UPDATE donor_organ_availability 
        SET status = p_new_status, version = version + 1 
        WHERE donor_id = p_donor AND organ_type_id = p_organ AND version = p_expected_version;
        
        -- Get rows updated. If 0, some other process changed the version (Optimistic Lock Failure)
        SET v_rows_affected = ROW_COUNT();
        IF v_rows_affected = 0 THEN
           ROLLBACK;
           SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Concurrency Error: Record was modified by another transaction';
        ELSE
           COMMIT;
        END IF;
      END;
    `);

    // Transcation 5: Process Organ Match (Pessimistic Locking Mechanism)
    // Uses ROW-LEVEL LOCKING via "SELECT ... FOR UPDATE" to lock exactly the row being matched until COMMIT
    await sequelize.query(`DROP PROCEDURE IF EXISTS process_organ_match_pessimistic`);
    await sequelize.query(`
      CREATE PROCEDURE process_organ_match_pessimistic(IN p_donor INT, IN p_organ INT, IN p_recipient INT)
      BEGIN
        DECLARE v_current_status VARCHAR(20);
        DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; END;
        
        START TRANSACTION;
        
        -- Acquire explicit Row-Level Pessimistic Lock
        SELECT status INTO v_current_status 
        FROM donor_organ_availability 
        WHERE donor_id = p_donor AND organ_type_id = p_organ 
        FOR UPDATE;
        
        IF v_current_status = 'Available' THEN
           UPDATE donor_organ_availability SET status = 'Matched' WHERE donor_id = p_donor AND organ_type_id = p_organ;
           
           -- Insert the finalized match
           INSERT INTO matchings(organ_id, recipient_id, donor_id, compatibility_status, match_date, created_at, updated_at) 
           VALUES (p_organ, p_recipient, p_donor, 'Matched', NOW(), NOW(), NOW());
        ELSE
           -- Row is locked by us but state is not compatible, abort natively
           ROLLBACK;
           SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Match Failed: Organ is not available anymore';
        END IF;
        
        COMMIT;
      END;
    `);

    console.log('✨ Advanced DB setup successfully applied!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up advanced DB features:', error);
    process.exit(1);
  }
}

setupAdvancedDB();
