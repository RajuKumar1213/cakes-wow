# 🔧 VERCEL CLOUDINARY ENVIRONMENT VARIABLES FIX

## Problem
Getting error: **"Failed to process image upload: Must supply api_key"** on Vercel deployment, but it works fine locally.

## Root Cause
Cloudinary environment variables from your `.env.local` file are not automatically transferred to Vercel. They need to be manually configured in your Vercel dashboard.

## ✅ Solution - Step by Step

### 1. Access Your Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find and click on your **bakingo-clone** project

### 2. Navigate to Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar

### 3. Add Cloudinary Variables
Add these **3 environment variables** exactly as shown:

#### Variable 1:
- **Name**: `CLOUDINARY_CLOUD_NAME`
- **Value**: `dykqvsfd1`
- **Environment**: Select **Production**, **Preview**, and **Development**

#### Variable 2:
- **Name**: `CLOUDINARY_API_KEY`
- **Value**: `825164168851237`
- **Environment**: Select **Production**, **Preview**, and **Development**

#### Variable 3:
- **Name**: `CLOUDINARY_API_SECRET`
- **Value**: `6Hcp0uviKRLGb0SVE8USJ-Wqfzk`
- **Environment**: Select **Production**, **Preview**, and **Development**

### 4. Redeploy Your Application
After adding all variables:
1. Go to **Deployments** tab
2. Click the **3 dots** on your latest deployment
3. Click **Redeploy**
4. Or make a new commit to trigger automatic deployment

## 🧪 Verification

### Test Locally (Should Work)
```bash
cd bakingo-clone
node test-cloudinary-config.js
```

### Test on Vercel (After Environment Variables Setup)
1. Try uploading an image through your deployed app
2. Check Vercel Function Logs for any errors
3. Should see successful image uploads

## 📋 Environment Variables Checklist

Make sure you have these in **Vercel Dashboard**:
- ✅ `CLOUDINARY_CLOUD_NAME = dykqvsfd1`
- ✅ `CLOUDINARY_API_KEY = 825164168851237`
- ✅ `CLOUDINARY_API_SECRET = 6Hcp0uviKRLGb0SVE8USJ-Wqfzk`

## 🔍 Troubleshooting

### Still Getting API Key Error?
1. **Double-check** variable names (no typos)
2. **Ensure** all 3 environments are selected (Production, Preview, Development)
3. **Wait** 1-2 minutes after adding variables
4. **Redeploy** the application
5. **Check** Vercel Function Logs for detailed error messages

### Check Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Look for `/api/products` function
4. Check logs for Cloudinary-related errors

## 🚀 Expected Result
After following these steps:
- ✅ Image uploads work on Vercel
- ✅ No "Must supply api_key" errors
- ✅ Product creation with images succeeds
- ✅ Both local and production environments work

---

**Note**: Your `.env.local` file is not deployed to Vercel for security reasons. Environment variables must be manually configured in the Vercel dashboard.
