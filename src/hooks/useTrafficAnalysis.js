// hooks/useTrafficAnalysis.js
import { useState, useEffect } from 'react';

function useTrafficAnalysis(apiKey) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://api.jaedynchilton.com/traffic_analysis', {
      headers: {
        'Api-Key': apiKey,
      },
    })
      .then(response => response.json())
      .then(data => {
        // Convert the object to an array of objects
        const formattedData = Object.entries(data).map(([application, stats]) => ({
          application,
          activeTime: stats.activeTime || 'N/A',
          flows: stats.flows || 'N/A',
          recv: stats.recv ? (stats.recv / 1024 / 1024).toFixed(2) : 'N/A',
          sent: stats.sent ? (stats.sent / 1024 / 1024).toFixed(2) : 'N/A',
          numClients: stats.numClients || 'N/A',
        }));

        console.log(formattedData); // Log the transformed data
        setData(formattedData);
      });
  }, [apiKey]);

  return data;
}

export default useTrafficAnalysis;
