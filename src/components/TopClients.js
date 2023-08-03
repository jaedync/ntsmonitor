// TopClients.js
import React, { useState, useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';

function TopClients({ apiKey }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://api.jaedynchilton.com/top_clients', {
        headers: {
          'Api-Key': apiKey, // Set the API key as a header
        },
      })
      .then(response => response.json())
      .then(data => setData(data));
  }, [apiKey]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Client Name',
        accessor: 'name',
      },
      {
        Header: 'MAC Address',
        accessor: 'mac',
      },
      {
        Header: 'Network Name',
        accessor: d => d.network.name,
      },
      {
        Header: 'Total Usage (GB)',
        accessor: d => (d.usage.total / 1024).toFixed(2),
      },
      {
        Header: 'Usage Percentage',
        accessor: d => d.usage.percentage.toFixed(2),
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
      <h2>Top Clients by Usage</h2>
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

export default TopClients;
