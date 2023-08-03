// useVerkadaOccupancy.js
import { useState, useEffect, useCallback } from 'react';

function useVerkadaOccupancy(apiKey) {
  const [occupancy, setOccupancy] = useState([]);

  const fetchOccupancy = useCallback(async () => {
    try {
      const response = await fetch('https://api.jaedynchilton.com/verkada_occupancy', {
        headers: { 'Api-Key': apiKey },
      });

      let data = await response.json();

      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format');
        return;
      }

      setOccupancy(data);

    } catch (error) {
      console.error('Error:', error);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchOccupancy();
    const intervalId = setInterval(fetchOccupancy, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [fetchOccupancy]);

  return occupancy;
}

export default useVerkadaOccupancy;
