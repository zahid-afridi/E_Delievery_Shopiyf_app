import React, { useState } from "react";
import {
  Page,
  LegacyCard,
  ChoiceList,
  TextField,
  Button,
  HorizontalStack,
  VerticalStack,
  Box,
  Icon,
} from "@shopify/polaris";
import { FaCreditCard, FaPaypal } from "react-icons/fa"; // Import icons from react-icons
import { ArrowLeftMinor } from "@shopify/polaris-icons"; // Import back arrow icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./style.css"; // Import the CSS file

export default function Settings() {
  const [selectedGateway, setSelectedGateway] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleGatewayChange = (value) => {
    setSelectedGateway(value[0]);
  };

  const handleSaveSettings = () => {
    if (selectedGateway === "stripe") {
      console.log("Stripe Secret Key:", stripeSecretKey);
      console.log("Stripe Publishable Key:", stripePublishableKey);
    } else if (selectedGateway === "paypal") {
      console.log("PayPal Client ID:", paypalClientId);
      console.log("PayPal Client Secret:", paypalClientSecret);
    }
    alert("Settings saved!");
  };

  const handleBackClick = () => {
    navigate("/"); // Navigate to the home route
  };

  return (
    <Page>

      <HorizontalStack gap="2" blockAlign="center">
        <div className="back-arrow" onClick={handleBackClick}>
          <Icon source={ArrowLeftMinor} tone="base" />
        </div>
        <h1 className="page-title">Choose Payment Gateway</h1>
      </HorizontalStack>

      <div className="card-container">
        <LegacyCard sectioned>
          <VerticalStack gap="4">
            <ChoiceList
              title="Select Payment Gateway"
              choices={[
                {
                  label: (
                    <HorizontalStack align="center" gap="2">
                      <FaCreditCard className="stripe-icon" /> 
                      <span>Stripe</span>
                    </HorizontalStack>
                  ),
                  value: "stripe",
                },
                {
                  label: (
                    <HorizontalStack align="center" gap="2">
                      <FaPaypal className="paypal-icon" /> 
                      <span>PayPal</span>
                    </HorizontalStack>
                  ),
                  value: "paypal",
                },
              ]}
              selected={selectedGateway ? [selectedGateway] : []}
              onChange={handleGatewayChange}
            />

            {selectedGateway === "stripe" && (
              <div className="form-fade-in">
                <VerticalStack gap="4">
                  <TextField
                    label="Secret Key"
                    type="password"
                    value={stripeSecretKey}
                    onChange={(value) => setStripeSecretKey(value)}
                    autoComplete="off"
                  />
                  <TextField
                    label="Publishable Key"
                    type="password"
                    value={stripePublishableKey}
                    onChange={(value) => setStripePublishableKey(value)}
                    autoComplete="off"
                  />
                </VerticalStack>
              </div>
            )}

            {selectedGateway === "paypal" && (
              <div className="form-fade-in">
                <VerticalStack gap="4">
                  <TextField
                    label="Client ID"
                    type="password"
                    value={paypalClientId}
                    onChange={(value) => setPaypalClientId(value)}
                    autoComplete="off"
                  />
                  <TextField
                    label="Client Secret"
                    type="password"
                    value={paypalClientSecret}
                    onChange={(value) => setPaypalClientSecret(value)}
                    autoComplete="off"
                  />
                </VerticalStack>
              </div>
            )}

            <Box paddingBlockStart="4">
              <Button primary onClick={handleSaveSettings} className="save-button">
                Save Settings
              </Button>
            </Box>
          </VerticalStack>
        </LegacyCard>
      </div>
    </Page>
  );
}