# 🚀 Deployment Guide: Helpdesk App

This guide walks you through deploying your MERN stack application.
**Architecture:**
*   **Frontend:** Netlify (Free Tier)
*   **Backend:** Render (Free Tier)
*   **Database:** MongoDB Atlas (Cloud)

---

## � Phase 0: Git Setup (Run these commands locally)

Before deploying, you must push your code to GitHub.

1.  **Initialize Git:**
    Open your terminal in `d:\VSCode\NM-IBM\helpdesk` and run:
    ```sh
    git init
    ```

2.  **Add Files:**
    ```sh
    git add .
    ```

3.  **Commit Changes:**
    ```sh
    git commit -m "Initial commit - Helpdesk App Ready for Deployment"
    ```

4.  **Connect to GitHub:**
    *   Go to [GitHub.com](https://github.com/new) and create a new repository (e.g., `helpdesk-mern`).
    *   **Copy the URL** (e.g., `https://github.com/Startdust48/helpdesk-mern.git`).
    *   Run these commands (replace URL with yours):
    ```sh
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/helpdesk-mern.git
    git push -u origin main
    ```

---

## �📦 Phase 1: Backend Deployment (Render)

1.  **Push Code to GitHub:**
    *   Ensure your project is in a GitHub repository.
    *   Make sure `helpdesk-backend` is in the root or you know the path.

2.  **Create Service on Render:**
    *   Go to [dashboard.render.com](https://dashboard.render.com).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

3.  **Configure Settings:**
    *   **Name:** `helpdesk-api` (or unique name)
    *   **Root Directory:** `helpdesk-backend` (Important!)
    *   **Runtime:** Node
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start` (Make sure package.json scripts are correct)

4.  **Environment Variables:**
    *   Add the following vars in the "Environment" tab:
        *   `NODE_ENV`: `production`
        *   `MONGO_URI`: (Your MongoDB Atlas connection string)
        *   `JWT_SECRET`: (A strong secret key)
        *   `PORT`: `10000` (Render default is 10000)

5.  **Deploy:**
    *   Click **Create Web Service**. Wait for it to build and go live.
    *   **Copy the URL** (e.g., `https://helpdesk-api.onrender.com`). You need this for Phase 2.

> **⚠️ Important Note:** Render's free tier spins down after inactivity. The first request might take 30-50s to wake up. Also, **files uploaded using Multer will disappear** when the server restarts. For production, integrate Cloudinary.

---

## 🌐 Phase 2: Frontend Deployment (Netlify)

1.  **Prepare Code:**
    *   I have already refactored the frontend to look for `VITE_API_URL`.
    *   Ensure `dist` folder is added to `.gitignore` (standard practice).

2.  **Create Site on Netlify:**
    *   Go to [app.netlify.com](https://app.netlify.com).
    *   Click **"Add new site"** -> **"Import from Git"**.
    *   Choose your GitHub repository.

3.  **Configure Build:**
    *   **Base directory:** `helpdesk-app`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`

4.  **Environment Variables:**
    *   Click **"Advanced"** -> **"New Variable"**.
    *   **Key:** `VITE_API_URL`
    *   **Value:** (The Render Backend URL from Phase 1, e.g., `https://helpdesk-api.onrender.com`) - **No trailing slash!**

5.  **Deploy:**
    *   Click **Deploy Site**.

---

## ✅ Phase 3: Verification

1.  Open your **Netlify URL**.
2.  Try to **Register** a new user (this tests DB connection).
3.  Login and perform an action.
4.  **Note:** If the backend is "asleep", the login might timeout the first time. Try again after 1 minute.

---

## 📚 Appendix: How to get MongoDB Connection String

1.  **Log in** to [MongoDB Atlas](https://cloud.mongodb.com).
2.  **Network Access (Important):**
    *   Click **Network Access** in the left sidebar.
    *   Click **Add IP Address** -> Select **"Allow Access from Anywhere"** (0.0.0.0/0).
    *   *Reason:* Render's IP changes, so we need open access (protected by your strong password).
3.  **Database Access:**
    *   Click **Database Access**.
    *   Create a database user (e.g., `admin`) and set a **Password**.
    *   **Remember this password!**
4.  **Get String:**
    *   Click **Database** (left sidebar) -> **Connect** (button on your cluster).
    *   Select **Drivers** (Node.js).
    *   **Copy connection string**. It looks like:
        `mongodb+srv://admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
    *   **Replace `<password>`** with the actual password you created in step 3.
