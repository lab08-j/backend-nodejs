module.exports = {
  async up(db) {
    await db.createCollection("Comment");
  },

  async down(db) {
    await db.collection("Comment").drop();
  },
};
