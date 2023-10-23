import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

function LineChart({ data }) {
  if (data && data.datasets) {
    data.datasets.forEach((dataset) => {
      // dataset.tension = 1; // Adjust this value to create the desired curve
      dataset.stepped = 'before'; // Or 'after' depending on the desired step direction
    });
  }
  const options = {
    maintainAspectRatio: true,
    aspectRatio: 1.3,
    plugins: {
      legend: {
        display: true, // Set to true to display the legend
        labels: {
          color: 'grey', // Change the legend text color
        },
      },
      title: { display: false },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day', // Set the time unit to 'day'
        },
        grid: {
          offset: true, // Center the grid lines
        },
        ticks: {
          display: true,
          autoSkip: true,
          maxTicksLimit: 15,
          callback: function (value, index, values) {
            const date = new Date(value);
            return format(date, 'MMM dd'); // Customize the date format as needed
          },
        },
      },
      y: {
        ticks: { display: true },
        grid: {
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default LineChart;
