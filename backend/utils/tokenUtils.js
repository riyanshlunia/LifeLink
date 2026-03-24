const jwt = require('jsonwebtoken');

exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.sendTokenResponse = (user, statusCode, res) => {
  const token = this.generateToken(user.id);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      hospital_id: user.hospital_id,
      doctor_id: user.doctor_id
    }
  });
};
