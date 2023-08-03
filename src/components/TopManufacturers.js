// TopManufacturers.js
import React, { useState, useEffect } from 'react';
import { useTable, useSortBy } from 'react-table';

function TopManufacturers() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://api.jaedynchilton.com/top_manufacturers')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Manufacturer',
        accessor: 'name',
      },
      {
        Header: 'Total Clients',
        accessor: d => d.clients.counts.total,
      },
      {
        Header: 'Total Usage (GB)',
        accessor: d => (d.usage.total / 1024).toFixed(2),
      },
      {
        Header: 'Downstream Usage (GB)',
        accessor: d => (d.usage.downstream / 1024).toFixed(2),
      },
      {
        Header: 'Upstream Usage (GB)',
        accessor: d => (d.usage.upstream / 1024).toFixed(2),
      },
      {
        Header: 'Usage per Client (GB)',
        accessor: d => ((d.usage.total / d.clients.counts.total) / 1024).toFixed(2),
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
      <h2>Top Device Manufacturers on Meraki</h2>
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

export default TopManufacturers;
