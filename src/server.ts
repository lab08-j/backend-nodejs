import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  return res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log("servidor rodando");
});
