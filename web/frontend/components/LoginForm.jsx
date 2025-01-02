import React, { useState } from "react";
import {
  AppProvider,
  Page,
  Form,
  FormLayout,
  TextField,
  Button,
  Card,
} from "@shopify/polaris";

export default function LoginForm() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async () => {
    if (!clientId || !clientSecret || !customerId || !serviceId) {
      alert("All fields are required");
      return;
    }
    setIsSubmitting(true);

    const formData = {
      clientId,
      clientSecret,
      customerId,
      serviceId,
    };

    // Perform form submission logic here
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }

    // Setting values to null after form submission
    setClientId("");
    setClientSecret("");
    setCustomerId("");
    setServiceId("");
    console.log("Form submitted:", formData);
    // Add further form submission logic here
  };
  return (
    <AppProvider>
      <Page title="Signup Form">
        <Card sectioned>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Client ID"
                value={clientId}
                onChange={(value) => {
                    console.log(value);
                    setClientId(value)}}
                autoComplete="off"
              />
              <TextField
                label="Client Secret"
                value={clientSecret}
                onChange={(value) => setClientSecret(value)}
                autoComplete="off"
                type="password"
              />
              <TextField
                label="Customer ID"
                value={customerId}
                onChange={(value) => setCustomerId(value)}
                autoComplete="off"
              />
              <TextField
                label="Service ID"
                value={serviceId}
                onChange={(value) => setServiceId(value)}
                autoComplete="off"
              />
              <Button submit primary loading={isSubmitting}>
                Submit
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </AppProvider>
  );
}
