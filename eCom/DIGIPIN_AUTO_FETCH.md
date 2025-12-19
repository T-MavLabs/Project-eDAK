# DIGIPIN Auto-Fetch Feature

## Overview

The VYAPAR platform now includes automatic DIGIPIN (India Address Code) fetching functionality. Users can automatically retrieve their DIGIPIN either by entering their address details or by using their device's location.

## API Integration

**API Base URL**: `https://my-digipin.onrender.com`

### Endpoints

1. **`/digipin/encode`** - Convert coordinates to DIGIPIN
   - Input: `{ latitude: number, longitude: number }`
   - Output: `{ digipin: string }`

2. **`/digipin/decode`** - Convert DIGIPIN to coordinates
   - Input: `{ digipin: string }`
   - Output: `{ latitude: number, longitude: number }`

### Address-based Fetching

Since the API only supports coordinate-based encoding, address-based fetching:
1. First geocodes the address using Nominatim (OpenStreetMap)
2. Then uses `/digipin/encode` with the obtained coordinates

## Features

### 1. Automatic Fetching
- **Auto-fetch on address completion**: When user fills in address, city, state, and PIN code, DIGIPIN is automatically fetched after 1 second of inactivity (debounced)
- **Silent failure**: Auto-fetch errors don't show to user (they can manually fetch)

### 2. Manual Fetching Options
- **Fetch by Address** (MapPin icon): Fetches DIGIPIN using the entered address details
- **Fetch by Location** (Navigation icon): Uses device geolocation to fetch DIGIPIN

### 3. User Experience
- Loading states with spinner icons
- Error messages for failed fetches
- Success indicators when DIGIPIN is fetched
- Input field disabled during fetch operations

## Implementation

### Files Created

1. **`lib/digipin.ts`**
   - `fetchDigipinByAddress()` - Fetch using address details
   - `fetchDigipinByLocation()` - Fetch using geolocation
   - `autoFetchDigipin()` - Smart auto-fetch with fallbacks

2. **`components/DigipinInput.tsx`**
   - Reusable DIGIPIN input component with auto-fetch buttons
   - Can be used in any form that needs DIGIPIN

### Files Modified

1. **`app/(commerce)/market/checkout/page.tsx`**
   - Added DIGIPIN auto-fetch functionality
   - Two buttons next to DIGIPIN input:
     - MapPin icon: Fetch from address
     - Navigation icon: Fetch from location
   - Auto-fetch on address field changes (debounced)

## Usage

### In Checkout Page

The checkout page automatically:
1. Watches for address field changes
2. Auto-fetches DIGIPIN when address is complete
3. Provides manual fetch buttons for user control

### Using the Reusable Component

```tsx
import { DigipinInput } from "@/components/DigipinInput";

<DigipinInput
  value={digipin}
  onChange={setDigipin}
  address={addressLine1}
  city={city}
  state={state}
  pincode={pincode}
  showAutoFetch={true}
/>
```

## API Request/Response Format

### Request (Address-based)
```json
{
  "address": "Flat 12B, Sector 21",
  "city": "Noida",
  "state": "Uttar Pradesh",
  "pincode": "201301"
}
```

### Request (Location-based)
```json
{
  "latitude": 28.5355,
  "longitude": 77.3910
}
```

### Response
```json
{
  "digipin": "UP-201301-6K9D"
}
```

Or on error:
```json
{
  "error": "Error message"
}
```

## Error Handling

- **Geolocation errors**: Shows user-friendly message if location access is denied
- **API errors**: Displays error message from API or generic fallback
- **Network errors**: Handled gracefully with error messages
- **Auto-fetch errors**: Silent (logged to console, user can manually fetch)

## Browser Permissions

For location-based fetching:
- Browser will prompt user for location permission
- User must grant permission for location fetch to work
- Falls back to address-based fetch if location is denied

## Future Enhancements

1. **Address Book Integration**: Auto-fetch DIGIPIN when selecting saved addresses
2. **PIN Code Lookup**: Auto-fill city/state from PIN code, then fetch DIGIPIN
3. **Caching**: Cache DIGIPIN for addresses to reduce API calls
4. **Validation**: Validate DIGIPIN format before submission

## Testing

To test the feature:
1. Go to checkout page
2. Fill in address, city, state, and PIN code
3. Wait 1 second - DIGIPIN should auto-fetch
4. Or click MapPin icon to manually fetch from address
5. Or click Navigation icon to fetch from device location
