module.exports = {
  async up(db) {
    await db.createCollection("RefreshToken");

    await db
      .collection("RefreshToken")
      .createIndex({ tokenHash: 1 }, { unique: true, name: "RefreshToken_tokenHash_key" });

    await db
      .collection("RefreshToken")
      .createIndex({ userId: 1 }, { name: "RefreshToken_userId_idx" });
  },

  async down(db) {
    await db.collection("RefreshToken").drop();
  },
};
