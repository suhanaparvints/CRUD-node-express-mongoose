# Project Review and Fix Status

This document records the issues found in the API and their remediation. The
implementation and endpoint documentation have been updated. Endpoint behavior
was not tested against a live MongoDB instance.

## Findings addressed

| Finding                                                                  | Change made                                                                                                                                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public registration allowed a client to choose the `admin` role.         | Registration rejects a `role` field and always creates users with the `user` role. The model only permits `user` and `admin`.                                                            |
| Admin accounts could be created through public registration.             | Added `npm run seed:admin`, which creates an admin using required environment configuration. It does not promote an existing regular account and is safe to rerun for an existing admin. |
| Login queries passed a string to Mongoose instead of an email filter.    | Both login handlers query with `{ email: normalizedEmail }`; password selection is explicit.                                                                                             |
| User routes allowed one authenticated account to update another account. | User profile routes require a user token and verify its MongoDB ID matches the route ID. Admins use separate admin routes.                                                               |
| Profile replacement could store a submitted password as plaintext.       | Password and role fields are forbidden in profile replacement. Password replacement is not offered by the current API.                                                                   |
| User/update/delete responses could include password data.                | The password field is excluded from standard Mongoose selections, and user responses use an explicit public-field serializer.                                                            |
| Registration validation allowed missing required model fields.           | Registration requires name, age, email, address, and password; age/address limits now match the model.                                                                                   |
| Email case/whitespace handling was inconsistent.                         | Joi validation and Mongoose normalize email values. The schema has a unique email index; duplicate-key errors return `409`.                                                              |
| A user-list failure referenced an undefined `error` variable.            | Removed controller-local catch blocks; asynchronous route failures reach the global error middleware.                                                                                    |
| Health checks reported success without checking MongoDB state.           | `/health` returns `200` only when Mongoose is connected; otherwise it returns `503`.                                                                                                     |
| User and admin JWTs used different identity values.                      | Both token types use the MongoDB document ID in the `id` claim.                                                                                                                          |
| Admin login errors exposed internal details.                             | Unexpected server errors are logged and return a generic `500` response.                                                                                                                 |
| Authorization header documentation/handling was unclear.                 | Protected routes require `Authorization: Bearer <token>`.                                                                                                                                |
| README endpoints and behavior did not match the routes.                  | Updated endpoint paths, payload requirements, admin seeding, ownership, and error behavior in `README.md`.                                                                               |
| Prettier reported formatting issues across the project.                  | Project files were formatted with Prettier.                                                                                                                                              |

## Current endpoint inventory

| Method   | Path                   | Access                              |
| -------- | ---------------------- | ----------------------------------- |
| `GET`    | `/health`              | Public                              |
| `POST`   | `/api/auth/register`   | Public; creates a regular user only |
| `POST`   | `/api/users/login`     | Public                              |
| `POST`   | `/api/admin/login`     | Public                              |
| `PATCH`  | `/api/users/:id`       | Owner of the account                |
| `PUT`    | `/api/users/:id`       | Owner of the account                |
| `GET`    | `/api/admin/users`     | Admin                               |
| `PUT`    | `/api/admin/users/:id` | Admin                               |
| `DELETE` | `/api/admin/users/:id` | Admin                               |

Admin creation is not available through an HTTP endpoint. Use the seed command
documented in `README.md`.

## Follow-up considerations

- Before deploying the email unique index, check existing records for duplicate
  addresses, including duplicates that differ only by case or whitespace, and
  normalize/migrate those records.
- Test the admin seed command and database-backed endpoints against the target
  MongoDB instance before production use.
- Password reset/change functionality is not currently implemented; if added,
  provide a dedicated authenticated flow and never accept or return plaintext
  passwords.
