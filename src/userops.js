export class OUser {
  constructor(name, username, email) {
    this.name = name;
    this.username = username;
    this.email = email;
  }
  toString() {
    return this.name + ", " + this.username + ", " + this.email;
  }
}

// Firestore data converter
export const userConverter = {
  toFirestore: (ouser) => {
    return {
      name: ouser.name,
      username: ouser.username,
      email: ouser.email,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new OUser(data.name, data.username, data.email);
  },
};
