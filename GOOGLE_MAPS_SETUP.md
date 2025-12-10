# Google Maps API Setup Guide

## How to Add Google Maps to Doctor Availability

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Create an API key (Credentials > Create Credentials > API Key)
5. Copy your API key

### Step 2: Add API Key to Environment

1. Open `.env.local` in the frontend folder:
   ```
   c:\Users\Dell\Desktop\git\SkinNova\frontend\.env.local
   ```

2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

3. Save the file

4. Restart the frontend server:
   ```powershell
   cd "c:\Users\Dell\Desktop\git\SkinNova\frontend"
   npm run dev
   ```

### Step 3: Features Available

Once API key is configured:
- ✅ **Map Picker Modal** - Click 🗺️ Map button to open interactive map
- ✅ **Click to Select** - Click on map to set clinic location
- ✅ **Auto-Fill Address** - Reverse geocoding fills address automatically
- ✅ **Search Suggestions** - Type address for auto-complete suggestions

### Features Without API Key

Even without API key, doctors can:
- ✅ Manually type clinic address
- ✅ Save location with time slots
- ✅ View saved locations on availability

### Troubleshooting

**Issue: "Invalid API Key" error in console**
- Make sure you copied the key correctly
- Check APIs are enabled in Google Cloud Console
- Verify key has no extra spaces

**Issue: Map modal shows but map doesn't load**
- Check browser console for errors
- Verify API key is valid
- Check that Maps JavaScript API is enabled

**Issue: Search predictions not working**
- Make sure Places API is enabled
- API key needs Places API permissions

---

**Need Help?** Check the Google Cloud documentation:
https://cloud.google.com/docs/authentication/api-keys
