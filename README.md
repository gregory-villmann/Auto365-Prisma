# Auto365 Prisma Backend

This project is a sample backend application using Express JS (using TS), Prisma.IO and Sqlite.
The application itself is a simple CRUD app.

## Frontend

To test this application I also made a simple angular app. The FE is available
here: https://github.com/gregory-villmann/Cars365-FE/

## Installation Guide

* Make sure that your Node.js version is v18.12.1 or newer
    * You can verify your Node version by running `node -v` in cmd :)

1. In project root run `npm install` to install dependencies
2. Generate .key and .crt files to enable HTTPS
    * Run `openssl genrsa -out ./certs/server.key 2048`
    * Run `openssl x509 -req -in ./certs/server.csr -signkey ./certs/server.key -out ./certs/server.crt`
3. Then run `npx prisma generate`, to generate the prisma schema
4. Then run `npm run build` to build the project

## Development server

Run `npm run start` to start the server at http://localhost:3000.

## Documentation

To see Swagger documentation visit http://localhost:3000/api-docs/