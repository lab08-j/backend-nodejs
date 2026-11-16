module.exports = {
  async up(db) {
    await db.createCollection("CommentVote");

    await db.collection("CommentVote").createIndex(
      { userId: 1, commentId: 1 },
      {
        unique: true,
        name: "CommentVote_userId_commentId_key",
      },
    );
  },

  async down(db) {
    await db.collection("CommentVote").drop();
  },
};
