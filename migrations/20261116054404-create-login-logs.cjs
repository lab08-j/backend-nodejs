module.exports = {
  async up(db) {
    await db.createCollection("LoginLog");
  },

  async down(db) {
    await db.collection("LoginLog").drop();
  },
};
