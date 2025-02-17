let stripe; // Declare globally
let cardNumber, cardExpiry, cardCvc; // Declare globally
let totalAmount;
let Cart_Data;
let PaymentSetup;
let UserSetup;
let AccessToken;
let IsEzdelivery;
let ServiceId;
let PostalCode;
let Loading=false
let TrackOrderUrl;
let ShippingPrice;
window.addEventListener('DOMContentLoaded', async () => {
        // Modal Toggle and Event Listeners
        const modal = document.getElementById("checkoutModal");
        const closeBtn = document.querySelector(".close-button");
        const TotalAmount = document.getElementById('Checkout_Total_Amount');
        const subtotalAmount = document.getElementById('subtotalAmount');
        const shippingCostElement = document.getElementById('shippingCost');
        const productList = document.getElementById('productList');
        const shippingSelect = document.getElementById('EzDelivery_Option');
        const checkoutButtons = document.querySelectorAll('.cart__checkout-button');
        const NextDayDate = document.getElementById('hideInput');
        // const Shipping_MethodSelection=document.getElementById('ShippingMethod')
    
        // Shipping_MethodSelection.addEventListener("change",async()=>{
        //     if(Shipping_MethodSelection.value==="ez_delivery"){
        //         shippingSelect.classList.remove('hideEzDelivery')
        //         IsEzdelivery=true
                
        //       console.log('ez_delivery click')
        //     }else if (Shipping_MethodSelection.value ==='standar_delivery') {
        //         console.log('Standar_Delivery click')
        //         IsEzdelivery=false
        //     }else if (Shipping_MethodSelection.value ==='express_delivery') {
        //         console.log('Express_Delivery click')
        //         IsEzdelivery=false
        //     } else{
        //         shippingSelect.classList.add('hideEzDelivery')
        //         shippingCostElement.classList.add('hideEzDelivery')
        //         NextDayDate.classList.add('hideEzDelivery')
    
        //         IsEzdelivery=false
        //     }
        // })
    
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const buyNowButton = document.querySelector(
            'button.shopify-payment-button__button.shopify-payment-button__button--unbranded'
          );
          if (buyNowButton) {
            buyNowButton.style.display = "none";
            console.log("'Buy it now' button is now hidden.");
          } else {
            console.log("'Buy it now' button not found.");
          }
      // Inject text and logo after buttons
      function injectTextAndLogo() {
        const productForm = document.querySelector('product-form.product-form');
        if (productForm) {
          const productFormButtons = productForm.querySelector('.product-form__buttons');
      
          if (productFormButtons) {
            // Create text div
            const textDiv = document.createElement('div');
            textDiv.style.display = 'flex';
            textDiv.style.alignItems = 'center';
            textDiv.style.marginTop = '10px';
            textDiv.style.gap = '5px'; // Add some space between logo and text
      
            // Create image element (Google Logo)
            const logoImg = document.createElement('img');
            logoImg.src = 'http://localhost:61133/assets/logo.png   '; // More appropriate Google logo URL
            logoImg.alt = 'Google Logo';
            logoImg.style.width = '30px'; // Increased logo size
            logoImg.style.height = '30px'; // Increased logo size
      
            // Create span for text
            const textSpan = document.createElement('span');
            textSpan.textContent = 'Choose EZDelivery for Same Day Delivery Or Next Day Delivery'; // Updated text
            textSpan.style.fontWeight = 'bold'; // Make text bold
      
            textDiv.appendChild(logoImg); // Logo first
            textDiv.appendChild(textSpan); // Then text
      
            productFormButtons.insertAdjacentElement('afterend', textDiv);
          }
        }
      }
      
      injectTextAndLogo();
        const sameDayDeliveryOption = document.getElementById("Same_day_delivery");
    
        if (sameDayDeliveryOption) {
            if (currentHour >= 12) {
                // After 1 PM, hide the option
                sameDayDeliveryOption.disabled=true;
                sameDayDeliveryOption.style.color = 'gray';
                
                
            } else {
                // Before 1 PM (new day starting at midnight), show the option
                sameDayDeliveryOption.disabled=false; // Ensure it's visible
                sameDayDeliveryOption.style.color = 'black';
            }
        }
        const toggleModal = (modal, show) => {
            modal.style.display = show ? 'block' : 'none';
        };
    
        // Attach Event Listeners Dynamically for Checkout Buttons
        const attachEventListeners = (buttons, modal, productListContainer, subtotalContainer, totalAmountContainer, shippingSelect, shippingCostElement) => {
            buttons.forEach((button) => {
                button.addEventListener('click', async (event) => {
                    event.preventDefault();
                    const subtotal = await fetchCartData(productListContainer, subtotalContainer, totalAmountContainer, parseFloat(shippingSelect.value || 0));
                    toggleModal(modal, true);
    
                    shippingSelect.addEventListener('change', (event) => {
                        const selectedShippingCost = parseFloat(event.target.value) || 0;
                        ShippingPrice=selectedShippingCost
                        shippingCostElement.textContent = `Rs ${selectedShippingCost.toFixed(2)}`;
                        updateUI.totalPrice(subtotal, selectedShippingCost, totalAmountContainer);
                        if (event.target.value === '18.5') {
                            console.log('next day slected')
                            ServiceId='BevoV05AI59F_Vg8X0jUF'
                            NextDayDate.classList.remove('hideNextDay_Date_Input')
                        } else if (event.target.value === "85.0") {
                            ServiceId='1Vr4gyMBELnYNyXIpyYHE'
                            NextDayDate.classList.add('hideNextDay_Date_Input')
    
                            
                        } else {
                            console.log('not slected')
                            NextDayDate.classList.add('hideNextDay_Date_Input')
                            ServiceId='jYB0d0k5Izh2iXDtGtvT3'
                        }
                    });
                });
            });
        };
    
        // Attach Event Listeners
        attachEventListeners(checkoutButtons, modal, productList, subtotalAmount, TotalAmount, shippingSelect, shippingCostElement);
    
        // Observe DOM for Dynamically Added Buttons
        const observer = new MutationObserver(() => {
            const updatedButtons = document.querySelectorAll('.cart__checkout-button');
            updatedButtons.innerHTML='loading'
            attachEventListeners(updatedButtons, modal, productList, subtotalAmount, TotalAmount, shippingSelect, shippingCostElement);
        });
    
        observer.observe(document.body, { childList: true, subtree: true });

    const Store_Data = await fetch(`https://${Shopify.shop}/apps/proxy-8/shopify_payment?store_domain=${Shopify.shop}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },

    })
    const Store_Data_Response = await Store_Data.json();
    PaymentSetup = Store_Data_Response.data.payment
    UserSetup = Store_Data_Response.data.user
    if (Store_Data.ok) {
        const CreateToken = await fetch('https://wrmx.manage.onro.app/api/v1/customer/auth/access-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "clientId": UserSetup.clientId,
                "clientSecret": UserSetup.clientSecret
            })

        })
        const CreateToken_Response = await CreateToken.json();
        AccessToken = CreateToken_Response.data.accessToken
        console.log('TokenReposne', AccessToken)
    }
    console.log('storeData', Store_Data_Response)
    console.log('Userset', UserSetup)
    console.log('paymentSetup', PaymentSetup)

// postaclcode
const postalCode = document.getElementById("postalCode");

const postalCodes = `
10033, 10040, 10034, 10453, 07024, 10032, 07632, 10452, 10463, 10039, 
10468, 10031, 10457, 10456, 07605, 07631, 10030, 10458, 10451, 07020, 
07650, 10037, 10027, 10460, 10459, 10471, 10115, 10455, 07010, 10467, 
10026, 10454, 07670, 07660, 07657, 10472, 07666, 07022, 10025, 10035,
10470, 10462, 10029, 10705, 10474, 07603, 10473, 10469, 10461, 07643, 
10128, 07621, 10702, 10466, 10024
`.split(',').map(code => code.trim());

postalCode.addEventListener("input",(event)=>{
    const inputValue = event.target.value.trim();
    const errorMessage = document.getElementById('errorPostalcodeMessage');

    if (inputValue && !postalCodes.includes(inputValue)) {
        errorMessage.textContent = "Sorry, we currently do not deliver to this postal code.";
        PostalCode=false
    } else {
        errorMessage.textContent = ""; // Clear the message if valid
        PostalCode=true
    }
})
// 
// postaclcode end
    // customer data here 
    const getFormData = () => {
        const phoneNumber = document.getElementById("Phone_Number").value;
        const email = document.getElementById("customerEmail").value;
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const country = document.getElementById("country").value;
        const city = document.getElementById("city").value;
        const streetAddress = document.getElementById("streetAddress").value;
        const postalCode = document.getElementById("postalCode").value;
        const EzDelivery_Option = document.getElementById("EzDelivery_Option").value
        const NoteTExt=document.getElementById("Note_Text").value

        return {
            phoneNumber,
            email,
            firstName,
            lastName,
            country,
            city,
            streetAddress,
            postalCode,
            EzDelivery_Option,
            NoteTExt
        };
    };
    // customer data here end
    // Dynamically Load Stripe Script
    const loadStripeScript = (key) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://js.stripe.com/v3/";
            script.onload = () => {
                if (typeof Stripe === 'function') {
                    resolve(Stripe(key));
                } else {
                    reject('Stripe function not available');
                }
            };
            script.onerror = () => reject("Failed to load Stripe script");
            document.head.appendChild(script);
        });
    };

    // Initialize Stripe Elements
    const initializeStripe = async () => {
        try {
            stripe = await loadStripeScript(PaymentSetup.client_secret);

            // Check if Stripe is found here
            if (!stripe) {
                console.error('Stripe is not loaded properly');
                return;
            }

            const elements = stripe.elements();
            cardNumber = elements.create('cardNumber');
            cardExpiry = elements.create('cardExpiry');
            cardCvc = elements.create('cardCvc');

            console.log("Elements created:", { cardNumber, cardExpiry, cardCvc });

            // Mounting Stripe Elements
            cardNumber.mount('#card-number');
            cardExpiry.mount('#card-expiry');
            cardCvc.mount('#card-cvc');
        } catch (error) {
            console.error("Error initializing Stripe:", error);
        }
    };

    // Call Stripe initialization on page load
    initializeStripe();
    //......................................EZ_DELIVERY API ......................................................................//
    // const Token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNrZ3BNWTBlSXdYY3NTb0pKeDA5aCIsInNvdXJjZSI6ImJ1c2luZXNzIiwiaWF0IjoxNzM3MDI3MzYzLCJleHAiOjE3MzcwMzA5NjN9.jrO8pZh4TzgD0aORcBjRTyYKPpV8VhwpJxiX_1ag2K4'

    const EZ_DELIVERY = async () => {
        const currentTime = new Date();
        const EzDelivery_Option = document.getElementById("EzDelivery_Option").value;
        const selectedTimeSlot = document.querySelector('input[name="subscribe"]:checked');
    
        let completeAfter = 0;
        let completeBefore = 0;
    
        if (EzDelivery_Option === '18.5' && selectedTimeSlot) { // Next Day Delivery
            const timeSlotValue = selectedTimeSlot.parentNode.querySelector('label').textContent.trim(); // Get the label text
            console.log('Selected Time Slot:', timeSlotValue); // Debugging line
          
    
            const [startTime, endTime] = timeSlotValue.split('-').map(time => {
                const [hour, ampm] = time.trim().split(/([ap]m)/i); // Split hour and am/pm
                let hourInt = parseInt(hour);
                if (ampm.toLowerCase() === 'pm' && hourInt !== 12) hourInt += 12; // Convert to 24-hour format
                if (ampm.toLowerCase() === 'am' && hourInt === 12) hourInt = 0; // Midnight case
                return hourInt;
            });
    
            const nextDay = new Date(currentTime);
            nextDay.setDate(currentTime.getDate() + 1); // Move to next day
    
            // Calculate completeAfter using the start time of the selected slot
            nextDay.setHours(startTime, 0, 0, 0);
            completeAfter = Math.floor(nextDay.getTime() / 1000);
    
            // Calculate completeBefore using the end time of the selected slot
            nextDay.setHours(endTime, 0, 0, 0);
            completeBefore = Math.floor(nextDay.getTime() / 1000);
        } else if (EzDelivery_Option === '85.0') { // Top Priority Delivery
            completeAfter = Math.floor(currentTime.getTime() / 1000);
            completeBefore = Math.floor((currentTime.getTime() + (2 * 60 * 60 * 1000)) / 1000);
           
        }
    
        console.log('timestamp after: ', completeAfter);
        console.log('timestamp before: ', completeBefore);
    
        const orderData = {
            customerId: UserSetup.customerId,
            pickup: {
                address: getFormData().streetAddress,
                addressDetail: "",
                completeAfter: completeAfter,
                completeBefore: completeBefore,
                coordinates: [-0.15869881563038823, 51.51268479847148],
                fullName: getFormData().firstName + getFormData().lastName,
                phone: getFormData().phoneNumber,
                email: getFormData().email,
                placeId: ""
            },
            delivery: {
                address: getFormData().streetAddress,
                addressDetail: "block A2",
                completeAfter: completeAfter,
                completeBefore: completeBefore,
                coordinates: [-0.1405885408344662, 51.50785039521855],
                fullName: getFormData().firstName + getFormData().lastName,
                phone: getFormData().phoneNumber,
                email: getFormData().email,
                placeId: ""
            },
            service: {
                id: ServiceId,
                options: [
              
                ]
            },
            paymentMethod: "Cash",
            paymentSide: "Sender",
            draft: false,
            codAmount: 0,
            note: getFormData().NoteTExt,
        };
    
        try {
            const response = await fetch(
                "https://wrmx.manage.onro.app/api/v1/customer/order/pickup-delivery",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${AccessToken}`,
                    },
                    body: JSON.stringify(orderData),
                }
            );
    
            const result = await response.json();
    
            if (response.ok) {
                console.log("Order placed successfully:", result);
                TrackOrderUrl=result.data.trackOrder
    
            } else {
                throw new Error(result.message || "Failed to place order.");
            }
        } catch (error) {
            console.error("Order API error:", error);
    
        }
    };
    //......................................EZ_DELIVERY API END ......................................................................//

    //###########################################SHOPIFY ORDER PLACE API START ######################################################
    const Shopify_orederPlace = async () => {
        try {
            console.log('cartdata', Cart_Data)
            const req = await fetch(`https://${Shopify.shop}/apps/proxy-8/shopify_order_place`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderData: Cart_Data,
                    customerData: getFormData()
                })
            })
            const res = await req.json()
            console.log('shopify order api', res)
        } catch (error) {
            console.log('orderapierr', error)
        }
    }
    //###########################################SHOPIFY ORDER PLACE API END ######################################################
    // Handle Payment Submit
    

    const PaymentSubmit = async (event) => {
        event.preventDefault();
        const PayNOwButton=document.getElementById('Pay__now')
        if (!PostalCode ) {
            alert(` Sorry, we currently do not deliver to this postal code.`)
        }
        console.log('formdata', getFormData())
        // Ensure Stripe and Elements are initialized
        if (!stripe || !cardNumber) {
            console.error("Stripe or card number not initialized yet.");
            return;
        }

        try {
           PayNOwButton.innerHTML='Processing...'
           PayNOwButton.disabled = true;
            const response = await fetch(`https://${Shopify.shop}/apps/proxy-8/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.floor(totalAmount) * 100,
                    StripeKey: PaymentSetup.client_Id
                }),
            });

            const { clientSecret } = await response.json();

            // Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardNumber, // Use the card number element
                },
            });

            if (error) {
                console.log('Payment failed:', error);
                PayNOwButton.innerHTML='Pay Now'
                PayNOwButton.disabled = false;

                alert(`Payment failed: ${error.message}`);
            } else if (paymentIntent.status === 'succeeded') {
                
                    await EZ_DELIVERY()  
                console.log('GetForm',getFormData())
                await Shopify_orederPlace()
                await fetch("/cart/clear.js", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  });
                 
                  getFormData()
                PayNOwButton.innerHTML='Pay Now'
                PayNOwButton.disabled = false;
                // const shopifyResponse = await Shopify_orederPlace();
                // if (shopifyResponse && shopifyResponse.order && shopifyResponse.order.order_status_url) {
                //     window.location.href = shopifyResponse.order.order_status_url;
                // } else {
                //     console.error('Failed to get order status URL');
                //     // Fallback to your existing thank you modal if needed
                // }
      // Hide form and show thank you section
      document.getElementById('SubmitForm').style.display = 'none';
    //   document.getElementById('OrderSummary').style.display='none'
      document.getElementById('thankYouSection').style.display = 'block';
      
    //   // Populate thank you data
      document.getElementById('thankYouEmaill').textContent = getFormData().email;
      document.getElementById('thankYouName').textContent = `${getFormData().firstName} ${getFormData().lastName}`;
      document.getElementById('thankYouAddress').textContent = getFormData().streetAddress;
      document.getElementById('thankYouCity').textContent = `${getFormData().city}, ${getFormData().country}`;
    //   document.getElementById('thankYouPostal').textContent = getFormData().postalCode;
      document.getElementById('thankYouTotalll').textContent = `${Cart_Data.currency}${totalAmount.toFixed(2)}`;
      document.getElementById('Shipment_Type').textContent = ShippingPrice;
      document.getElementById('priceOfProducts').textContent=`${Cart_Data.currency}${Cart_Data.total_price/100}`
      document.getElementById("Note_Text_show").textContent=getFormData().NoteTExt;
    //   document.getElementById("thankYouPostal").textContent = `${getFormData().postalCode}`;
     
     
      
    //   // If you have order number from Shopify response:
    //   if(shopifyResponse.orderNumber) {
    //     document.getElementById('thankYouOrderNumber').textContent = shopifyResponse.orderNumber;
    //   }
    //         }
    //               // Update products list
    //   const thankYouProducts = document.getElementById('thankYouProducts');
    //   thankYouProducts.innerHTML = Cart_Data.items.map(item => `
    //     <div class="thank-you-product">
    //       <p>${item.title} (x${item.quantity}) - $${(item.price / 100).toFixed(2)}</p>
    //     </div>
    //   `).join('');
    console.log('CardProduct',Cart_Data)
    const products = [
        {
          productTitle: "Classic T-Shirt",
          productImage:
            "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?cs=srgb&dl=pexels-madebymath-90946.jpg&fm=jpg",
          productQuantity: 2,
          productPrice: 19.99,
        },
        {
          productTitle: "Running Sneakers",
          productImage:
            "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?cs=srgb&dl=pexels-madebymath-90946.jpg&fm=jpg",
          productQuantity: 1,
          productPrice: 49.99,
        },
        {
          productTitle: "Stylish Hat",
          productImage:
            "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?cs=srgb&dl=pexels-madebymath-90946.jpg&fm=jpg",
          productQuantity: 3,
          productPrice: 12.99,
        },
      ];

      const mappedArr = Cart_Data.items.map((item) => {
        return `
          <div class="product-item">
            <div class="product-image">
              <img src="${item.image || "default-image.jpg"}" alt="${item.title}">
            </div>
            <div class="product-info">
              <div class="product-title">${item.title}</div>
              <div class="product-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="product-price">${Cart_Data.currency} ${item.price/100}</div>
          </div>
        `;
        })
        .join("");

      document.getElementById("Order_detail").innerHTML = mappedArr;
                }
        } catch (error) {
            console.error('Product API error:', error);
        }
        
    };
    
    document.getElementById('continueShopping').addEventListener(('click'),()=>{
        modal.style.display = 'none';
  // Reset form if needed
  document.getElementById('SubmitForm').reset();
  document.getElementById('thankYouSection').style.display = 'none';
  document.getElementById('SubmitForm').style.display = 'block';
    })
    document.getElementById('TrackTheOrder').addEventListener(('click'),(e)=>{
        e.preventDefault()
         console.log('trackurl',TrackOrderUrl)
        window.location.href=TrackOrderUrl
        modal.style.display = 'none';
  // Reset form if needed
  document.getElementById('SubmitForm').reset();
  document.getElementById('thankYouSection').style.display = 'none';
  
    })

    // Attach the PaymentSubmit to the form
    const SubmitForm = document.getElementById('SubmitForm');
    SubmitForm.addEventListener('submit', PaymentSubmit);

    // Dynamically populate UI and handle cart data (existing code for updating UI)
    const updateUI = {
        productList: (items, container) => {
            container.innerHTML = '';
            items.forEach((item) => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product');
                productDiv.innerHTML = `
                        <img src="${item.image}" alt="${item.title}">
                        <div>
                            <p>${item.title}</p>
                            <p>Quantity: ${item.quantity}</p>
                            <span>Rs ${(item.final_line_price / 100).toFixed(2)}</span>
                        </div>
                    `;
                container.appendChild(productDiv);
            });
        },
        subtotal: (subtotal, container) => {
            container.textContent = `Rs ${subtotal.toFixed(2)}`;
        },
        totalPrice: (subtotal, shippingCost, container) => {
            const total = subtotal + shippingCost;
            container.textContent = `Rs ${total.toFixed(2)}`;
            totalAmount = total;
        },
    };

    // Fetch Cart Data
    const fetchCartData = async (productListContainer, subtotalContainer, totalAmountContainer, shippingCost) => {
        try {
            const response = await fetch('/cart.js');
            if (!response.ok) throw new Error('Failed to fetch cart data');

            const data = await response.json();
            const subtotal = data.total_price / 100;
            updateUI.productList(data.items, productListContainer);
            updateUI.subtotal(subtotal, subtotalContainer);
            updateUI.totalPrice(subtotal, shippingCost, totalAmountContainer);
            Cart_Data = data


            return subtotal;
        } catch (error) {
            console.error('Cart API error:', error);
        }
    };



    console.log('Extension loaded update');
    console.log('cartdataglobaly', Cart_Data)

});