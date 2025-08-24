# PocketBase Railway Deployment

This directory contains the configuration for deploying PocketBase to Railway.

## Files

- `Dockerfile`: Docker configuration for PocketBase
- `railway.json`: Railway deployment configuration
- `pb_migrations/`: Database migration files

## Deployment Steps

1. Create a new Railway project
2. Connect this directory as the root
3. Railway will automatically use the Dockerfile to build and deploy
4. The app will be available on port 8080

## Environment Variables

No additional environment variables are required for basic deployment.

## Database

PocketBase will automatically create a SQLite database file in the container.
For production, consider using Railway's volume storage for data persistence.