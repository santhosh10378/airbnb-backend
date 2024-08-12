import { signUp, signIn } from "../services/auth.services.js";
import { getUserByEmail, removePassword } from "../services/user.services.js";
import { createError } from "../utils/createError.js";
import { validateSignUp, validateSignIn } from "../utils/validationUtils.js";

export const signUpController = async (req, res, next) => {
  console.log(req.body);
  try {
    const existingUser = await getUserByEmail(req.body.email);
    if (existingUser) {
      throw createError(400, "User already exists");
    }

    validateSignUp(req.body);

    const { user, token } = await signUp(req.body);
    res
      .cookie("authToken", token, { httpOnly: true })
      .status(201)
      .json(removePassword(user));
  } catch (err) {
    next(err);
  }
};

export const signInController = async (req, res, next) => {
  try {
    const existingUser = await getUserByEmail(req.body.email);
    if (!existingUser) {
      throw createError(400, "User not found");
    }

    validateSignIn(req.body);

    const { user, token } = await signIn(req.body);
    res
      .cookie("authToken", token, { httpOnly: true })
      .status(200)
      .json(removePassword(user));
  } catch (err) {
    next(err);
  }
};

export const signOutController = async (req, res, next) => {
  try {
    res
      .clearCookie("authToken", { httpOnly: true })
      .status(200)
      .json({ message: "Signed out successfully" });
  } catch (err) {
    next(err);
  }
};

export const profileController = async (req, res, next) => {
  const user = req.user;

  try {
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
