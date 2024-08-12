import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { envVariables } from "../lib/envVariables.js";

const { PORT, CORS_ORIGIN } = envVariables();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

export { app, PORT };
