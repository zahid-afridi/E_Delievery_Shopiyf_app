import {Page, LegacyCard, DataTable} from '@shopify/polaris';
import {useState, useCallback} from 'react';

function SortableDataTableExample() {
  const [sortedRows, setSortedRows] = useState(null);

  const initiallySortedRows = [
    ['dsua2e', 'Emerald Silk Gown', 'Karachi', '29/03/2022', 'Completed'],
    ['hasd12', 'Bay dsaa Gown', 'Islamabad', '29/03/2025', 'Pending'],
    ['da213d', 'Baby Gown', 'Rawalpindi', '30/02/2028', 'Canceled'],
    ['dsa23s', 'Baby as', 'Rawalpindi', '30/02/2023', 'Completed'],
    ['3wr2ds', 'Big BBC', 'Africa', '23/02/2023', 'Pending'],
  ];

  const rows = sortedRows ? sortedRows : initiallySortedRows;

  const handleSort = useCallback(
    (index, direction) => setSortedRows(sortRows(rows, index, direction)),
    [rows],
  );

  return (
    <Page title="Sales by Product">
      <LegacyCard>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={['Order Id', 'Order Name', 'Address', 'Date', 'Status']}
          rows={rows}
          sortable={[false, true, false, false, true]}
          defaultSortDirection="ascending"
          initialSortColumnIndex={4}
          onSort={handleSort}
        />
      </LegacyCard>
    </Page>
  );

  function sortRows(rows, index, direction) {
    return [...rows].sort((rowA, rowB) => {
      const valueA = rowA[index] || '';
      const valueB = rowB[index] || '';

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        // For string comparison (e.g., "Status")
        const comparison = valueA.localeCompare(valueB);
        return direction === 'ascending' ? comparison : -comparison;
      } else {
        // For numeric or other types of sorting
        const comparison = parseFloat(valueA) - parseFloat(valueB);
        return direction === 'ascending' ? comparison : -comparison;
      }
    });
  }
}

export default SortableDataTableExample;
