export class UserDTO {
  constructor(user) {
    this.id = (user._id || user.id).toString();
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.role = user.role;
  }

  static from(user) {
    if (!user) return null;
    return new UserDTO(user);
  }

  static fromList(users = []) {
    return users.map((u) => UserDTO.from(u));
  }

  static current(user) {
    if (!user) return null;
    return {
      id: (user._id || user.id).toString(),
      email: user.email,
      role: user.role
    };
  }

  static summary(user) {
    if (!user) return null;
    if (typeof user === 'object' && user._bsontype !== 'ObjectId' && user.email) {
      return {
        id: (user._id || user.id).toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      };
    }
    return user.toString();
  }
}

export default UserDTO;
