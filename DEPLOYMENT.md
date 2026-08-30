# Deployment Guide: Portfolio Chat App

This guide details how to deploy this full-stack portfolio application **completely free**:
- **Backend (Spring Boot + Maven)**: Deployed on **Render** (Free Web Service tier)
- **Database (PostgreSQL)**: Hosted on **Supabase** (Free PostgreSQL tier)
- **Frontend (React + Vite)**: Deployed on **Vercel** (Free Hobby tier)

---

## IMPORTANT: File Upload Limitation (Render Free Tier)

> [!WARNING]
> **Ephemeral Disk storage**
> The backend saves profile images to `uploads/product-images/` and audio messages to `uploads/audio-messages/`.
> 
> * **The Problem**: Render's free tier uses an ephemeral file system. Every time your web service restarts (which occurs at least once a day, and whenever it wakes up from sleep), all uploaded files are **permanently deleted**.
> * **The Solution**: For a production app, you should migrate file storage to a cloud provider. A great free-tier option is **Supabase Storage** or **Cloudinary**, where you upload files via API instead of saving them locally.
> * **For this Portfolio App**: The app works out of the box, but remember that uploaded profile pictures and voice messages will periodically reset/disappear.

---

## Step 1: Push the Project to GitHub

Before deploying to Vercel and Render, you must host your code on a GitHub repository.

1. Create a new **public or private** repository on [GitHub](https://github.com). Leave it empty (do not initialize with README or `.gitignore`).
2. Open a terminal in the root folder (`C:\Users\Hp\chatappmain`).
3. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "chore: prepare codebase for Vercel and Render deployment"
   ```
4. Link and push to your new GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## Step 2: Create a PostgreSQL Database on Supabase

Supabase offers a generous free tier PostgreSQL database that is perfect for portfolio projects.

1. Sign up or log into [Supabase](https://supabase.com/).
2. On the dashboard, click **New Project** and select your organization.
3. Fill out the project details:
   - **Name**: `chatapp-db`
   - **Database Password**: Set a strong password (copy and save this, you will need to input it on Render!).
   - **Region**: Choose a region close to where you will host your Render backend to minimize network latency.
   - **Plan**: Select **Free**.
4. Click **Create new project** and wait 2–3 minutes for the database to provision.
5. Go to **Project Settings** (gear icon in the sidebar) > **Database**.
6. Under **Connection parameters** and **Connection String**, gather the details to build your credentials for Render:
   - **Host**: E.g., `aws-0-us-west-2.pooler.supabase.com`
   - **Database Name**: `postgres` (default)
   - **Port**: `6543` (for transaction pooling) or `5432` (direct connection, but 6543 is recommended for serverless/hosted services)
   - **User**: E.g., `postgres.yourprojectid`
   - **Password**: The password you set in step 3.

---

## Step 3: Deploy the Backend to Render

1. From the Render Dashboard, click **New +** and select **Web Service**.
2. Choose **Build and deploy from a Git repository**. Connect your GitHub account and select your repository.
3. Configure the Web Service:
   - **Name**: `chatapp-backend`
   - **Region**: Choose a region close to your Supabase region.
   - **Root Directory**: `backend` (This is crucial, as the Spring Boot app is in the `backend/` subfolder).
   - **Language**: `Java` (or Maven if prompted)
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/chatpApp-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: Select **Free**.
4. Scroll down and click **Advanced** to add **Environment Variables**:
   
   | Key | Value | Notes / Example |
   | :--- | :--- | :--- |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST_FROM_SUPABASE:6543/postgres?sslmode=require` | E.g. `jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `postgres.YOUR_PROJECT_ID` | Copy your database user from Supabase settings page |
   | `SPRING_DATASOURCE_PASSWORD` | *Your Supabase Database Password* | The password you entered when creating the Supabase project |
   | `FRONTEND_URL` | `https://your-app-frontend.vercel.app` | *Leave this blank first, and update it once your Vercel frontend is deployed!* |

5. Click **Create Web Service**. 
6. Render will build and deploy the Spring Boot app. Copy the **Live Web Service URL** (e.g., `https://chatapp-backend.onrender.com`).

---

## Step 4: Deploy the Frontend to Vercel

1. Log into your [Vercel](https://vercel.com/) account.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Configure the Vercel project:
   - **Framework Preset**: `Vite` (Vercel automatically detects this)
   - **Root Directory**: `frontend` (This is crucial, as the React code is inside the `frontend/` folder. Click "Edit" and choose `frontend`).
5. Open the **Environment Variables** accordion and add:
   
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://chatapp-backend.onrender.com/api` | Replace with your live Render backend URL, appending `/api` |
   | `VITE_WS_URL` | `https://chatapp-backend.onrender.com/ws` | Replace with your live Render backend URL, appending `/ws` |

6. Click **Deploy**. Vercel will build and publish your React frontend in under 2 minutes. Copy your live Vercel URL (e.g., `https://chatapp-frontend.vercel.app`).

---

## Step 5: Update CORS on the Backend

Now that your frontend is live, you must restrict CORS on the backend to allow your Vercel frontend to make requests.

1. Go to your **Web Service** dashboard on Render.
2. Navigate to **Environment Variables** / **Environment**.
3. Set the `FRONTEND_URL` key to your exact Vercel frontend URL:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://chatapp-frontend.vercel.app` (do not add a trailing slash `/`)
4. Save changes. Render will automatically redeploy the backend with the new configuration.

---

## Step 6: Test and Verify the Deployed Project

1. Open your live Vercel URL in your browser.
2. Register a new user with a profile picture.
3. Open the app in another browser window (or incognito) and register a second user.
4. Try adding each other as friends (use the "+ Find Friends" button).
5. Open a chat, send text messages, and record a voice message (microphone permissions required).
6. Verify that messages are received instantly in real-time (STOMP WebSockets) and audio plays correctly.
