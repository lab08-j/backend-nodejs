import 'dotenv/config';
import express from 'express';
import router from "./routers/routes";
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandlers.ts';
import { createServer } from 'node:http';


const app = express();
const port = process.env.PORT || 3001;
const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/api', router);
app.use(errorHandler);

app.get("/", (req, res) => {

res.send("Hello World! NodeJS.");

});

server.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
