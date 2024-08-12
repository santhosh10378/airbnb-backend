import {
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createError } from "../utils/createError.js";
import { envVariables } from "./envVariables.js";
import { s3Client } from "../config/s3Client.config.js";

const { AWS_BUCKET } = envVariables();

export const uploadFileToS3 = async (file) => {
  if (!file) {
    throw createError(404, "File not found");
  }

  try {
    const key = `${file.originalname}-${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
      Body: file.buffer,
    });

    await s3Client.send(command);

    return key;
  } catch (error) {
    throw createError(500, `Error uploading file to S3: ${error.message}`);
  }
};

export const getFileFromS3 = async (key) => {
  if (!key) {
    throw createError(404, "Key not found");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return url;
  } catch (error) {
    throw createError(500, `Error getting file from S3: ${error.message}`);
  }
};

export const deleteFileFromS3 = async (key) => {
  if (!key) {
    throw createError(404, "Key not found");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    throw createError(500, `Error deleting file from S3: ${error.message}`);
  }
};
