import React from 'react';
import { Bar } from 'react-chartjs-2';

function OccupancyCard({ camera }) {
    // Check if occupancy_data and timestamps exist
    if (!camera.occupancy_data || !camera.occupancy_data.timestamps || !camera.occupancy_data.occupancy_counts) {
        // Render nothing or some placeholder component if they don't
        return null;
    }

    const chartData = {
        labels: camera.occupancy_data.timestamps.map(isoStr => {
          const date = new Date(isoStr);
          return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`.padStart(2, '0');
        }),
        datasets: [{
          label: 'Occupancy Count',
          data: camera.occupancy_data.occupancy_counts,
          fill: false,
          backgroundColor: 'rgb(75, 192, 192)',
          borderColor: 'rgba(75, 192, 192, 0.7)',
        }],
    };

    return (
        <div className="faint-card">
            <h2>{camera.name}</h2>
            <div className="chart-container-line">
                <Bar data={chartData} />
            </div>
        </div>
    );
}

export default OccupancyCard;
