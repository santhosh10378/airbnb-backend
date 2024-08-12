import { prisma } from "../config/prisma.js";
import { createError } from "../utils/createError.js";

export const removePassword = (user) => {
  if (!user) return null;
  const { password, ...otherDetails } = user;
  return otherDetails;
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw createError(400, "User not found");

  return removePassword(user);
};

export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};
