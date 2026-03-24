const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const {
  User,
  Hospital,
  Doctor,
  Donor,
  Recipient,
  Organ,
  Matching,
  TransplantRecord
} = require('../models');
const { calculateCompatibility } = require('../utils/matchingAlgorithm');

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const organTypes = ['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Maharashtra', 'Gujarat'];

const firstNames = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Ravi', 'Neha', 'Arun', 'Pooja', 
                    'Sanjay', 'Divya', 'Karan', 'Meera', 'Raj', 'Kavita', 'Suresh', 'Anita', 'Manoj', 'Swati'];
const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Verma', 'Gupta', 'Nair', 'Iyer', 'Mehta',
                   'Rao', 'Desai', 'Joshi', 'Kulkarni', 'Pillai', 'Shah', 'Agarwal', 'Mishra', 'Banerjee', 'Chopra'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared');

    // Create Admin User
    // const adminPassword = await bcrypt.hash('Admin@123', 10); // Removed: User hook handles hashing
    const adminUser = await User.create({
      email: 'admin@hospital.com',
      password: 'Admin@123',
      full_name: 'System Administrator',
      role: 'admin',
      is_active: true
    });
    console.log('✅ Admin user created');

    // Create Hospitals
    const hospitals = [];
    const hospitalNames = [
      'Apollo Hospital', 'Fortis Healthcare', 'Max Hospital', 'Medanta',
      'AIIMS', 'Manipal Hospital', 'Narayana Health', 'Columbia Asia',
      'Lilavati Hospital', 'Kokilaben Hospital'
    ];

    for (let i = 0; i < 10; i++) {
      const hospital = await Hospital.create({
        name: hospitalNames[i],
        address: `${getRandomInt(1, 99)} ${getRandomElement(['MG Road', 'Park Street', 'Station Road', 'Main Street'])}`,
        city: cities[i % cities.length],
        state: states[i % states.length],
        contact_number: `+91${getRandomInt(7000000000, 9999999999)}`,
        email: `contact@${hospitalNames[i].toLowerCase().replace(/\s+/g, '')}.com`,
        transplant_capacity: getRandomInt(5, 20),
        specializations: ['Cardiology', 'Nephrology', 'Hepatology'].slice(0, getRandomInt(1, 3)),
        accreditation: 'NABH',
        is_active: true
      });
      hospitals.push(hospital);
    }
    console.log('✅ 10 hospitals created');

    // Create Doctors
    const doctors = [];
    const specializations = [
      'Cardiac Surgeon', 'Transplant Surgeon', 'Nephrologist', 
      'Hepatologist', 'Pulmonologist', 'General Surgeon'
    ];

    for (let i = 0; i < 20; i++) {
      const doctor = await Doctor.create({
        hospital_id: hospitals[i % 10].id,
        full_name: `Dr. ${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        specialization: getRandomElement(specializations),
        license_number: `MED${getRandomInt(100000, 999999)}`,
        age: getRandomInt(30, 65),
        contact_number: `+91${getRandomInt(7000000000, 9999999999)}`,
        email: `doctor${i + 1}@hospital.com`,
        experience_years: getRandomInt(5, 30),
        transplant_expertise: organTypes.slice(0, getRandomInt(1, 3)),
        is_available: Math.random() > 0.2
      });
      doctors.push(doctor);

      // Create user account for some doctors
      if (i < 5) {
        await User.create({
          email: `doctor${i + 1}@hospital.com`,
          password: 'Doctor@123', // Removed bcrypt.hash
          full_name: doctor.full_name,
          role: 'doctor',
          hospital_id: doctor.hospital_id,
          doctor_id: doctor.id,
          is_active: true
        });
      }
    }
    console.log('✅ 20 doctors created');

    // Create Hospital Staff Users
    for (let i = 0; i < 5; i++) {
      await User.create({
        email: `staff${i + 1}@hospital.com`,
        password: 'Staff@123', // Removed bcrypt.hash
        full_name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        role: 'hospital_staff',
        hospital_id: hospitals[i].id,
        is_active: true
      });
    }
    console.log('✅ 5 hospital staff users created');

    // Create Donors
    const donors = [];
    for (let i = 0; i < 50; i++) {
      const dob = getRandomDate(new Date(1950, 0, 1), new Date(2000, 0, 1));
      const donorType = getRandomElement(['Live', 'Deceased']);
      const donor = await Donor.create({
        full_name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        date_of_birth: dob,
        gender: getRandomElement(['male', 'female']),
        blood_group: getRandomElement(bloodGroups),
        hla_type: `HLA-${getRandomElement(['A', 'B', 'C'])}*${getRandomInt(10, 99)}`,
        age: 2024 - dob.getFullYear(),
        donor_type: donorType,
        cause_of_death: donorType === 'Deceased' ? 'Cardiac Arrest' : null,
        contact_number: `+91${getRandomInt(7000000000, 9999999999)}`,
        email: `donor${i + 1}@email.com`,
        address: `${getRandomInt(1, 99)} ${getRandomElement(['Street', 'Avenue', 'Road', 'Lane'])}`,
        city: getRandomElement(cities),
        state: getRandomElement(states),
        medical_history: getRandomElement(['Healthy', 'No major conditions', 'Controlled diabetes', 'Hypertension managed']),
        donation_status: i < 30 ? 'available' : getRandomElement(['matched', 'donated', 'unavailable']),
        registration_date: getRandomDate(new Date(2023, 0, 1), new Date())
      });
      donors.push(donor);
    }
    console.log('✅ 50 donors created');

    // Create Organs for donors
    const organs = [];
    for (let i = 0; i < 50; i++) {
      const numOrgans = getRandomInt(1, 2);
      for (let j = 0; j < numOrgans; j++) {
        const preservationDate = getRandomDate(new Date(2024, 0, 1), new Date());
        const organ = await Organ.create({
          donor_id: donors[i].id,
          organ_type: getRandomElement(organTypes),
          status: donors[i].donation_status === 'available' ? 'Available' : 
                              donors[i].donation_status === 'matched' ? 'Available' : // or In Transit if matched/transplanted workflow differs
                              donors[i].donation_status === 'donated' ? 'Transplanted' : 'Available',
          procurement_time: preservationDate,
          medical_notes: getRandomElement(['Excellent condition', 'Good quality', 'Standard procedure followed'])
        });
        organs.push(organ);
      }
    }
    console.log(`✅ ${organs.length} organs created`);

    // Create Recipients
    const recipients = [];
    const urgencyLevels = ['critical', 'high', 'medium', 'low'];
    for (let i = 0; i < 50; i++) {
      const dob = getRandomDate(new Date(1950, 0, 1), new Date(2005, 0, 1));
      const recipient = await Recipient.create({
        full_name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        date_of_birth: dob,
        gender: getRandomElement(['male', 'female']),
        blood_group: getRandomElement(bloodGroups),
        age: 2024 - dob.getFullYear(),
        contact_number: `+91${getRandomInt(7000000000, 9999999999)}`,
        email: `recipient${i + 1}@email.com`,
        address: `${getRandomInt(1, 99)} ${getRandomElement(['Street', 'Avenue', 'Road', 'Lane'])}`,
        city: getRandomElement(cities),
        state: getRandomElement(states),
        medical_condition: getRandomElement([
          'End-stage renal disease',
          'Liver cirrhosis',
          'Heart failure',
          'Chronic lung disease',
          'Corneal blindness'
        ]),
        required_organ: getRandomElement(organTypes),
        urgency_level: getRandomElement(urgencyLevels),
        urgency_score: getRandomInt(1, 100),
        hla_type: `HLA-${getRandomElement(['A', 'B', 'C'])}*${getRandomInt(10, 99)}`,
        status: i < 30 ? 'waiting' : getRandomElement(['matched', 'transplanted', 'removed'])
      });
      recipients.push(recipient);
    }
    console.log('✅ 50 recipients created');

    // Create Matchings
    const matchings = [];
    let matchingCount = 0;

    // Create matches for compatible donor-recipient pairs
    for (let i = 0; i < Math.min(recipients.length, organs.length); i++) {
      if (matchingCount >= 30) break;

      const recipient = recipients[i];
      const availableOrgans = organs.filter(o => 
        o.organ_type === recipient.required_organ && 
        o.status === 'Available'
      );

      if (availableOrgans.length > 0) {
        const organ = availableOrgans[0];
        const donor = donors.find(d => d.id === organ.donor_id);

        const { score, status } = calculateCompatibility(donor, recipient, organ);

        if (status !== 'incompatible') {
          const matching = await Matching.create({
            donor_id: donor.id,
            recipient_id: recipient.id,
            organ_id: organ.id,
            compatibility_score: score,
            compatibility_status: status,
            match_date: getRandomDate(new Date(2024, 0, 1), new Date()),
            approval_status: matchingCount < 15 ? 'approved' : matchingCount < 25 ? 'pending' : 'rejected',
            approved_by: matchingCount < 25 ? adminUser.id : null,
            approval_date: matchingCount < 25 ? new Date() : null,
            notes: matchingCount < 15 ? 'Approved for transplant' : matchingCount < 25 ? 'Pending review' : 'Blood compatibility issue'
          });
          matchings.push(matching);
          matchingCount++;
        }
      }
    }
    console.log(`✅ ${matchings.length} matchings created`);

    // Create Transplant Records for approved matchings
    const transplants = [];
    const outcomes = ['successful', 'complicated', 'pending'];
    
    for (let i = 0; i < Math.min(15, matchings.length); i++) {
      const matching = matchings[i];
      if (matching.approval_status === 'approved') {
        const transplantDate = getRandomDate(new Date(2024, 0, 1), new Date());
        const outcome = i < 10 ? 'successful' : getRandomElement(outcomes);
        
        const transplant = await TransplantRecord.create({
          matching_id: matching.id,
          donor_id: matching.donor_id,
          recipient_id: matching.recipient_id,
          hospital_id: hospitals[i % 10].id,
          doctor_id: doctors[i % 20].id,
          transplant_date: transplantDate,
          surgery_duration_hours: parseFloat((4 + Math.random() * 8).toFixed(2)),
          outcome: outcome,
          complications: outcome === 'complicated' ? 'Minor rejection episode managed' : outcome === 'successful' ? 'None' : null,
          follow_up_notes: outcome !== 'pending' ? 'Patient recovering well' : null,
          discharge_date: outcome === 'successful' ? new Date(transplantDate.getTime() + (7 * 24 * 60 * 60 * 1000)) : null
        });
        transplants.push(transplant);
      }
    }
    console.log(`✅ ${transplants.length} transplant records created`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin user: admin@hospital.com / Admin@123`);
    console.log(`   - Hospital staff: staff1@hospital.com to staff5@hospital.com / Staff@123`);
    console.log(`   - Doctors: doctor1@hospital.com to doctor5@hospital.com / Doctor@123`);
    console.log(`   - ${hospitals.length} Hospitals`);
    console.log(`   - ${doctors.length} Doctors`);
    console.log(`   - ${donors.length} Donors`);
    console.log(`   - ${organs.length} Organs`);
    console.log(`   - ${recipients.length} Recipients`);
    console.log(`   - ${matchings.length} Matchings`);
    console.log(`   - ${transplants.length} Transplant Records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
