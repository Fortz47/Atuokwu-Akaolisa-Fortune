import express from "express";
import { userRouter } from "./Routes/user";
import DB from './Storage/db';
import redisClient from './Storage/redis';
import dbConfig from "./Configs/db.Config";

const app = express();

app.use(express.json());
app.use('/user', userRouter);

(async () => {
  // @ts-ignore
  await DB.connectDB(dbConfig.url);
  await redisClient.connectRedis();
})();

app.listen('5000', () => {
  console.log(`server running on port 5000`);
})