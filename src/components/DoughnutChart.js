// DoughnutChart.js
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

function DoughnutChart({ data }) {
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export default DoughnutChart;
