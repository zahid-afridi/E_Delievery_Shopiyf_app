import React, { useEffect } from 'react';
import {
  Button,
  Text,
  Page,
  Modal,
  IndexTable,
  TextField,
  FormLayout
} from '@shopify/polaris';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export default function AddShippingMethod() {
  const [ShipmentModal, setShipmentModal] = React.useState(false);
  const [shipmentName, setShipmentName] = React.useState('');
  const [shipmentPrice, setShipmentPrice] = React.useState('');
  const [FetchedShipment, setFetchedShipment] = React.useState([]);

  // Directly extract values from the Redux store without using state
  const value = useSelector((state) => state.store);
  const Store_Id = value.StoreDetail.Store_Id;
  const store_domain = value.StoreDetail.domain;

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/create-shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ShipmentName: shipmentName,
          Price: shipmentPrice,
          Store_Id: Store_Id,
          store_domain: store_domain,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error);
      } else {
        toast.success(data.message);
      }
      // Refresh the shipment list after adding a new one
      FetchShipment();
    } catch (error) {
      console.error(error);
      toast.error('Error adding shipping method');
    }
    setShipmentModal(false);
    setShipmentName('');
    setShipmentPrice('');
  };

  const FetchShipment = async () => {
    try {
      const response = await fetch(`/api/get-shipping?Store_Id=${Store_Id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log("Data m", data.shipping);
      // Use a fallback empty array if data.shipping is undefined
      setFetchedShipment(data.shipping || []);
    } catch (error) {
      console.error(error);
    }
  };

  const DeleteShipment = async (ShipmentName) => {
    try {
      const response = await fetch(
        `/api/delete-shipping?Store_Id=${Store_Id}&ShipmentName=${ShipmentName}`,
        {
          method: 'DELETE',
        }
      );
      const data = await response.json();
      console.log(data);
      toast.success(data.message);
      FetchShipment();
    } catch (error) {
      console.error(error);
    }
  };

  // Only call FetchShipment when Store_Id is available
  useEffect(() => {
    if (Store_Id) {
      FetchShipment();
    }
  }, [Store_Id]);

  // Simple style objects for vertical spacing
  const spacingStyle = { marginBottom: '25px' };
  const spacingStyleTwo = { marginBottom: '10px' };

  // Define the default shipment object
  const defaultShipment = {
    _id: "Ez_Delivery", // Unique ID for the default shipment
    ShipmentName: "Ez Delivery",
    Price: 100
  };

  // Combine the default shipment with the fetched shipments
  const shipments = [defaultShipment, ...FetchedShipment];

  return (
    <Page>
      <div style={spacingStyle}>
        <Text variant="headingXl" as="h4">
          Shipping Method
        </Text>
      </div>

      <div style={spacingStyle}>
        <div style={spacingStyleTwo}>
          <Text variant="headingMd" as="h5">
            Shipment Methods
          </Text>
        </div>
        <IndexTable
          resourceName={{
            singular: "Shipment",
            plural: "Shipments",
          }}
          itemCount={shipments.length}
          selectable={false}
          headings={[
            { title: "Shipment Name" },
            { title: "Price" },
            { title: "Action" },
          ]}
        >
          {shipments.map((shipment, index) => (
            <IndexTable.Row key={shipment._id} id={shipment._id} position={index}>
              <IndexTable.Cell>
                {shipment.ShipmentName}
              </IndexTable.Cell>
              <IndexTable.Cell>
                {shipment.Price}
              </IndexTable.Cell>
              <IndexTable.Cell>
                {/* Disable deletion for the default shipment */}
                {shipment._id !== "Ez_Delivery" && (
                  <Button
                    plain
                    onClick={() => DeleteShipment(shipment.ShipmentName)}
                    aria-label="Delete"
                  >
                    Delete
                  </Button>
                )}
              </IndexTable.Cell>
            </IndexTable.Row>
          ))}
        </IndexTable>
      </div>

      <div style={spacingStyle}>
        <Button primary onClick={() => setShipmentModal(true)}>
          Add Shipment Method
        </Button>
      </div>

      <Modal
        open={ShipmentModal}
        onClose={() => setShipmentModal(false)}
        title="Add New Shipment Method"
        primaryAction={{
          content: 'Save',
          onAction: handleSubmit,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShipmentModal(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Shipment Name"
              value={shipmentName}
              onChange={(value) => setShipmentName(value)}
              autoComplete="off"
            />
            <TextField
              label="Shipment Price"
              value={shipmentPrice}
              onChange={(value) => setShipmentPrice(value)}
              type="number"
              autoComplete="off"
              prefix="$"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}