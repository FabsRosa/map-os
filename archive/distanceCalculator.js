// Deprecated due to high costs associated with it.

export const calculateDistance = (origin, destination) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps JavaScript API not loaded.");
      reject("Google Maps JavaScript API not loaded.");
      return Promise.resolve(null);
    }

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK') {
          const distance = response.rows[0].elements[0].distance.text;
          const duration = response.rows[0].elements[0].duration.text;
          resolve({ distance, duration });
        } else {
          console.error('Error:', status);
          reject(status);
        }
      }
    );
  });
};