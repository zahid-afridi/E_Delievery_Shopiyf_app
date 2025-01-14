import React, { useState } from "react";
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

const animatedComponents = makeAnimated();

export default function GenerateLabel() {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const StoreDetail = useSelector((state) => state.store);
  console.log('StoreDetail From Redux:', StoreDetail);
  // Mock options for the dropdown (replace with real options from API if needed)
  const orderOptions = [
    { value: "sHwKEzHAPoFas0K9bTtsc", label: "sHwKEzHAPoFas0K9bTtsc" },
    { value: "RuqIsdHNxrYzcx9ol89Tq", label: "RuqIsdHNxrYzcx9ol89Tq" },
    { value: "c4DTO0KlM97H4vl9juuDN", label: "c4DTO0KlM97H4vl9juuDN" },
    { value: "uZoQNLGtyzRfkNlqVylbr", label: "uZoQNLGtyzRfkNlqVylbr" },
  ];

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

          {/* Make the dropdown wider */}
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
