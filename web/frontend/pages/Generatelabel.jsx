import {
  TextField,
  Button,
  Card,
  Stack,
  Heading,
  Text,
} from "@shopify/polaris";
import React, { useState } from "react";
import { BaseUrl, CustomerId, Token } from "../AuthToken/AuthToken";

export default function Generatelabel() {
  const [Label, setLabel] = useState("");
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (value) => setLabel(value);

  // Simulate API call
  const handleGenerateLabel = async () => {
    if (!Label) return;

    setLoading(true);

    try {
      // Replace with your API call logic
      const response = await fetch(
        `${BaseUrl}/api/v1/customer/order/shipment-label/export-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
          body: JSON.stringify({
            ids: [
              "RuqIsdHNxrYzcx9ol89Tq",
            ],
            customerId: CustomerId,
          }),
        }
      );
      const data = await response.json();
      console.log(data)

      setTranscript(data.transcript);
    } catch (error) {
      console.error("Error generating label:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Replace with actual logic to download the file
    const blob = new Blob([transcript], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${Label}_transcript.pdf`;
    link.click();
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
            Enter the Order ID below and click on the "Generate Label" button.
            Once the label is generated, you can download the transcript.
          </Text>

          <TextField
            label="Order ID"
            value={Label}
            onChange={handleChange}
            placeholder="Enter the Order ID"
            fullWidth
          />

          <Button primary loading={loading} onClick={handleGenerateLabel}>
            Generate Label
          </Button>

          {transcript && (
            <div style={{ marginTop: "20px" }}>
              <Text variant="bodyMd">
                Transcript generated successfully. You can download it below:
              </Text>
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
