import {
  Page,
  LegacyCard,
  DataTable,
  Button,
  Popover,
  ActionList,
  TextField,
  HorizontalStack
} from '@shopify/polaris';
import { useEffect, useState, useCallback } from 'react';
import { BaseUrl, CustomerId, Token } from '../AuthToken/AuthToken';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

function SortableDataTableExample() {
  const [sortedRows, setSortedRows] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activePopoverIndex, setActivePopoverIndex] = useState(null);
  const StoreDetail = useSelector((state) => state.store.StoreDetail);
  console.log('StoreDetail From Redux:', StoreDetail);
  

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const rows = sortedRows
    ? sortedRows
    : filteredOrders.map((order, index) => [
        order.id,
        order.service?.title || 'N/A',
        order.delivery?.address || 'N/A',
        formatDate(order.createdAt),
        order.status || 'N/A',
        order.status === 'ReadyForDelivery' ? (
          ''
        ) : (
          <Popover
            active={activePopoverIndex === index}
            activator={
              <Button plain onClick={() => togglePopover(index)}>
                •••
              </Button>
            }
            onClose={() => togglePopover(null)}
          >
            <ActionList
              items={[
                {
                  content: 'Confirm',
                  onAction: () => handleStatusChange(order.id, 'Confirmed'),
                },
                {
                  content: 'Draft',
                  onAction: () => handleStatusChange(order.id, 'Draft'),
                },
                {
                  content: 'Cancel',
                  onAction: () => handleStatusChange(order.id, 'Canceled'),
                },
              ]}
            />
          </Popover>
        ),
      ]);

  const handleSort = useCallback(
    (index, direction) => setSortedRows(sortRows(rows, index, direction)),
    [rows]
  );

  useEffect(() => {
    GetOrders();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    setFilteredOrders(
      orders.filter((order) =>
        order.id.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [searchText, orders]);

  const GetOrders = async () => {
    try {
      const req = await fetch(
        `${BaseUrl}/api/v1/customer/order/?customerId=${CustomerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const response = await req.json();
      if (req.ok) {
        setOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const togglePopover = (index) => {
    setActivePopoverIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    let endpoint;
    let requestBody = {
      orderId,
      customerId: CustomerId,
    };

    if (newStatus === 'Confirmed') {
      endpoint = '/pickup-delivery/confirm';
    } else if (newStatus === 'Draft') {
      endpoint = '/pickup-delivery/draft';
    } else if (newStatus === 'Canceled') {
      endpoint = '/pickup-delivery/cancel';
      requestBody = {
        ...requestBody,
        failureReasonId: 'FhbZzcUwXAD9g5sH_HVS-',
        failureReasonText: 'I want to change my order details',
      };
    }

    try {
      const req = await fetch(`${BaseUrl}/api/v1/customer/order${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
        body: JSON.stringify(requestBody),
      });
      const response = await req.json();
      if (req.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(response.message || `${newStatus} successfully applied`);
      } else {
        toast.error(response.message || `Failed to change status to ${newStatus}`);
      }
    } catch (error) {
      console.error(`Error changing status to ${newStatus}:`, error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Page title="ORDER INFORMATION">
      <LegacyCard>
        <HorizontalStack gap="2" wrap>
          <TextField
            labelHidden
            label="Search"
            value={searchText}
            onChange={(value) => setSearchText(value)}
            placeholder="Search by Order ID"
            autoComplete="off"
            size="small"
          />
        </HorizontalStack>
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
          headings={['Order Id', 'Title', 'Address', 'Date', 'Status', 'Action']}
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
        const comparison = valueA.localeCompare(valueB);
        return direction === 'ascending' ? comparison : -comparison;
      } else {
        const comparison = parseFloat(valueA) - parseFloat(valueB);
        return direction === 'ascending' ? comparison : -comparison;
      }
    });
  }
}

export default SortableDataTableExample;
