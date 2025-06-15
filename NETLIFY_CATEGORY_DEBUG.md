# 🐛 Netlify Category Filtering Debug Guide

## Problem
- **Localhost**: Shows 4 products correctly for gourmet category
- **Netlify**: Shows 8 products (wrong filtering)

## Debug Steps

### 1. Test the Debug Endpoints

After deploying to Netlify, test these URLs:

```bash
# General debug endpoint
https://your-site.netlify.app/api/debug/netlify?category=gourment-cakes

# Gourmet-specific debug
https://your-site.netlify.app/api/debug/gourmet

# Products API with debugging
https://your-site.netlify.app/api/products?category=gourment-cakes&limit=10
```

### 2. Check Netlify Logs

1. Go to your Netlify dashboard
2. Navigate to **Site** → **Functions** → **Logs**
3. Look for console.log outputs with these prefixes:
   - `🔍 [NETLIFY-DEBUG]`
   - `📦 Query Results:`
   - `✅ Found category:`

### 3. Common Causes & Solutions

#### Cause 1: Database Differences
**Symptoms**: Different product counts between localhost and Netlify
**Solution**: Both environments might be using different MongoDB databases

**Check**: Compare the debug endpoint results:
- Localhost: `http://localhost:3000/api/debug/netlify`
- Netlify: `https://your-site.netlify.app/api/debug/netlify`

#### Cause 2: Environment Variables
**Symptoms**: Category lookup fails or returns wrong results
**Solution**: Ensure these are set in Netlify:
```
MONGODB_URI=your_production_mongodb_uri
NODE_ENV=production
```

#### Cause 3: MongoDB ObjectId Issues
**Symptoms**: Category filter doesn't work properly
**Solution**: The enhanced filter utility handles ObjectId conversion better

#### Cause 4: Caching Issues
**Symptoms**: Old data being served
**Solution**: Clear Netlify cache and redeploy

### 4. Quick Fixes to Try

#### Fix 1: Update Products API (Already Applied)
The products API now has enhanced debugging that will show exactly what's happening.

#### Fix 2: Use Enhanced Filter Utility
```javascript
// In your products API, replace the filter creation with:
import { createEnhancedProductFilters } from '@/lib/enhancedProductUtils';

// Replace this line:
const filters = createProductFilters({...});

// With this:
const filters = createEnhancedProductFilters({...});
```

#### Fix 3: Force Category Refresh
Add this to your category page to bypass cache:
```javascript
// Add cache busting to fetch calls
const response = await fetch(`${baseUrl}/api/products?category=${categorySlug}&t=${Date.now()}`);
```

### 5. Database Verification

If the issue persists, verify your production database:

1. **Check if you're using the correct MongoDB database**
2. **Verify product-category associations are correct**
3. **Ensure the gourmet category exists with correct slug**

### 6. Expected Debug Output

When working correctly, you should see:
```json
{
  "success": true,
  "data": {
    "environment": "production",
    "categoryInfo": {
      "_id": "683d30539d7c08dc534ac17b",
      "name": "Gourment Cakes",
      "slug": "gourment-cakes"
    },
    "tests": {
      "mongoDirectQuery": {
        "count": 4,
        "products": [...]
      },
      "jsFiltering": {
        "totalProducts": 14,
        "filteredCount": 4,
        "products": [...]
      }
    }
  }
}
```

### 7. If Nothing Works

1. **Check if both environments use the same database**
2. **Compare the actual MongoDB queries being executed**
3. **Verify the category ObjectId is identical in both environments**

## Next Steps

1. Deploy these debug endpoints to Netlify
2. Test the debug URLs above
3. Compare localhost vs Netlify results
4. Share the debug output to identify the exact issue

---

**Quick Test Command:**
```bash
# Test localhost
curl "http://localhost:3000/api/debug/netlify?category=gourment-cakes"

# Test Netlify (replace with your URL)
curl "https://your-site.netlify.app/api/debug/netlify?category=gourment-cakes"
```
