import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Stack,
  Heading,
  Text,
} from "@shopify/polaris";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { BaseUrl, CustomerId, Token } from "../AuthToken/AuthToken";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const animatedComponents = makeAnimated();

export default function GenerateLabel() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const StoreDetail = useSelector((state) => state.store);

  useEffect(() => {
    GetOrders();
  }, []);

  const GetOrders = async () => {
    try {
      const req = await fetch(
        `${BaseUrl}/api/v1/customer/order/?customerId=${StoreDetail.User.customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${StoreDetail.Token}`,
          },
        }
      );
      const response = await req.json();
      if (req.ok) {
        setOrders(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleGenerateLabel = async () => {
    if (!selectedOptions.length) {
      setError("Please select at least one order.");
      return;
    }

    setLoading(true);
    setError(null);

    const ids = selectedOptions.map((option) => option.value);

    try {
      const response = await fetch(
        `${BaseUrl}/api/v1/customer/order/shipment-label/export-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${StoreDetail.Token}`,
          },
          body: JSON.stringify({
            ids,
            customerId: StoreDetail.User.customerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      setError("Failed to generate label. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "shipment_label.pdf";
    link.click();

    URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  // Dynamically map orders to dropdown options
  const orderOptions = orders.map(order => ({ value: order.id, label: order.id }));

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card sectioned>
        <Stack vertical spacing="tight">
          <Heading>Generate Order Label</Heading>
          <Text>
            Select the Order IDs below and click on "Generate Label".
          </Text>

          {/* Dropdown with dynamic order options */}
          <div style={{ width: "800px" }}>
            <Select
              components={animatedComponents}
              isMulti
              options={orderOptions}
              onChange={setSelectedOptions}
              placeholder="Select Order IDs"
            />
          </div>

          {error && <Text color="critical">{error}</Text>}

          <Button primary loading={loading} onClick={handleGenerateLabel}>
            Generate Label
          </Button>

          {pdfUrl && (
            <div style={{ marginTop: "20px" }}>
              <iframe
                src={pdfUrl}
                title="PDF Preview"
                width="100%"
                height="400px"
                style={{ border: "1px solid #ccc", marginBottom: "10px" }}
              ></iframe>
              <Button onClick={handleDownload} primary>
                Download Transcript
              </Button>
            </div>
          )}
        </Stack>
      </Card>
    </div>
  );
}
