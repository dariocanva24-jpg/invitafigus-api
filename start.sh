#!/bin/bash
set -e
echo "Installing dependencies..."
npm install
echo "Generating Prisma Client..."
npx prisma generate
echo "Starting server..."
node server.js