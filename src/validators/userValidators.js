import Joi from "joi";

const id = Joi.string().guid().required();

export const updateNameSchema = {
  params: Joi.object({
    id,
  }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
  }),
};

export const replaceUserSchema = {
  params: Joi.object({
    id,
  }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    age: Joi.number().integer().min(1).max(150).required(),
    email: Joi.string().trim().email().required(),
    address: Joi.string().trim().min(1).max(300).required(),
    password: Joi.string().min(6).max(128).required(),
  }),
};

export const deleteUserSchema = {
  params: Joi.object({
    id,
  }),
};
