/**
 * Shared City Coordinates for Pakistan
 * Single source of truth for all map/location features
 */

export interface CityCoordinates {
  lat: number;
  lng: number;
}

// Punjab
const punjabCities: Record<string, CityCoordinates> = {
  'Lahore': { lat: 31.5204, lng: 74.3587 },
  'Faisalabad': { lat: 31.4504, lng: 73.1350 },
  'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
  'Multan': { lat: 30.1575, lng: 71.5249 },
  'Gujranwala': { lat: 32.1617, lng: 74.1883 },
  'Sialkot': { lat: 32.4945, lng: 74.5229 },
  'Bahawalpur': { lat: 29.3956, lng: 71.6836 },
  'Sargodha': { lat: 32.0836, lng: 72.6711 },
  'Sheikhupura': { lat: 31.7167, lng: 73.9850 },
  'Jhang': { lat: 31.2681, lng: 72.3181 },
  'Rahim Yar Khan': { lat: 28.4202, lng: 70.2952 },
  'Gujrat': { lat: 32.5742, lng: 74.0789 },
  'Kasur': { lat: 31.1177, lng: 74.4500 },
  'Sahiwal': { lat: 30.6682, lng: 73.1114 },
  'Okara': { lat: 30.8081, lng: 73.4596 },
  'Wah Cantt': { lat: 33.7969, lng: 72.7297 },
  'Dera Ghazi Khan': { lat: 30.0561, lng: 70.6403 },
  'Kamoke': { lat: 31.9753, lng: 74.2242 },
  'Mandi Bahauddin': { lat: 32.5861, lng: 73.4917 },
  'Jhelum': { lat: 32.9425, lng: 73.7257 },
  'Sadiqabad': { lat: 28.3089, lng: 70.1261 },
  'Khanewal': { lat: 30.3017, lng: 71.9321 },
  'Hafizabad': { lat: 32.0708, lng: 73.6878 },
  'Muzaffargarh': { lat: 30.0703, lng: 71.1933 },
  'Khanpur': { lat: 28.6467, lng: 70.6617 },
  'Gojra': { lat: 31.1492, lng: 72.6833 },
  'Mandi Burewala': { lat: 30.1500, lng: 72.6833 },
  'Toba Tek Singh': { lat: 30.9667, lng: 72.4833 },
  'Muridke': { lat: 31.8022, lng: 74.2553 },
  'Khushab': { lat: 32.2967, lng: 72.3522 },
  'Chiniot': { lat: 31.7292, lng: 72.9783 },
  'Chichawatni': { lat: 30.5289, lng: 72.6928 },
  'Chakwal': { lat: 32.9328, lng: 72.8631 },
  'Attock': { lat: 33.7667, lng: 72.3667 },
};

// Sindh
const sindhCities: Record<string, CityCoordinates> = {
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Hyderabad': { lat: 25.3960, lng: 68.3578 },
  'Sukkur': { lat: 27.7050, lng: 68.8578 },
  'Larkana': { lat: 27.5600, lng: 68.2144 },
  'Nawabshah': { lat: 26.2442, lng: 68.4100 },
  'Mirpurkhas': { lat: 25.5276, lng: 69.0111 },
  'Jacobabad': { lat: 28.2769, lng: 68.4514 },
  'Shikarpur': { lat: 27.9556, lng: 68.6383 },
  'Khairpur': { lat: 27.5295, lng: 68.7592 },
  'Dadu': { lat: 26.7311, lng: 67.7750 },
  'Thatta': { lat: 24.7475, lng: 67.9236 },
  'Badin': { lat: 24.6560, lng: 68.8370 },
  'Tando Adam': { lat: 25.7686, lng: 68.6636 },
  'Tando Allahyar': { lat: 25.4604, lng: 68.7177 },
  'Umerkot': { lat: 25.3549, lng: 69.7361 },
  'Sanghar': { lat: 26.0467, lng: 68.9481 },
  'Matiari': { lat: 25.5970, lng: 68.4467 },
  'Ghotki': { lat: 28.0050, lng: 69.3150 },
};

// Khyber Pakhtunkhwa (KPK)
const kpkCities: Record<string, CityCoordinates> = {
  'Peshawar': { lat: 34.0151, lng: 71.5249 },
  'Mardan': { lat: 34.1958, lng: 72.0447 },
  'Abbottabad': { lat: 34.1495, lng: 73.1995 },
  'Mingora': { lat: 34.7797, lng: 72.3603 },
  'Kohat': { lat: 33.5869, lng: 71.4414 },
  'Dera Ismail Khan': { lat: 31.8314, lng: 70.9017 },
  'Mansehra': { lat: 34.3300, lng: 73.1967 },
  'Swabi': { lat: 34.1203, lng: 72.4697 },
  'Charsadda': { lat: 34.1483, lng: 71.7406 },
  'Nowshera': { lat: 34.0153, lng: 71.9747 },
  'Bannu': { lat: 32.9889, lng: 70.6056 },
  'Haripur': { lat: 33.9944, lng: 72.9347 },
  'Karak': { lat: 33.1167, lng: 71.0833 },
  'Hangu': { lat: 33.5319, lng: 71.0594 },
  'Timergara': { lat: 34.8264, lng: 71.8444 },
  'Chitral': { lat: 35.8514, lng: 71.7864 },
};

// Balochistan
const balochistanCities: Record<string, CityCoordinates> = {
  'Quetta': { lat: 30.1798, lng: 66.9750 },
  'Turbat': { lat: 26.0031, lng: 63.0544 },
  'Khuzdar': { lat: 27.8117, lng: 66.6408 },
  'Hub': { lat: 25.0922, lng: 66.7739 },
  'Chaman': { lat: 30.9236, lng: 66.4522 },
  'Gwadar': { lat: 25.1264, lng: 62.3225 },
  'Sibi': { lat: 29.5430, lng: 67.8772 },
  'Zhob': { lat: 31.3417, lng: 69.4497 },
  'Loralai': { lat: 30.3703, lng: 68.5978 },
  'Pishin': { lat: 30.5817, lng: 66.9942 },
  'Dera Murad Jamali': { lat: 28.5500, lng: 68.2167 },
  'Mastung': { lat: 29.7997, lng: 66.8453 },
  'Kalat': { lat: 29.0267, lng: 66.5917 },
  'Kharan': { lat: 28.5833, lng: 65.4167 },
};

// Islamabad Capital Territory
const ictCities: Record<string, CityCoordinates> = {
  'Islamabad': { lat: 33.6844, lng: 73.0479 },
};

// Azad Kashmir
const azadKashmirCities: Record<string, CityCoordinates> = {
  'Muzaffarabad': { lat: 34.3700, lng: 73.4711 },
  'Mirpur': { lat: 33.1456, lng: 73.7517 },
  'Rawalakot': { lat: 33.8578, lng: 73.7603 },
  'Kotli': { lat: 33.5181, lng: 73.9019 },
  'Bhimber': { lat: 32.9744, lng: 74.0789 },
  'Bagh': { lat: 33.9806, lng: 73.7750 },
  'Palandri': { lat: 33.7111, lng: 73.6906 },
};

// Gilgit-Baltistan
const gilgitBaltistanCities: Record<string, CityCoordinates> = {
  'Gilgit': { lat: 35.9208, lng: 74.3144 },
  'Skardu': { lat: 35.2978, lng: 75.6339 },
  'Hunza': { lat: 36.3167, lng: 74.6500 },
  'Chilas': { lat: 35.4208, lng: 74.0961 },
  'Ghanche': { lat: 35.4167, lng: 76.0667 },
};

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  ...punjabCities,
  ...sindhCities,
  ...kpkCities,
  ...balochistanCities,
  ...ictCities,
  ...azadKashmirCities,
  ...gilgitBaltistanCities,
};

export const CITY_PROVINCES: Record<string, string> = {
  ...Object.fromEntries(Object.keys(punjabCities).map(c => [c, 'Punjab'])),
  ...Object.fromEntries(Object.keys(sindhCities).map(c => [c, 'Sindh'])),
  ...Object.fromEntries(Object.keys(kpkCities).map(c => [c, 'KPK'])),
  ...Object.fromEntries(Object.keys(balochistanCities).map(c => [c, 'Balochistan'])),
  ...Object.fromEntries(Object.keys(ictCities).map(c => [c, 'Islamabad Capital Territory'])),
  ...Object.fromEntries(Object.keys(azadKashmirCities).map(c => [c, 'Azad Kashmir'])),
  ...Object.fromEntries(Object.keys(gilgitBaltistanCities).map(c => [c, 'Gilgit-Baltistan'])),
};

export function getCityCoordinates(city: string): CityCoordinates {
  return CITY_COORDINATES[city] || CITY_COORDINATES['Lahore'];
}

export function getCityProvince(city: string): string {
  return CITY_PROVINCES[city] || 'Punjab';
}

export function getAllCities(): string[] {
  return Object.keys(CITY_COORDINATES).sort();
}

export function getCitiesByProvince(province: string): string[] {
  return Object.entries(CITY_PROVINCES)
    .filter(([_, p]) => p === province)
    .map(([c]) => c)
    .sort();
}