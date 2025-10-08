import 'dotenv/config'

import * as joi from 'joi'

interface Envs {
  NODE_ENV: string
  PORT: string
  DATABASE_HOST: string
  DATABASE_PORT: string
  DATABASE_USER: string
  DATABASE_PASSWORD: string
  DATABASE_NAME: string
  API_URL: string
}
const envSchema = joi
  .object({
    NODE_ENV: joi.string().required(),
    PORT: joi.string().required(),
    DATABASE_HOST: joi.string().required(),
    DATABASE_PORT: joi.string().required(),
    DATABASE_USER: joi.string().required(),
    DATABASE_PASSWORD: joi.string().required(),
    DATABASE_NAME: joi.string().required(),
    API_URL: joi.string().required(),
  })
  .unknown(true)

const { error, value } = envSchema.validate({
  ...process.env,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
  API_URL: process.env.API_URL,
})

if (error) throw new Error('Config validation issue ' + error.message)

export const env: Envs = value