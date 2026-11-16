import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  return res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log("servidor rodando");
});
