// useDevices.js
import { useState, useEffect, useCallback } from 'react';

function useDevices(apiKey) {
  const [devices, setDevices] = useState([]);
  const [statusCount, setStatusCount] = useState({});

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch('https://api.jaedynchilton.com/meraki_status', {
        headers: { 'Api-Key': apiKey },
      });

      let data = await response.json();

      // Add source to each device
      data = data.map(device => ({ ...device, source: 'meraki' }));

      const counts = data.reduce((acc, device) => {
        acc[device.status] = (acc[device.status] || 0) + 1;
        return acc;
      }, {});

      setDevices(data);
      setStatusCount(counts);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchDevices();
    const intervalId = setInterval(fetchDevices, 30000);
    return () => clearInterval(intervalId);
  }, [fetchDevices]);

  return { devices, statusCount };
}

export default useDevices;
