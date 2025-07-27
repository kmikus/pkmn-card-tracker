# Deployment Guide: Migrating to PostgreSQL

This guide will help you migrate from SQLite to PostgreSQL for persistent data storage that survives application redeploys.

## Overview

- **Guest users**: Continue using localStorage for temporary storage
- **Authenticated users**: Use PostgreSQL database for persistent storage
- **Backend**: Deployed on Render with PostgreSQL add-on
- **Frontend**: Deployed on Vercel

## Step 1: Set up PostgreSQL Database on Render

1. **Create a new PostgreSQL database on Render:**
   - Go to your Render dashboard
   - Click "New" → "PostgreSQL"
   - Choose a name (e.g., "pkmn-card-tracker-db")
   - Select the free plan
   - Choose your region
   - Click "Create Database"

2. **Get your database connection details:**
   - Once created, click on your database
   - Copy the "External Database URL" (it looks like: `postgres://user:password@host:port/database`)

## Step 2: Update Environment Variables

1. **In your Render backend service:**
   - Go to your backend service settings
   - Add the following environment variable:
     - Key: `DATABASE_URL`
     - Value: The PostgreSQL connection URL from step 1

2. **Verify your existing environment variables:**
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CALLBACK_URL=https://your-backend-url.onrender.com/auth/google/callback
   FRONTEND_URL=https://your-frontend-url.vercel.app
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   ```

## Step 3: Deploy the Updated Backend

1. **Install the new dependencies:**
   ```bash
   cd server
   npm install pg
   ```

2. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Migrate from SQLite to PostgreSQL for persistent storage"
   git push
   ```

3. **Render will automatically redeploy your backend**

## Step 4: Test the Migration

1. **Test guest functionality:**
   - Visit your app without logging in
   - Add some cards to your collection
   - Verify they persist in localStorage
   - Refresh the page to confirm they're still there

2. **Test authenticated functionality:**
   - Log in with Google
   - Add some cards to your collection
   - Verify they're saved to the database
   - Log out and log back in to confirm they persist
   - Try accessing from a different device/browser

## Step 5: Data Migration (Optional)

If you have existing data in your SQLite database that you want to migrate:

1. **Export your SQLite data:**
   ```bash
   # On your local machine
   sqlite3 collection.db ".dump" > backup.sql
   ```

2. **Convert and import to PostgreSQL:**
   ```bash
   # You'll need to manually convert the SQLite dump to PostgreSQL format
   # or use a migration script
   ```

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your database is running on Render
- Ensure SSL is properly configured for production

### Authentication Issues
- Verify your Google OAuth credentials are correct
- Check that your callback URLs match your deployed URLs
- Ensure JWT_SECRET is set

### Performance Issues
- Monitor your database usage on Render
- Consider upgrading from the free plan if you hit limits
- Implement connection pooling if needed

## Benefits of This Setup

1. **Persistent Storage**: Authenticated users' data survives redeploys
2. **Multi-device Sync**: Users can access their collection from any device
3. **Guest Mode**: Non-authenticated users can still use the app locally
4. **Scalability**: PostgreSQL can handle more users and data than SQLite
5. **Backup & Recovery**: Render provides automatic backups

## Cost Considerations

- **Render PostgreSQL Free Plan**: 1GB storage, 90 days retention
- **Upgrade when needed**: $7/month for 1GB storage, 1 year retention
- **Monitor usage**: Check your Render dashboard for current usage

## Next Steps

1. **Monitor your application** for any issues
2. **Set up alerts** for database usage and errors
3. **Consider implementing** data export/import features
4. **Add analytics** to track user engagement
5. **Implement backup strategies** for user data 