import jwt from "jsonwebtoken";
import { envVariables } from "../lib/envVariables.js";

const { JWT_SECRET } = envVariables();

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
