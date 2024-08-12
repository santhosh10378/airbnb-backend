import { prisma } from "../config/prisma.js";
import { createError } from "../utils/createError.js";
import { processImages } from "../utils/filesUtils.js";

// Add a property to the wishlist
export const addToWishlistController = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    if (!propertyId || !userId) {
      throw createError(400, "Property ID and User ID are required");
    }

    // Ensure the composite key matches your Prisma schema
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        propertyId_userId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingWishlist) {
      throw createError(400, "Property is already in the wishlist");
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        propertyId,
      },
    });

    res.status(201).json(wishlist);
  } catch (err) {
    next(err);
  }
};

// Remove a property from the wishlist
export const removeFromWishlistController = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    if (!propertyId) {
      throw createError(400, "Property ID is required");
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        propertyId_userId: {
          userId,
          propertyId,
        },
      },
    });

    if (!wishlistItem) {
      throw createError(404, "Property not found in the wishlist");
    }

    await prisma.wishlist.delete({
      where: {
        id: wishlistItem.id,
      },
    });

    res.status(200).json({ message: "Property removed from wishlist" });
  } catch (err) {
    next(err);
  }
};

// Get all wishlist items for a user
export const getUserWishlistController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        property: true,
      },
    });

    if (wishlist.length > 0) {
      for (const item of wishlist) {
        if (item.property.images && item.property.images.length > 0) {
          item.property.images = await processImages(item.property.images);
        }
      }
    }

    res.status(200).json(wishlist);
  } catch (err) {
    next(err);
  }
};

// Check if a property is in the wishlist
export const isPropertyInWishlistController = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        propertyId_userId: {
          userId,
          propertyId,
        },
      },
    });

    res.status(200).json({ inWishlist: !!wishlist });
  } catch (err) {
    next(err);
  }
};
