# CRUD Node, Express, and MongoDB API

A JSON REST API for registering and authenticating users and managing user
records. It uses Node.js, Express, MongoDB, and Mongoose, with Joi request
validation, bcrypt password hashing during registration, and JWT-based
authentication.

## Features

- User registration and login
- Admin login and user administration
- JWT authentication with separate user and admin login routes
- Joi validation for registration and user update requests
- MongoDB persistence with Mongoose
- CORS, Helmet, and Morgan middleware
- Database-aware health endpoint

## Requirements

- Node.js and npm
- A MongoDB instance (local or hosted)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root (next to `package.json`) and
   configure MongoDB, the database name, and a long random `JWT_SECRET`.
   Keep `.env` private; it is ignored by Git.

   ```dotenv
   MONGODB_URI=mongodb://127.0.0.1:27017
   DATABASE=crud_app
   JWT_SECRET=replace-with-a-long-random-secret
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

3. Start the server:

   ```bash
   npm run dev
   ```

   For a regular start, use `npm start`. The API is available at
   `http://localhost:<PORT>` (default port `3000`).

## Configuration

| Variable      | Required | Description                                                                                |
| ------------- | -------- | ------------------------------------------------------------------------------------------ |
| `MONGODB_URI` | Yes      | MongoDB connection URI.                                                                    |
| `DATABASE`    | Yes      | Database name passed to Mongoose.                                                          |
| `JWT_SECRET`  | Yes      | Secret used to sign and verify JWTs.                                                       |
| `PORT`        | No       | HTTP port; defaults to `3000`.                                                             |
| `CORS_ORIGIN` | No       | Allowed CORS origin. If omitted, CORS allows all origins.                                  |
| `NODE_ENV`    | No       | Uses combined Morgan logging when set to `production`; otherwise uses development logging. |

## API

Request and response bodies use JSON. Protected endpoints require the JWT
returned by a login endpoint:

```http
Authorization: Bearer <token>
```

| Method   | Path                   | Access                    | Description                                                                    |
| -------- | ---------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `GET`    | `/health`              | Public                    | Return server status and the connected database name.                          |
| `POST`   | `/api/auth/register`   | Public                    | Register a user. The request can currently choose `user` or `admin` role.      |
| `POST`   | `/api/users/login`     | Public                    | Log in with an account whose role is `user`.                                   |
| `POST`   | `/api/admin/login`     | Public                    | Log in with an account whose role is `admin`.                                  |
| `PATCH`  | `/api/users/:id`       | Any authenticated account | Update the name on the specified user record. No ownership check is performed. |
| `PUT`    | `/api/users/:id`       | Any authenticated account | Update the specified user record. No ownership check is performed.             |
| `GET`    | `/api/admin/users`     | Admin                     | List users without the password field.                                         |
| `PUT`    | `/api/admin/users/:id` | Admin                     | Update the specified user record.                                              |
| `DELETE` | `/api/admin/users/:id` | Admin                     | Delete the specified user record.                                              |

The `:id` parameter is the MongoDB document `_id` (a 24-character hexadecimal
ObjectId), not the `userId` UUID.

### Health check

```http
GET /health
```

The server connects to MongoDB before it starts listening. When the endpoint
responds, it returns HTTP `200`:

```json
{
  "status": "OK",
  "message": "The server is running",
  "database": "crud_app"
}
```

### Register a user

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Jane Doe",
  "age": 30,
  "email": "jane@example.com",
  "address": "123 Main Street",
  "password": "StrongPassword1!",
  "role": "user"
}
```

The model requires `name`, `age`, `email`, `address`, and `password`. The
registration validator requires `name`, `email`, and `password`, while `age`
and `address` are optional at validation time; include all five fields to
avoid a database validation error. Registration passwords must include an
uppercase letter, lowercase letter, number, special character from
`@$!%*?&`, and be at least six characters long.

The optional `role` currently accepts `user` or `admin` and defaults to
`user`. The API does not currently have a seed command or restrict public
registration from creating admins. Do not expose this registration behavior
to untrusted clients until role assignment is restricted.

Successful response:

```json
{
  "status": "ok",
  "message": "successfully registered"
}
```

### Log in

Both login endpoints accept an email and password:

```json
{
  "email": "jane@example.com",
  "password": "StrongPassword1!"
}
```

Use `/api/users/login` for role `user` and `/api/admin/login` for role
`admin`. User tokens expire after one hour; admin tokens expire after one day.
The user token's `id` claim contains the MongoDB `_id`; the admin token's `id`
claim contains the `userId` UUID. Tokens are verified cryptographically by
middleware; middleware does not check whether the account still exists.

### Update a user

Update a name:

```http
PATCH /api/users/<mongo-document-id>
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Jane Smith"
}
```

The patch body allows a name from 1 to 100 letters/spaces. Any authenticated
token can currently target any document ID; the controller does not enforce
account ownership.

`PUT /api/users/<mongo-document-id>` and
`PUT /api/admin/users/<mongo-document-id>` require all of these fields:

```json
{
  "name": "Jane Smith",
  "age": 30,
  "email": "jane@example.com",
  "address": "123 Main Street",
  "password": "StrongPassword1!"
}
```

The full-update validator requires a name, integer age from 10 to 150, email,
address, and password. Note that the current update controller does not hash
the supplied password; avoid sending password values to these endpoints.

### Admin operations

Admin endpoints require a valid token whose role claim is `admin`.

```http
GET /api/admin/users
Authorization: Bearer <admin-token>
```

The list response contains a `data` array and excludes the password field:

```json
{
  "status": "OK",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "0190...",
      "name": "Jane Doe",
      "age": 30,
      "email": "jane@example.com",
      "address": "123 Main Street",
      "role": "user"
    }
  ]
}
```

Delete a user with:

```http
DELETE /api/admin/users/<mongo-document-id>
Authorization: Bearer <admin-token>
```

### Validation and errors

Joi validation failures return HTTP `400` with a `details` array:

```json
{
  "status": "ERROR",
  "message": "Validation failed",
  "details": ["\"name\" is required"]
}
```

Authentication middleware returns `401` when the authorization header is
missing and `403` for invalid or expired tokens. Login endpoints return
`401` for invalid credentials and `403` for a role mismatch. Controller errors
currently use route-specific responses and status codes; there is no
centralized error handler. Invalid IDs or missing records may currently return
`400` from the update/delete controllers rather than a consistent `404`.

## User fields

| Field                    | Notes                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `userId`                 | UUID v7 generated by registration; unique in MongoDB.                                         |
| `name`                   | Required by the model.                                                                        |
| `age`                    | Required by the model.                                                                        |
| `email`                  | Required by the model; no unique constraint is configured.                                    |
| `address`                | Required by the model.                                                                        |
| `password`               | Required by the model; registration hashes it with bcrypt.                                    |
| `role`                   | `admin`, `user`, or `guest`; defaults to `user`. Registration accepts only `admin` or `user`. |
| `createdAt`, `updatedAt` | Added automatically by Mongoose timestamps.                                                   |

## Project structure

```text
src/
  config/       MongoDB connection
  controllers/  Authentication and user handlers
  middleware/   JWT authentication and request validation
  models/       Mongoose user model
  routes/       Express API routes
  validators/   Joi request schemas
  server.js     Application setup and startup
```

## Available scripts

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| `npm start`            | Start the API with Node.js.       |
| `npm run dev`          | Start the API with nodemon.       |
| `npm run format`       | Format the project with Prettier. |
| `npm run format:check` | Check formatting with Prettier.   |

## Important implementation notes

- Public registration currently allows requesting the `admin` role. There is no
  admin seed script in this project; restrict role assignment before deploying
  with untrusted clients.
- User update routes authenticate the caller but do not verify that the caller
  owns the target record.
- The full-update controller assigns the supplied password directly rather
  than hashing it. Do not use it to change passwords.
- The name-update and delete controllers return user documents without
  excluding the password field. Registration hashes passwords, but those
  responses can expose password hashes. The admin list endpoint is the only
  user-returning handler that explicitly excludes the password field.
- Email is not marked unique in the Mongoose schema, so duplicate email
  addresses are not prevented by a database index.
