import Joi from "joi";
import { createError } from "./createError.js";

export const validateSignUp = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(data);

  if (error) throw createError(400, error.details[0].message);
};

export const validateSignIn = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(data);

  if (error) throw createError(400, error.details[0].message);
};

export const propertySchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  propertyType: Joi.string().required(),
  placeType: Joi.string().required(),
  noOfBedrooms: Joi.number().integer().min(1).required(),
  noOfBathrooms: Joi.number().integer().min(1).required(),
  noOfBeds: Joi.number().integer().min(1).required(),
  noOfAdults: Joi.number().integer().min(1).required(),
  noOfChildren: Joi.number().integer().min(0).required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  zipCode: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  amenities: Joi.array().items(Joi.string()).required(),
  nearbyActivities: Joi.array().items(Joi.string()).required(),
  media: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
});
