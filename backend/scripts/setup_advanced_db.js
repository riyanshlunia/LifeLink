const sequelize = require('../config/database');

async function setupAdvancedDB() {
  try {
    console.log('🔌 Connecting to database...');
    // Ensure sync first? Maybe not, tables should exist.
    // If running for the first time, migration should have run.
    
    // 1. Create View: active_organs_view
    // This view simplifies the retrieval of available organs along with key donor information.
    console.log('Creating View: active_organs_view...');
    await sequelize.query(`DROP VIEW IF EXISTS active_organs_view`);
    await sequelize.query(`
      CREATE VIEW active_organs_view AS
      SELECT 
          o.id AS organ_id,
          o.organ_type,
          o.status AS organ_status,
          d.id AS donor_id,
          d.full_name AS donor_name,
          d.blood_group AS donor_blood_group,
          d.age AS donor_age,
          d.donation_status
      FROM organs o
      JOIN donors d ON o.donor_id = d.id
      WHERE o.status = 'Available' AND d.donation_status = 'Approved';
    `);

    // 2. Create Trigger: log = audit_logs on new matching
    // Automatically logs new match creation for audit trail.
    console.log('Creating Trigger: log_new_matching...');
    await sequelize.query(`DROP TRIGGER IF EXISTS log_new_matching`);
    
    // Note: Delimiters are handled differently in direct queries vs SQL scripts, 
    // ensuring we don't need DELIMITER // syntax for single query execution in Node.
    // However, multi-statement might need splitting.
    // Sequelize query function handles standard SQL. For triggers/procedures, we might need raw executes.
    
    await sequelize.query(`
      CREATE TRIGGER log_new_matching
      AFTER INSERT ON matchings
      FOR EACH ROW
      BEGIN
          INSERT INTO audit_logs (
              action, 
              entity_type, 
              entity_id, 
              details, 
              created_at, 
              updated_at
          ) VALUES (
              'AUTOMATED_MATCH',
              'Matching',
              NEW.id,
              CONCAT('System generated match for Organ ID: ', NEW.organ_id, ' and Recipient ID: ', NEW.recipient_id),
              NOW(),
              NOW()
          );
      END;
    `);

    // 3. Create Stored Procedure: match_donors_recipients
    // USES: Cursor, Loop, Transaction, Exception Handling
    console.log('Creating Procedure: run_matching_algorithm...');
    await sequelize.query(`DROP PROCEDURE IF EXISTS run_matching_algorithm`);

    // Procedures with cursors are tricky in single query string.
    await sequelize.query(`
      CREATE PROCEDURE run_matching_algorithm()
      BEGIN
          -- Declare variables
          DECLARE done INT DEFAULT FALSE;
          DECLARE v_organ_id INT;
          DECLARE v_organ_type VARCHAR(20);
          DECLARE v_donor_blood VARCHAR(5);
          DECLARE v_donor_id INT;
          
          -- Cursor Declaration
          DECLARE cur_organs CURSOR FOR 
              SELECT organ_id, organ_type, donor_blood_group, donor_id 
              FROM active_organs_view;
              
          -- Declare Exception Handler (ROLLBACK on error)
          DECLARE EXIT HANDLER FOR SQLEXCEPTION
          BEGIN
              ROLLBACK;
              RESIGNAL;
          END;
          
          -- Declare Continue Handler for Cursor
          DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
          
          -- Start Transaction
          START TRANSACTION;
          
          OPEN cur_organs;
          
          read_loop: LOOP
              FETCH cur_organs INTO v_organ_id, v_organ_type, v_donor_blood, v_donor_id;
              
              IF done THEN
                  LEAVE read_loop;
              END IF;
              
              -- Perform matching logic: Find eligible recipients
              -- Using nested query logic (Set Operations implicitly via join/logic)
              INSERT INTO matchings (
                  organ_id, 
                  recipient_id, 
                  donor_id, 
                  compatibility_score, 
                  compatibility_status, 
                  match_date, 
                  created_at, 
                  updated_at
              )
              SELECT 
                  v_organ_id,
                  r.id,
                  v_donor_id,
                  -- Basic algorithm calculation within SQL
                  (
                      CASE 
                          WHEN r.blood_group = v_donor_blood THEN 50 
                          ELSE 0 
                      END + 
                      CASE 
                          WHEN r.urgency_level = 'critical' THEN 40 
                          WHEN r.urgency_level = 'high' THEN 30 
                          WHEN r.urgency_level = 'medium' THEN 10 
                          ELSE 0 
                      END
                  ) AS score,
                  'Pending',
                  NOW(),
                  NOW(),
                  NOW()
              FROM recipients r
              WHERE r.required_organ = v_organ_type
                AND r.status = 'waiting'
                AND r.blood_group = v_donor_blood -- Strict blood match for simplicity
                -- Avoid duplicate matches
                AND NOT EXISTS (
                    SELECT 1 FROM matchings m 
                    WHERE m.organ_id = v_organ_id AND m.recipient_id = r.id
                );
                
          END LOOP;
          
          CLOSE cur_organs;
          
          COMMIT;
          
          -- Return result summary (Optional in procedure, but good for debug)
          -- SELECT 'Matching run completed' AS status;
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
