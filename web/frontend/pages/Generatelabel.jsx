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
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ids, setIds] = useState([]);

  const handleLabelChange = (value) => setLabel(value);

  const handleIdsChange = (value) => {
    const arrayOfIds = value.split(",").map((id) => id.trim());
    setIds(arrayOfIds);
  };

  const handleGenerateLabel = async () => {
    if (!ids.length) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${BaseUrl}/api/v1/customer/order/shipment-label/export-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Token}`,
          },
          body: JSON.stringify({
            ids: ids,
            customerId: CustomerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url); // Store the URL for the PDF
      console.log("Label generated successfully");
    } catch (error) {
      console.error("Error generating label:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `shipment_label.pdf`;
    link.click();

    // Optionally revoke the Blob URL to free memory
    URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null); // Disable download after one click
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
            Enter the Order IDs below (comma-separated) and click on the "Generate Label" button.
            Once the label is generated, you can view or download the transcript.
          </Text>

          <TextField
            label="Order IDs"
            value={Label}
            onChange={handleLabelChange}
            placeholder="Enter Order IDs (comma-separated)"
            fullWidth
          />

          <Button primary loading={loading} onClick={() => handleIdsChange(Label) || handleGenerateLabel()}>
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
