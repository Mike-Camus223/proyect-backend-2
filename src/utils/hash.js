import bcrypt from 'bcrypt';

// genera el hash del password
export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};
