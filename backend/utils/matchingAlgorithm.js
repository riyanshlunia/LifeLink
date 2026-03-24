exports.calculateCompatibility = (donor, recipient, organ) => {
  let score = 0;
  let status = 'incompatible';

  // Blood group compatibility check
  const bloodCompatibility = checkBloodCompatibility(donor.blood_group, recipient.blood_group);
  
  if (!bloodCompatibility.compatible) {
    return { score: 0, status: 'incompatible', reason: 'Blood group incompatible' };
  }

  score += bloodCompatibility.score;

  // Organ type match
  if (organ.organ_type === recipient.required_organ) {
    score += 40;
  } else {
    return { score: 0, status: 'incompatible', reason: 'Organ type mismatch' };
  }

  // Urgency level bonus
  const urgencyBonus = {
    'critical': 20,
    'high': 15,
    'medium': 10,
    'low': 5
  };
  score += urgencyBonus[recipient.urgency_level] || 0;

  // Age compatibility (closer ages get higher scores)
  const donorAge = calculateAge(donor.date_of_birth);
  const recipientAge = calculateAge(recipient.date_of_birth);
  const ageDiff = Math.abs(donorAge - recipientAge);
  
  if (ageDiff <= 10) {
    score += 10;
  } else if (ageDiff <= 20) {
    score += 5;
  }

  // Determine status based on score
  if (score >= 80) {
    status = 'compatible';
  } else if (score >= 50) {
    status = 'partially_compatible';
  } else {
    status = 'incompatible';
  }

  return { score: Math.min(score, 100), status };
};

const checkBloodCompatibility = (donorBlood, recipientBlood) => {
  const compatibilityMatrix = {
    'O-': { 'O-': 100, 'O+': 100, 'A-': 100, 'A+': 100, 'B-': 100, 'B+': 100, 'AB-': 100, 'AB+': 100 },
    'O+': { 'O+': 90, 'A+': 90, 'B+': 90, 'AB+': 90 },
    'A-': { 'A-': 100, 'A+': 100, 'AB-': 100, 'AB+': 100 },
    'A+': { 'A+': 90, 'AB+': 90 },
    'B-': { 'B-': 100, 'B+': 100, 'AB-': 100, 'AB+': 100 },
    'B+': { 'B+': 90, 'AB+': 90 },
    'AB-': { 'AB-': 100, 'AB+': 100 },
    'AB+': { 'AB+': 90 }
  };

  const score = compatibilityMatrix[donorBlood]?.[recipientBlood] || 0;
  
  return {
    compatible: score > 0,
    score: score * 0.3 // Blood compatibility worth 30 points max
  };
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

exports.calculateAge = calculateAge;
