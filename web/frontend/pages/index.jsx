import {Page, LegacyCard, DataTable} from '@shopify/polaris';
import { useEffect } from 'react';
import {useState, useCallback} from 'react';

function SortableDataTableExample() {
  const [sortedRows, setSortedRows] = useState(null);
  const [orders,setOrders]=useState([])

  const initiallySortedRows = [
    ['dsua2e', 'Emerald Silk Gown', 'Karachi', '29/03/2022', 'Completed'],
    ['hasd12', 'Bay dsaa Gown', 'Islamabad', '29/03/2025', 'Pending'],
    ['da213d', 'Baby Gown', 'Rawalpindi', '30/02/2028', 'Canceled'],
    ['dsa23s', 'Baby as', 'Rawalpindi', '30/02/2023', 'Completed'],
    ['3wr2ds', 'Big BBC', 'Africa', '23/02/2023', 'Pending'],
  ];

  const rows = sortedRows ? sortedRows : orders && orders.map((order)=>[
     order.id,
     order.service.title || 'N/A',
     order.delivery.address || 'N/A',
     order.createdAt || 'N/A',
     order.status || 'N/A',
  ]);

  const handleSort = useCallback(
    (index, direction) => setSortedRows(sortRows(rows, index, direction)),
    [rows],
  );
  useEffect(()=>{
    GetOrders()
  },[])
  const GetOrders=async()=>{
    try {
      const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNrZ3BNWTBlSXdYY3NTb0pKeDA5aCIsInNvdXJjZSI6ImJ1c2luZXNzIiwiaWF0IjoxNzM1NzM2NDQ0LCJleHAiOjE3MzU3NDAwNDR9.58Gd3C3E3NlbnHt33lTCS6aP6TbtMxmgnOFbsYRkyiE'

          const req=await fetch('https://wrmx.manage.onro.app/api/v1/customer/order/?customerId=ckgpMY0eIwXcsSoJJx09h',{
            method:'GET',
            headers:{
              'Content-Type':'application/json',
              'Authorization':`Bearer ${token}`
            }
          })
          const response=await req.json();
          setOrders(response.data)
          console.log('orders',response)
      
    } catch (error) {
      console.log('error',error)
    }
  }

  return (
    <Page title="ORDER INFORMATION">
      <LegacyCard>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={['Order Id', 'Title', 'Address', 'Date', 'Status']}
          rows={rows}
          sortable={[false, false, false, false, true]}
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
