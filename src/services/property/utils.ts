
/**
 * Calculate distance between two geographic coordinates using the Haversine formula
 */
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Convert degrees to radians
 */
export const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

/**
 * Apply distance filter to properties and sort if needed
 */
export const applyDistanceFilter = (
  properties: any[], 
  nearLocation?: { lat: number; lng: number },
  maxDistance?: number,
  sortByNearest?: boolean
) => {
  if (!nearLocation || !maxDistance) return properties;
  
  let filteredProperties = properties.filter(property => {
    if (!property.latitude || !property.longitude) return false;
    
    const distance = calculateDistance(
      nearLocation.lat,
      nearLocation.lng,
      property.latitude,
      property.longitude
    );
    
    // Explicitly assign distance to property
    property.distance = distance;
    
    return distance <= maxDistance;
  });
  
  if (sortByNearest) {
    filteredProperties.sort((a, b) => {
      const distanceA = a.distance !== undefined ? a.distance : Infinity;
      const distanceB = b.distance !== undefined ? b.distance : Infinity;
      return distanceA - distanceB;
    });
  }
  
  return filteredProperties;
};

/**
 * Map database property items to frontend property data format
 */
export const mapPropertyItemsToData = (items: any[]) => {
  return items.map(item => ({
    id: item.id,
    title: item.title,
    address: item.address,
    price: item.price,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms || 1,
    availableFrom: item.available_from,
    imageUrl: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2673&q=80',
    latitude: item.latitude,
    longitude: item.longitude,
    hasHall: item.has_hall,
    hasSeparateKitchen: item.has_separate_kitchen,
    propertyType: item.property_type || 'rental',
    genderPreference: item.gender_preference || 'any',
    floorNumber: item.floor_number || 0,
    depositAmount: item.deposit_amount,
    distance: undefined // Initialize with undefined
  }));
};
