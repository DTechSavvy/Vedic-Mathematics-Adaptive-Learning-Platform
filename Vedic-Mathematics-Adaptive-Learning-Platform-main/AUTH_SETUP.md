# DWANDA Auth Setup

## Backend

1. Copy `Backend/.env.example` to `Backend/.env` and fill the values.
2. Ensure PostgreSQL is running and `DATABASE_URL` points at the DWANDA database.
3. Run Prisma migrations: `npx prisma migrate deploy` or `npx prisma migrate dev`.
4. Start the backend: `npm run start:dev`.

## Google OAuth

1. Create a Google Cloud OAuth client at https://console.cloud.google.com/apis/credentials.
2. Add `http://localhost:3000/auth/google/callback` to Authorized redirect URIs.
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `Backend/.env`.
4. Make sure `CLIENT_URL` matches the frontend origin.

## Frontend

1. Copy `vedic-math-ai-tutor/.env.example` to `vedic-math-ai-tutor/.env` if needed.
2. Start the frontend: `npm run dev`.
3. Register or sign in normally, or click Google Continue.

## Notes

- The backend issues the normal DWANDA JWT after local or Google login.
- Protected routes rely on the JWT from the Authorization header.
- Do not share secrets in source control.
