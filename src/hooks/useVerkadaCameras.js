// useVerkadaCameras.js
import { useState, useEffect, useCallback } from 'react';

function useVerkadaCameras(apiKey) {
  const [verkadaCameras, setVerkadaCameras] = useState([]);

  const fetchVerkadaCameras = useCallback(async () => {
    try {
      const response = await fetch('https://api.jaedynchilton.com/verkada_devices', {
        headers: { 'Api-Key': apiKey },
      });

      const data = await response.json();

      // Add the source information to each camera
      const camerasWithSource = data.cameras.map(camera => ({
        ...camera,
        source: 'verkada',
      }));

      setVerkadaCameras(camerasWithSource);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchVerkadaCameras();
    const intervalId = setInterval(fetchVerkadaCameras, 30000);
    return () => clearInterval(intervalId);
  }, [fetchVerkadaCameras]);

  return verkadaCameras;
}

export default useVerkadaCameras;
