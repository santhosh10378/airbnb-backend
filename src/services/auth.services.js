import { prisma } from "../config/prisma.js";
import { generateToken } from "../utils/tokenUtils.js";
import { createError } from "../utils/createError.js";
import { hashPassword, comparePassword } from "../utils/bcryptUtils.js";

export const signUp = async (data) => {
  const { firstName, email, password } = data;
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName,
      email,
      password: hashedPassword,
    },
  });
  const token = generateToken(user.id);
  return { user, token };
};

export const signIn = async (data) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password))) {
    throw createError(400, "Invalid credentials");
  }
  const token = generateToken(user.id);
  return { user, token };
};
