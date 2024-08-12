import { createError } from "../utils/createError.js";
import { getUserById } from "../services/user.services.js";
import { verifyToken } from "../utils/tokenUtils.js";

export const verifyAuthToken = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      throw createError(401, "Token not found");
    }

    const decoded = verifyToken(token);
    const user = await getUserById(decoded.userId);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
