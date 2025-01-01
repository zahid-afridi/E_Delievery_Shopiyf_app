import React from "react";
import {
  reactExtension,
  BlockStack,
  Select,
  TextField,
  Text,
  Checkbox,
useBuyerJourney,
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
  
  const buyerJourney = useBuyerJourney();

  // Log the buyerJourney result to inspect the data
  React.useEffect(() => {
    console.log("Buyer Journey:", buyerJourney);

    // Check if the buyer has completed the order and log a success message
    const unsubscribeCompleted = buyerJourney.completed.subscribe(async(completed) => {
      if (completed) {
      console.log('api hiting')
      const data={
        "customerId": "ckgpMY0eIwXcsSoJJx09h",
        "pickup": {
            "address": "KARACHI",
            "coordinates": [-0.15869881563038823, 51.51268479847148],
            "fullName": "ALI ATHER",
            "phone": "611522",
            "email": "abcd@pickup.org"
        },
        "delivery": {
            "address": "KARACHI test",
            "addressDetail": "block A2",
            "coordinates": [-0.1405885408344662, 51.50785039521855],
            "fullName": "mosi pann",
            "phone": "1154123",
            "email": "abcd@delivery.org"
        },
        "service": {
            "id": "1Vr4gyMBELnYNyXIpyYHE",
            "options": [
                { "id": "1Vr4gyMBELnYNyXIpyYHE", "dataId": "QQNWe9WRid2y0mOA0bmt_" },
                { "id": "JlI_Ez5wyNuXMHq4FCm_m", "inputValue": "20 lbs" },
                { "id": "ElGWocOJaKXTcjW782jbr", "dataId": "" }
            ]
        },
        "paymentMethod": "Cash",
        "paymentSide": "Sender",
        "draft": false,
        "note": "note",
        "referenceId": "ref#112"
    }
     try {
      const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNrZ3BNWTBlSXdYY3NTb0pKeDA5aCIsInNvdXJjZSI6ImJ1c2luZXNzIiwiaWF0IjoxNzM1NzMxNzQwLCJleHAiOjE3MzU3MzUzNDB9.nd042zuDSiFplLYqWOdhx2ZGZqNPicYYlXvmdQMFero'
      const req=await fetch('https://wrmx.manage.onro.app/api/v1/customer/order/pickup-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      const response=await req.json();
      console.log('order deivlerd',response)
     } catch (error) {
      console.log('order deiliver api erro',error)
     }
        console.log("Order placed successfully");
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribeCompleted();
  }, [buyerJourney]);
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
