# Netlify Category Filtering Debug Guide

## 🚨 Problem Summary
- **Localhost**: Shows 4 products correctly for "gourment-cakes" category ✅
- **Netlify**: Shows 8 products (wrong - likely all products or incorrect filtering) ❌

## 🔧 What I've Added for Debugging

### 1. Enhanced Logging in Products API
Added comprehensive logging to `/api/products` that will show in Netlify function logs:
- Environment details
- Category lookup process  
- Product count results
- Filter debugging

### 2. Debug Endpoints
- `/api/debug/category-filter` - Compare different filtering methods
- `/api/debug/gourmet` - Specific gourmet category analysis

## 🚀 Steps to Fix on Netlify

### Step 1: Deploy with Enhanced Debugging
1. Commit and push these changes to GitHub
2. Let Netlify auto-deploy
3. Check Netlify function logs for debugging information

### Step 2: Test the Debug Endpoints on Netlify
Visit these URLs on your Netlify site:
```
https://your-site.netlify.app/api/debug/category-filter?category=gourment-cakes
https://your-site.netlify.app/api/debug/gourmet
```

### Step 3: Check Category Page
Visit: `https://your-site.netlify.app/gourment-cakes`
Check browser network tab to see the API request and response.

### Step 4: Check Netlify Function Logs
1. Go to Netlify Dashboard → Functions → View logs
2. Look for the debug output from the API calls
3. Compare with localhost behavior

## 🔍 Likely Causes and Solutions

### Cause 1: Database Data Differences
**Symptoms**: Different product count between localhost and Netlify
**Solution**: Ensure both environments use the same MongoDB database

**Check**: Compare the debug outputs - if product counts differ, this is the issue.

### Cause 2: Environment Variables
**Symptoms**: API calls fail or return unexpected results
**Solution**: Verify these env variables are set correctly in Netlify:
- `MONGODB_URI`
- `NEXT_PUBLIC_API_URL`

### Cause 3: Category Slug Mismatch  
**Symptoms**: "Category not found" in logs
**Solution**: The category might have a different slug on Netlify database

## 🎯 Quick Fix Commands

If you need to quickly fix the issue on Netlify, you can:

### Option A: Force Correct Category Filter
Update the category page to use ObjectId directly instead of slug resolution.

### Option B: Add Fallback Logic
Add fallback logic to handle case where category filtering fails.

## 📞 Need Help?
1. Share the output from the Netlify debug endpoints
2. Share the Netlify function logs
3. I'll provide the exact fix based on what we find

---

**Next**: Deploy these changes and run the debug endpoints on Netlify!
