import { prisma } from "../config/prisma.js";
import { deleteFileFromS3, uploadFileToS3 } from "../lib/s3Actions.js";
import {
  createPropertyService,
  getPropertiesService,
  getPropertyByIdService,
} from "../services/property.services.js";
import { createError } from "../utils/createError.js";
import { processImages } from "../utils/filesUtils.js";

export const createPropertyController = async (req, res, next) => {
  try {
    const propertyData = req.body;
    const hostId = req.user.id;
    const files = req.files || [];

    const newProperty = await createPropertyService(propertyData, hostId);

    if (files.length > 0) {
      const imageUploadPromises = files.map(async (file) => {
        const key = await uploadFileToS3(file);
        return key;
      });

      const images = await Promise.all(imageUploadPromises);

      await prisma.property.update({
        where: { id: newProperty.id },
        data: { images },
      });
    }

    res.status(201).json(newProperty);
  } catch (error) {
    console.error("Error creating property:", error);
    next(error);
  }
};

export const getPropertiesController = async (req, res, next) => {
  try {
    const queryParams = req.query;
    const properties = await getPropertiesService(queryParams);

    const propertiesWithProcessedImages = await Promise.all(
      properties.map(async (property) => {
        if (property.images && property.images.length > 0) {
          const processedImages = await processImages(property.images);
          return {
            ...property,
            images: processedImages,
          };
        }
        return property;
      })
    );

    res.status(200).json(propertiesWithProcessedImages);
  } catch (error) {
    next(error);
  }
};

export const getSinglePropertyController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await getPropertyByIdService(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Process images for the property
    if (property.images && property.images.length > 0) {
      const processedImages = await processImages(property.images);
      property.images = processedImages;
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

export const deletePropertyController = async (req, res, next) => {
  console.log(req.params);
  try {
    const id = req.params.id;
    const userId = req.user.id;

    console.log({ id, userId });

    // Fetch the property to get image keys and hostId before deleting
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        hostId: true,
        images: true,
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the requester is the host of the property
    if (property.hostId !== userId) {
      throw createError(403, "You are not authorized to delete this property");
    }

    // Delete images from S3 if they exist
    if (property.images && property.images.length > 0) {
      const deleteImagePromises = property.images.map(async (imageKey) => {
        await deleteFileFromS3(imageKey);
      });

      await Promise.all(deleteImagePromises);
    }

    // Delete the property from the database
    await prisma.property.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting property:", error);
    next(error);
  }
};
