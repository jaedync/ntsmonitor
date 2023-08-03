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

      let upstream_mbps = [];
      let downstream_mbps = [];

      const labels = Object.keys(data.upstream_mbps).map(timestamp => {
        let date = new Date(timestamp);
        let utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 
                              date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        let cstOffset = date.getTimezoneOffset() === 300 ? 5 : 6;
        let cstDate = new Date(utcDate - cstOffset * 3600 * 1000);

        upstream_mbps.push(data.upstream_mbps[timestamp]);
        downstream_mbps.push(data.downstream_mbps[timestamp]);

        return cstDate.toISOString();
      });

      let chartBandwidthData = {
        labels: labels,
        datasets: [
          {
            label: 'Down (Mbps)',
            data: downstream_mbps,
            fill: false,
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgba(54, 162, 235, 0.1)',
          },
          {
            label: 'Up (Mbps)',
            data: upstream_mbps,
            fill: false,
            backgroundColor: 'rgba(50, 195, 52)',
            borderColor: 'rgba(50, 195, 52, 0.1)',
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
