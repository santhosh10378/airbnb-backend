import { getFileFromS3 } from "../lib/s3Actions.js";

export const processImages = async (images) => {
  try {
    return Promise.all(
      images.map(async (image) => {
        return await getFileFromS3(image);
      })
    );
  } catch (error) {
    throw new Error(`Error processing images: ${error.message}`);
  }
};
