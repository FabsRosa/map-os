const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceInKm = R * c; // Distance in kilometers

  return distanceInKm * 1000; // Convert to meters
}

export default haversineDistance;