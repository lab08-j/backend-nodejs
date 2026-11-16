module.exports = {
  async up(db) {
    await db.createCollection("User");

    await db.collection("User").createIndex({ email: 1 }, { unique: true, name: "User_email_key" });
  },

  async down(db) {
    await db.collection("User").drop();
  },
};
