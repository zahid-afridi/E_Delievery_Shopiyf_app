import React from "react";
import {
  reactExtension,
  BlockStack,
  Select,
  TextField,
  Text,
  Checkbox,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  Banner,
  Image
} from "@shopify/ui-extensions-react/checkout";

import { useTotalAmount } from "@shopify/ui-extensions-react/checkout";



export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
 
  const translate = useTranslate();
  const { extension } = useApi();
  const {amount}=useTotalAmount();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
 
 console.log('checkout',amount)
  const [isEZDeliverySelected, setIsEZDeliverySelected] = React.useState(true);
  const [checked, setCheck] = React.useState({
    sameday: false,
    nextday: false,
    priority: false,
  });
  const [selectedDeliveryOption, setSelectedDeliveryOption] = React.useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState("");

  const DeliveryCheck = (name) => {
    if (name === "sameday") {
      setSelectedDeliveryOption(name);
      setCheck((prev) => ({
        sameday: !prev.sameday,
        nextday: false,
        priority: false,
      }));
    } else if (name === "nextday") {
      setSelectedDeliveryOption(name);
      setCheck((prev) => ({
        sameday: false,
        nextday: !prev.nextday,
        priority: false,
      }));
    } else if (name === "priority") {
      setSelectedDeliveryOption(name);
      setCheck((prev) => ({
        sameday: false,
        nextday: false,
        priority: !prev.priority,
      }));
    } else {
      setSelectedDeliveryOption("");
      setCheck({ sameday: false, nextday: false, priority: false });
    }
  };

  // Time slots for Next Day Delivery
  const timeSlots = [
    { label: "8 AM - 12 PM", value: "8-12" },
    { label: "12 PM - 4 PM", value: "12-4" },
    { label: "4 PM - 8 PM", value: "4-8" },
  ];

  return (
    <BlockStack spacing="loose">
      
     
      <Checkbox
        checked={isEZDeliverySelected}
        onChange={(checked) => {
          setIsEZDeliverySelected(checked);
          handleEZDeliveryChange(checked);
        }}
      >
        EZ Delivery as a shipping service
      </Checkbox>

     

      {isEZDeliverySelected && (
        <>
          <Text size="medium" emphasis="strong">
            Choose Your Delivery Option:
          </Text>

          <Checkbox
            onChange={() => DeliveryCheck("sameday")}
            checked={checked.sameday}
          >
            Same Day Delivery - $23.50
          </Checkbox>
          <Checkbox
            onChange={() => DeliveryCheck("nextday")}
            checked={checked.nextday}
          >
            Next Day Delivery - $18.50
          </Checkbox>

          {checked.nextday && (
            <Select
              label="Select Time Slot"
              options={timeSlots}
              onChange={(value) => setSelectedTimeSlot(value)}
              value={selectedTimeSlot}
            />
          )}

          <Checkbox
            onChange={() => DeliveryCheck("priority")}
            checked={checked.priority}
          >
            Top Priority Delivery - $85.00
          </Checkbox>

          {checked.priority && (
            <Banner status="success" title="Delivered within 2 hrs"></Banner>
          )}

          <TextField
            label="Special Instructions"
            multiline
            onChange={(value) => handleSpecialInstructionsChange(value)}
          />
        </>
      )}
    </BlockStack>
  );

  // Handlers for attribute changes
  async function handleEZDeliveryChange(isChecked) {
    await applyAttributeChange({
      key: "ezDeliveryEnabled",
      type: "updateAttribute",
      value: isChecked ? "true" : "false",
    });
  }

  async function handleSpecialInstructionsChange(value) {
    await applyAttributeChange({
      key: "specialInstructions",
      type: "updateAttribute",
      value,
    });
  }
}
