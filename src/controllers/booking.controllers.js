// Import necessary modules and utilities
import { prisma } from "../config/prisma.js";
import { createError } from "../utils/createError.js";
import { processImages } from "../utils/filesUtils.js";

// Helper function to validate booking data
const validateBookingData = (data) => {
  const { userId, propertyId, startDate, endDate, totalPrice, nightlyPrice } =
    data;
  if (
    !userId ||
    !propertyId ||
    !startDate ||
    !endDate ||
    !totalPrice ||
    !nightlyPrice
  ) {
    throw createError(400, "Missing required fields");
  }
};

// Controller to create a new booking
export const createBookingController = async (req, res, next) => {
  try {
    const { propertyId, startDate, endDate, totalPrice, nightlyPrice } =
      req.body;
    const userId = req.user.id;

    validateBookingData({
      userId,
      propertyId,
      startDate,
      endDate,
      totalPrice,
      nightlyPrice,
    });

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        propertyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        nightlyPrice,
      },
    });

    res.status(201).json(newBooking);
  } catch (err) {
    next(err);
  }
};

// Controller to get all bookings for a specific property
export const getBookingsByPropertyController = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      throw createError(400, "Property ID is required");
    }

    const bookings = await prisma.booking.findMany({
      where: { propertyId },
    });

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

// Controller to get bookings by host ID
export const getBookingsByHostIdController = async (req, res, next) => {
  try {
    const hostId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        property: { hostId },
      },
      include: { property: true },
      orderBy: {
        startDate: "asc",
      },
    });

    if (bookings.length > 0) {
      for (const booking of bookings) {
        if (booking.property.images && booking.property.images.length > 0) {
          booking.property.images = await processImages(
            booking.property.images
          );
        }
      }
    }

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

// Controller to get bookings by user ID
export const getBookingsByUserIdController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { property: true },
      orderBy: {
        startDate: "asc",
      },
    });

    if (bookings.length > 0) {
      for (const booking of bookings) {
        if (booking.property.images && booking.property.images.length > 0) {
          booking.property.images = await processImages(
            booking.property.images
          );
        }
      }
    }

    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

// Controller to update a booking
export const updateBookingController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, totalPrice, nightlyPrice } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalPrice,
        nightlyPrice,
      },
    });

    res.status(200).json(updatedBooking);
  } catch (err) {
    next(err);
  }
};

// Controller to delete a booking
export const deleteBookingController = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.booking.delete({
      where: { id },
    });

    res.status(204).json({ message: "Unreserved" });
  } catch (err) {
    next(err);
  }
};

// Controller to get unavailable dates for a property
export const getUnavailableDatesController = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      throw createError(400, "Property ID is required");
    }

    const bookings = await prisma.booking.findMany({
      where: { propertyId },
    });

    const unavailableDates = bookings.map((booking) => ({
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));

    res.status(200).json(unavailableDates);
  } catch (err) {
    next(err);
  }
};
