import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Stack,
  Heading,
  Text,
} from "@shopify/polaris";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { BaseUrl, CustomerId } from "../AuthToken/AuthToken.js";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const animatedComponents = makeAnimated();

export default function GenerateLabel() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const StoreDetail = useSelector((state) => state.store);

  useEffect(() => {
    if (StoreDetail.User && StoreDetail.Token) {
      GetOrders();
    }
  }, [StoreDetail]);

  const GetOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BaseUrl}/api/v1/customer/order/?customerId=${StoreDetail.User.customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${StoreDetail.Token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setProducts(data.data);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
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
            "Authorization": `Bearer ${StoreDetail.Token}`,
          },
          body: JSON.stringify({ ids, customerId: CustomerId }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
  
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      console.log(blob)
      setPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate label:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
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
          <Text>Select the Order IDs below and click on "Generate Label".</Text>

          <div style={{ width: "800px" }}>
            <Select
              components={animatedComponents}
              isMulti
              options={products.map((product) => ({
                value: product.id,
                label: product.id,
              }))}
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
