import React, { useState, useEffect } from "react";
import {
  reactExtension,
  BlockStack,
  Checkbox,
  Select,
  TextField,
  Text,
  Banner,
  useBuyerJourney,

  useApplyAttributeChange,
  useApplyCartLinesChange
} from "@shopify/ui-extensions-react/checkout";

import { useTotalAmount } from "@shopify/ui-extensions-react/checkout";
import { Token } from "../../../web/frontend/AuthToken/AuthToken";

export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { amount } = useTotalAmount();
  const applyAttributeChange = useApplyAttributeChange();
  const buyerJourney = useBuyerJourney();
  const applyCartChange=useApplyCartLinesChange()

  console.log('cartline',applyCartChange)

  const [isEZDeliverySelected, setIsEZDeliverySelected] = useState(true);
  const [checked, setCheck] = useState({
    sameday: false,
    nextday: false,
    priority: false,
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [loading, setLoading] = useState(false); // Loader state
  const [errorMessage, setErrorMessage] = useState(""); // Error state

  // Monitor buyer journey completion
  useEffect(() => {
    const unsubscribeCompleted = buyerJourney.completed.subscribe(async (completed) => {
      if (completed) {
        setLoading(true); // Show loader
        setErrorMessage(""); // Reset error

        const orderData = {
          customerId: "ckgpMY0eIwXcsSoJJx09h",
          pickup: {
            address: "KARACHI",
            coordinates: [-0.15869881563038823, 51.51268479847148],
            fullName: "ALI ATHER",
            phone: "611522",
            email: "abcd@pickup.org",
          },
          delivery: {
            address: "KARACHI test",
            addressDetail: "block A2",
            coordinates: [-0.1405885408344662, 51.50785039521855],
            fullName: "mosi pann",
            phone: "1154123",
            email: "abcd@delivery.org",
          },
          service: {
            id: "1Vr4gyMBELnYNyXIpyYHE",
            options: [
              { id: "1Vr4gyMBELnYNyXIpyYHE", dataId: "QQNWe9WRid2y0mOA0bmt_" },
              { id: "JlI_Ez5wyNuXMHq4FCm_m", inputValue: "20 lbs" },
              { id: "ElGWocOJaKXTcjW782jbr", dataId: "" },
            ],
          },
          paymentMethod: "Cash",
          paymentSide: "Sender",
          draft: false,
          note: "note",
          referenceId: "ref#112",
        };

        try {
          const response = await fetch("https://wrmx.manage.onro.app/api/v1/customer/order/pickup-delivery", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Token}`,
            },
            body: JSON.stringify(orderData),
          });

          const result = await response.json();

          if (response.ok) {
            console.log("Order placed successfully:", result);
            setLoading(false); // Hide loader
          } else {
            throw new Error(result.message || "Failed to place order.");
          }
        } catch (error) {
          console.error("Order API error:", error);
          setErrorMessage("Failed to place the order. Please try again.");
          setLoading(false); // Hide loader but show error
        }
      }
    });

    return () => unsubscribeCompleted();
  }, [buyerJourney]);

  const DeliveryCheck = (name) => {
    if (name === "sameday") {
      setCheck({ sameday: true, nextday: false, priority: false });
    } else if (name === "nextday") {
      setCheck({ sameday: false, nextday: true, priority: false });
    } else if (name === "priority") {
      setCheck({ sameday: false, nextday: false, priority: true });
    }
  };

  return (
    <BlockStack spacing="loose">
      {loading && <Text>Loading... Please wait.</Text>} {/* Loader */}
      
      {errorMessage && <Banner status="critical" title={errorMessage}></Banner>} {/* Error Banner */}

      <Checkbox
        checked={isEZDeliverySelected}
        onChange={(checked) => setIsEZDeliverySelected(checked)}
      >
        EZ Delivery as a shipping service
      </Checkbox>

      {isEZDeliverySelected && (
        <>
          <Text size="medium" emphasis="strong">
            Choose Your Delivery Option:
          </Text>

          <Checkbox onChange={() => DeliveryCheck("sameday")} checked={checked.sameday}>
            Same Day Delivery - $23.50
          </Checkbox>
          <Checkbox onChange={() => DeliveryCheck("nextday")} checked={checked.nextday}>
            Next Day Delivery - $18.50
          </Checkbox>
          {checked.nextday && (
            <Select
              label="Select Time Slot"
              options={[
                { label: "8 AM - 12 PM", value: "8-12" },
                { label: "12 PM - 4 PM", value: "12-4" },
                { label: "4 PM - 8 PM", value: "4-8" },
              ]}
              onChange={setSelectedTimeSlot}
              value={selectedTimeSlot}
            />
          )}
          <Checkbox onChange={() => DeliveryCheck("priority")} checked={checked.priority}>
            Top Priority Delivery - $85.00
          </Checkbox>
        </>
      )}
    </BlockStack>
  );
}
