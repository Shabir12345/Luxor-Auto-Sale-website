# 🔧 Bcrypt Build Error Fix

## Problem
When trying to add a vehicle in the admin panel, you got this error:
```
Module parse failed: Unexpected token (1:0)
./node_modules/@mapbox/node-pre-gyp/lib/util/nw-pre-gyp/index.html
```

## Root Cause
- `bcrypt` is a native Node.js module that needs to be compiled
- Next.js webpack tries to bundle everything, including bcrypt's internal files
- This causes conflicts with HTML files in the `node-pre-gyp` package

## Solution Applied ✅

### 1. Updated `next.config.js`
Added webpack configuration to:
- Treat bcrypt as an external module (don't bundle it)
- Ignore HTML files in node_modules

### 2. Installed `ignore-loader`
```bash
npm install --save-dev ignore-loader
```

## Testing
After the fix:
1. Restart your development server (Ctrl+C, then `npm run dev`)
2. Go to `/admin/vehicles/new`
3. Try adding a vehicle
4. Should work without errors!

## Technical Details
The webpack config now includes:
```javascript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push({
      'bcrypt': 'commonjs bcrypt',
    });
  }
  
  config.module.rules.push({
    test: /\.html$/,
    loader: 'ignore-loader',
  });

  return config;
}
```

This tells Next.js:
- On the server side, use bcrypt as-is (don't bundle it)
- Ignore any `.html` files during webpack bundling

## If You Still See Errors
1. **Hard refresh:** Ctrl+F5 in your browser
2. **Clear Next.js cache:** `rm -rf .next` (or delete `.next` folder)
3. **Reinstall dependencies:** `npm install`
4. **Rebuild bcrypt:** `npm rebuild bcrypt`

## Why This Happens
- Bcrypt uses native C++ bindings for password hashing
- It needs to be compiled for your specific OS (Windows/Mac/Linux)
- Next.js tries to bundle it with other JavaScript, which doesn't work
- By externalizing it, we tell Next.js to leave bcrypt alone

## Related Files Changed
- `next.config.js` - Added webpack configuration
- `package.json` - Added `ignore-loader` dev dependency

---

**Status:** ✅ Fixed and ready to use!

