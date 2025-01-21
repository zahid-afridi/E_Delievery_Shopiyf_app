import React, { useEffect, useState } from "react";
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
import { FaCreditCard, FaPaypal } from "react-icons/fa";
import { ArrowLeftMinor } from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Import the CSS file
import { useSelector } from "react-redux";
import LoginForm from "../components/LoginForm.jsx";

export default function Settings() {
  const [selectedGateway, setSelectedGateway] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const navigate = useNavigate();

  const storeDetail = useSelector((state) => state.store.StoreDetail);
  console.log("StoreDetail From Redux:", storeDetail);

  const handleGatewayChange = (value) => {
    console.log("Selected Gateway:", value);
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

    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const client_Id =
        selectedGateway === "stripe" ? stripeSecretKey : paypalClientId;
      const client_secret =
        selectedGateway === "stripe"
          ? stripePublishableKey
          : paypalClientSecret;

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_Id,
          client_secret,
          Payment_Type: selectedGateway,
          store_Id: storeDetail.Store_Id,
          store_domain: storeDetail.domain,
          store_name: storeDetail.storeName,
        }),
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const getPayment = async () => {
    try {
      const response = await fetch("/api/get-payment", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("USE EFFECT ", data);
      if (data.Payment_Type === "stripe") {
        setStripeSecretKey(data.client_Id);
        setStripePublishableKey(data.client_secret);
      } else if (data.Payment_Type === "paypal") {
        setPaypalClientId(data.client_Id);
        setPaypalClientSecret(data.client_secret);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };
  const handleBackClick = () => {
    navigate("/"); // Navigate to the home route
  };

  useEffect(() => {
    getPayment();
  }, []);

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
              <Button
                primary
                onClick={handleSaveSettings}
                className="save-button"
              >
                Save Settings
              </Button>
            </Box>
          </VerticalStack>
        </LegacyCard>

      </div>
      <div>
        <LegacyCard>
        <LoginForm />
        </LegacyCard>
      </div>
    </Page>
  );
}
