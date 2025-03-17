import {
  reactExtension,
  Banner,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useShippingAddress,
  useShippingOptionTarget,
  useBuyerJourneyIntercept
} from "@shopify/ui-extensions-react/checkout";
import { useState, useEffect } from "react";

export default reactExtension("purchase.checkout.shipping-option-item.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  const { shippingOptionTarget, isTargetSelected } = useShippingOptionTarget();
  const shippingAddress = useShippingAddress();
  const [isUSAddress, setIsUSAddress] = useState(true); // Initialize isUSAddress
  const [isValidState, setIsValidState] = useState(true); //State validation

  useEffect(() => {
    if (shippingAddress) {
      setIsUSAddress(shippingAddress.countryCode === 'US');
      // Check if the provinceCode is 'SD' (South Dakota)
      setIsValidState(shippingAddress.provinceCode === 'NY' || shippingAddress.provinceCode === 'NJ');
    }
  }, [shippingAddress]);
console.log('shippingAddress',shippingAddress)
  useBuyerJourneyIntercept(({canBlockProgress})=>{
    if (canBlockProgress && !isUSAddress || canBlockProgress && !isValidState) {
      return{
        behavior:"block",
        reason:"Ez Delivery only deliver in us"
      }
    }else{
      return {
        behavior:"allow"
      }
    }
  })
  const shippingTitle = shippingOptionTarget.title;

  if (isTargetSelected) {
    console.log('Selected shipping method:', shippingTitle);
  }

  if (!instructions.attributes.canUpdateAttributes) {
    return (
      <Banner title="checkout-ui" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  return (
    <>
      {(isTargetSelected && (shippingTitle === 'Same day Ez Delivery' || shippingTitle === 'Next day Ez Delivery')) &&
        (!isUSAddress ? (
          <Banner title="Warning" status="critical">
            <Text>
              Ez Delivery is only available in the US.
            </Text>
          </Banner>
        ) : !isValidState && (  // Check for isValidState
          <Banner title="Warning" status="critical">
            <Text>
              Ez Delivery is only available in New York and New Jersey State.
            </Text>
          </Banner>
        )
        )
      }
    </>
  );
}

// Zip Code condation

// !isZipcodeValid && (
//   <Banner title="Warning" status="critical">
//      <Text>
//        Ez Delivery is not available for this {shippingAddress.zip} Postal code. Please enter a valid Postal Code.
//     </Text>
//   </Banner>


// const [zipcodes, setZipcodes] = useState([
//   "10033", "10040", "10034", "10453", "07024", "10032", "07632", "10452", "10463", "10039",
//   "10468", "10031", "10457", "10456", "07605", "07631", "10030", "10458", "10451", "07020",
//   "07650", "10037", "10027", "10460", "10459", "10471", "10115", "10455", "07010", "10467",
//   "10026", "10454", "07670", "07660", "07657", "10472", "07666", "07022", "10025", "10035",
//   "10470", "10462", "10029", "10705", "10474", "07603", "10473", "10469", "10461", "07643",
//   "10128", "07621", "10702", "10466", "10024"
// ]);