let stripe; // Declare globally
let cardNumber, cardExpiry, cardCvc; // Declare globally
let totalAmount;
let Cart_Data;
let PaymentSetup;
let UserSetup;
let AccessToken;
window.addEventListener('DOMContentLoaded', async() => {

      const Store_Data=await fetch(`https://${Shopify.shop}/apps/proxy-8/shopify_payment?store_domain=${Shopify.shop}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
           
      })
      const Store_Data_Response=await Store_Data.json();
       PaymentSetup=Store_Data_Response.data.payment
       UserSetup=Store_Data_Response.data.user
       if (Store_Data.ok) {
          const CreateToken=await fetch('https://wrmx.manage.onro.app/api/v1/customer/auth/access-token',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "clientId": UserSetup.clientId,
              "clientSecret": UserSetup.clientSecret
            })
          
          })
          const CreateToken_Response=await CreateToken.json();
          AccessToken=CreateToken_Response.data.accessToken
          console.log('TokenReposne',AccessToken)
       }
      console.log('storeData',Store_Data_Response)
      console.log('Userset',UserSetup)
      console.log('paymentSetup',PaymentSetup)
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
        const shippingMethod = document.getElementById("shippingMethod").value
      
        return {
          phoneNumber,
          email,
          firstName,
          lastName,
          country,
          city,
          streetAddress,
          postalCode,
          shippingMethod
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
    const EZ_DELIVERY=async()=>{
        const orderData = {
            customerId: UserSetup.customerId,
            pickup: {
                address: getFormData().streetAddress,

                addressDetail: "",
                completeAfter: 0,
                completeBefore: 0,
                coordinates: [-0.15869881563038823, 51.51268479847148],
                fullName: getFormData().firstName +getFormData().lastName,
                phone: getFormData().phoneNumber,
                email: getFormData().email,
                placeId: ""
            },
            delivery: {
                address: getFormData().streetAddress,
                addressDetail: "block A2",
                completeAfter: 0,
                completeBefore: 0,
                coordinates: [-0.1405885408344662, 51.50785039521855],
                fullName: getFormData().firstName +getFormData().lastName,

                phone: getFormData().phoneNumber,
                email: getFormData().email,
                placeId: ""
            },
            service: {
                id: "1Vr4gyMBELnYNyXIpyYHE",
                options: [
                    {
                        id: "1Vr4gyMBELnYNyXIpyYHE",
                        dataId: "QQNWe9WRid2y0mOA0bmt_"
                    },
                    {
                        id: "JlI_Ez5wyNuXMHq4FCm_m",
                        inputValue: "20 lbs"
                    },
                    {
                        id: "ElGWocOJaKXTcjW782jbr",
                        dataId: ""
                    }
                ]
            },
            paymentMethod: "Cash",
            paymentSide: "Sender",
            draft: false,
            codAmount: 0,
       
            note: "note",
            
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
              
            } else {
              throw new Error(result.message || "Failed to place order.");
            }
          } catch (error) {
            console.error("Order API error:", error);
            
          }
    }
//......................................EZ_DELIVERY API END ......................................................................//

//###########################################SHOPIFY ORDER PLACE API START ######################################################
  const Shopify_orederPlace=async()=>{
    try {
        console.log('cartdata',Cart_Data)
        const req=await fetch(`https://${Shopify.shop}/apps/proxy-8/shopify_order_place`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                orderData:Cart_Data,
                customerData:getFormData()
            })
        })
        const res=await req.json()
        console.log('shopify order api',res)
    } catch (error) {
        console.log('orderapierr',error)
    }
  }
//###########################################SHOPIFY ORDER PLACE API END ######################################################
    // Handle Payment Submit
    const PaymentSubmit = async (event) => {
        event.preventDefault();
         console.log('formdata',getFormData())
        // Ensure Stripe and Elements are initialized
        if (!stripe || !cardNumber) {
            console.error("Stripe or card number not initialized yet.");
            return;
        }

        try {
            const response = await fetch(`https://${Shopify.shop}/apps/proxy-8/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount:Math.floor(totalAmount) * 100,
                    StripeKey:PaymentSetup.client_Id
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
                alert(`Payment failed: ${error.message}`);
            } else if (paymentIntent.status === 'succeeded') {
                await EZ_DELIVERY()
                await Shopify_orederPlace()
                alert("Payment successful!");
            }
        } catch (error) {
            console.error('Product API error:', error);
        }
    };

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
            Cart_Data=data
            

            return subtotal;
        } catch (error) {
            console.error('Cart API error:', error);
        }
    };

    // Modal Toggle and Event Listeners
    const modal = document.getElementById("checkoutModal");
    const closeBtn = document.querySelector(".close-button");
    const TotalAmount = document.getElementById('Checkout_Total_Amount');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const shippingCostElement = document.getElementById('shippingCost');
    const productList = document.getElementById('productList');
    const shippingSelect = document.getElementById('shippingMethod');
    const checkoutButtons = document.querySelectorAll('.cart__checkout-button');
    const NextDayDate=document.getElementById('hideInput');


    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    const sameDayDeliveryOption = document.getElementById("Same_day_delivery");

    if (sameDayDeliveryOption) {
        if (currentHour >= 13) {
            // After 1 PM, hide the option
            sameDayDeliveryOption.style.display = "none";
        } else {
            // Before 1 PM (new day starting at midnight), show the option
            sameDayDeliveryOption.style.display = "block"; // Ensure it's visible
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
                    shippingCostElement.textContent = `Rs ${selectedShippingCost.toFixed(2)}`;
                    updateUI.totalPrice(subtotal, selectedShippingCost, totalAmountContainer);
                    if (event.target.value ==='18.5') {
                        console.log('next day slected')
                        NextDayDate.classList.remove('hideNextDay_Date_Input')
                    }else{
                        console.log('not slected')
                        NextDayDate.classList.add('hideNextDay_Date_Input')
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
        attachEventListeners(updatedButtons, modal, productList, subtotalAmount, TotalAmount, shippingSelect, shippingCostElement);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log('Extension loaded');
console.log('cartdataglobaly',Cart_Data)

});
