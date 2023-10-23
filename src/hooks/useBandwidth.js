// useBandwidth.js
import { useState, useEffect, useCallback } from 'react';

function useBandwidth(apiKey) {
  const [bandwidth, setBandwidth] = useState({});

  const fetchBandwidth = useCallback(async () => {
    try {
      const response = await fetch('https://api.jaedynchilton.com/bandwidth', {
        headers: { 'Api-Key': apiKey },
      });

      let data = await response.json();

      if (!data || !data.timestamp || !data.upstream_mbps || !data.downstream_mbps) {
        console.error('Invalid data format');
        return;
      }

      const labels = Object.keys(data.timestamp).sort();
      const upstream_mbps = labels.map(timestamp => data.upstream_mbps[timestamp]);
      const downstream_mbps = labels.map(timestamp => data.downstream_mbps[timestamp]);

      let chartBandwidthData = {
        labels: labels,
        datasets: [
          {
            label: 'Up (Mbps)',
            data: upstream_mbps,
            fill: true,
            backgroundColor: 'rgba(50, 195, 52, 0.4)',
            borderColor: 'rgba(50, 195, 52, 1)',
            borderWidth: 4,
            pointRadius: 1,
          },
          {
            label: 'Down (Mbps)',
            data: downstream_mbps,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 4,
            pointRadius: 1,
          },
        ],
      };

      setBandwidth({ total: data.total_mbs, chartData: chartBandwidthData });

    } catch (error) {
      console.error('Error:', error);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchBandwidth();
    const intervalId = setInterval(fetchBandwidth, 30000);
    return () => clearInterval(intervalId);
  }, [fetchBandwidth]);

  return bandwidth;
}

export default useBandwidth;
