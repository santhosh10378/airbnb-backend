import { prisma } from "../config/prisma.js";
import { removePassword } from "./user.services.js";

export const createPropertyService = async (propertyData, hostId) => {
  // Convert string fields to the appropriate types
  const {
    price = "0",
    noOfBedrooms = "0",
    noOfBathrooms = "0",
    noOfBeds = "0",
    noOfAdults = "0",
    noOfChildren = "0",
    noOfInfants = "0",
    latitude = "0",
    longitude = "0",
    images,
    ...rest
  } = propertyData;

  const convertedData = {
    ...rest,
    price: parseFloat(price), // Convert to Float
    noOfBedrooms: parseInt(noOfBedrooms, 10), // Convert to Integer
    noOfBathrooms: parseInt(noOfBathrooms, 10), // Convert to Integer
    noOfBeds: parseInt(noOfBeds, 10), // Convert to Integer
    noOfAdults: parseInt(noOfAdults, 10), // Convert to Integer
    noOfChildren: parseInt(noOfChildren, 10), // Convert to Integer
    noOfInfants: parseInt(noOfInfants, 10), // Convert to Integer
    latitude: parseFloat(latitude), // Convert to Float
    longitude: parseFloat(longitude), // Convert to Float
    hostId,
  };

  return await prisma.property.create({
    data: convertedData,
  });
};

export const getPropertiesService = async (queryParams) => {
  const {
    location = "",
    noOfAdults = 1,
    noOfChildren = 0,
    noOfInfants = 0,
    startDate,
    endDate,
    placeType = "any",
    minPrice = 0,
    maxPrice = 10000000000,
    minBedrooms = 0,
    minBathrooms = 0,
    minBeds = 0,
    page = 1,
    pageSize = 10,
    hostId, // Include hostId
    propertyType,
  } = queryParams;

  // Convert parameters to appropriate types
  const parsedMinPrice = parseFloat(minPrice);
  const parsedMaxPrice = parseFloat(maxPrice);
  const parsedMinBedrooms = parseInt(minBedrooms, 10);
  const parsedMinBathrooms = parseInt(minBathrooms, 10);
  const parsedMinBeds = parseInt(minBeds, 10);
  const parsedPage = parseInt(page, 10);
  const parsedPageSize = parseInt(pageSize, 10);
  const parsedNoOfAdults = parseInt(noOfAdults, 10);
  const parsedNoOfChildren = parseInt(noOfChildren, 10);
  const parsedNoOfInfants = parseInt(noOfInfants, 10);

  // Validate and sanitize parameters
  if (
    isNaN(parsedMinPrice) ||
    isNaN(parsedMaxPrice) ||
    isNaN(parsedMinBedrooms) ||
    isNaN(parsedMinBathrooms) ||
    isNaN(parsedMinBeds) ||
    isNaN(parsedPage) ||
    isNaN(parsedPageSize) ||
    isNaN(parsedNoOfAdults) ||
    isNaN(parsedNoOfChildren) ||
    isNaN(parsedNoOfInfants)
  ) {
    throw new Error("Invalid query parameters");
  }

  // Build the whereConditions object
  const whereConditions = {
    ...(location && {
      OR: [
        { address: { contains: location, mode: "insensitive" } },
        { city: { contains: location, mode: "insensitive" } },
        { state: { contains: location, mode: "insensitive" } },
        { country: { contains: location, mode: "insensitive" } },
      ],
    }),
    ...(placeType !== "any" && { placeType }),
    ...(propertyType !== "any" && { propertyType }),
    ...(hostId && { hostId }), // Add hostId condition if provided
    price: {
      gte: parsedMinPrice,
      lte: parsedMaxPrice,
    },
    noOfBedrooms: {
      gte: parsedMinBedrooms,
    },
    noOfBathrooms: {
      gte: parsedMinBathrooms,
    },
    noOfBeds: {
      gte: parsedMinBeds,
    },
    noOfAdults: {
      gte: parsedNoOfAdults,
    },
    noOfChildren: {
      gte: parsedNoOfChildren,
    },
    noOfInfants: {
      gte: parsedNoOfInfants,
    },
  };

  // Check for availability if startDate and endDate are provided
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    whereConditions.AND = [
      {
        bookings: {
          none: {
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start },
              },
            ],
          },
        },
      },
    ];
  }

  // Pagination
  const skip = (parsedPage - 1) * parsedPageSize;
  const take = parsedPageSize;

  const properties = await prisma.property.findMany({
    where: whereConditions,
    orderBy: {
      price: "asc",
    },
    skip,
    take,
  });

  return properties;
};

export const getPropertyByIdService = async (id) => {
  const property = prisma.property.findUnique({
    where: { id },
    include: {
      host: true,
    },
  });

  property.host = removePassword(property.host);

  return property;
};
