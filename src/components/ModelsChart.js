// ModelsChart.js
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTable, useSortBy } from 'react-table';

const ModelsChart = ({ apiKey }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://api.jaedynchilton.com/top_models', {
      headers: {
        'Api-Key': apiKey,
      },
    })
      .then(response => response.json())
      .then(data => setData(data));
  }, [apiKey]);

  // Add this before the ModelsChart component definition
  const modelColorMap = {
    'MR20': 'rgb(255, 99, 132)',
    'MR36': 'rgb(0, 214, 188)',
    'MR36H': 'rgb(13, 92, 212)',
    'MR30H': 'rgb(98, 18, 138)',
    'MS120-8FP': 'rgb(16, 173, 47)',
    // Add more models here as needed
  };

  const chartData = {
    labels: data.map(item => item.model),
    datasets: [{
      data: data.map(item => (item.usage.total / 1024).toFixed(2)), 
      backgroundColor: data.map(item => modelColorMap[item.model] || 'rgb(199, 199, 199)'), // Use the color map here
    }],
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Model',
        accessor: 'model',
      },
      {
        Header: 'Count',
        accessor: 'count',
      },
      {
        Header: 'Total Usage (GB)',
        accessor: d => (d.usage.total / 1024).toFixed(2),
      },
      {
        Header: 'Average Usage per Model (GB)',
        accessor: d => ((d.usage.average / 1024)).toFixed(2), // Add this column
      },
    ],
    []
  );
  

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <div className="card">
      <h2>Top Models by Data Usage (GB)</h2>
      <div className="chart-container-doughnut">
        <Doughnut 
          data={chartData} 
          options={{ maintainAspectRatio: false }} // Add this line
        />
      </div>
      
      <div class="table-container">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModelsChart;
