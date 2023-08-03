import React, { useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Doughnut } from 'react-chartjs-2';

function secondsToDhms(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
  
    if (days > 0) return days + (days === 1 ? " day" : " days");
    if (hours > 0) return hours + (hours === 1 ? " hour" : " hours");
    if (minutes > 0) return minutes + (minutes === 1 ? " minute" : " minutes");
    return seconds + (seconds === 1 ? " second" : " seconds");
  }

function TrafficAnalysisTable({ data }) {
  const columns = useMemo(
    () => [
      {
        Header: 'Application',
        accessor: 'application',
      },
      {
        Header: 'Active Time',
        accessor: 'activeTime',
        Cell: ({ value }) => secondsToDhms(value),
      },
      {
        Header: 'Flows',
        accessor: 'flows',
      },
      {
        Header: 'Clients',
        accessor: 'numClients',
      },
      {
        Header: 'Received (GB)',
        accessor: 'recv',
        Cell: ({ value }) => {
          let recv = parseFloat(value);
          if (isNaN(recv) || value === "N/A") {
            recv = 0;
          }
          return recv.toFixed(2);
        },
      },
      {
        Header: 'Sent (GB)',
        accessor: 'sent',
        Cell: ({ value }) => {
          let sent = parseFloat(value);
          if (isNaN(sent) || value === "N/A") {
            sent = 0;
          }
          return sent.toFixed(2);
        },
      },
      {
        Header: 'Total Bandwidth (GB)',
        accessor: d => {
          let recv = parseFloat(d.recv);
          let sent = parseFloat(d.sent);
          if (isNaN(recv) || d.recv === "N/A") {
            recv = 0;
          }
          if (isNaN(sent) || d.sent === "N/A") {
            sent = 0;
          }
          return (recv + sent).toFixed(2);
        },
      }      
    ],
    []
  );

  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    const hue = hash % 360 + 110; // Use the remainder of the hash divided by 360 to get a hue value between 0 and 359.
  
    return `hsl(${hue}, 65%, 55%)`;
  }
  

  const sortedData = [...data].sort((a, b) => {
    const totalA = parseFloat(a.recv) + parseFloat(a.sent);
    const totalB = parseFloat(b.recv) + parseFloat(b.sent);
    return totalB - totalA; // To sort in descending order
  });

  const chartData = {
    labels: sortedData.map(item => item.application),
    datasets: [{
      data: sortedData.map(item => (parseFloat(item.recv) + parseFloat(item.sent)).toFixed(2)),
      backgroundColor: sortedData.map(item => stringToColor(item.application)),
    }],
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <div className="card">
      <h2>Traffic Analysis</h2>
      <div className="chart-container-doughnut">
            <Doughnut 
        data={chartData} 
        options={{ 
            maintainAspectRatio: false,
            plugins: {
            legend: {
                display: false
            }
            }
        }}
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
}

export default TrafficAnalysisTable;
