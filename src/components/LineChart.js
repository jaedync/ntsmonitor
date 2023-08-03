// LineChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

function LineChart({ data }) {
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { ticks: { display: false } },
      y: { ticks: { display: true } },
    },
  };

  return <Line data={data} options={options} />;
}

export default LineChart;
