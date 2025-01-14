window.addEventListener('DOMContentLoaded', () => {
    console.log('extension loaded');

    const modal = document.getElementById("checkoutModal");
    const closeBtn = document.querySelector(".close-button");
    const TotalAmount = document.getElementById('Checkout_Total_Amount');
    const subtotalAmount = document.getElementById('subtotalAmount');
    const shippingCostElement = document.getElementById('shippingCost');
    const productList = document.getElementById('productList');
    const shippingSelect = document.getElementById('shippingMethod'); // Shipping method dropdown
    const SubmitForm=document.getElementById('SubmitForm')

    let cartTotal = 0; // Base cart total
    let selectedShippingCost = 0; // Selected shipping cost

    // Close modal function
    closeBtn.onclick = () => modal.style.display = "none";

    // Fetch cart data from the API
    const CartData = async () => {
        try {
            const response = await fetch('/cart.js');
            const data = await response.json();
            console.log('cartapi', data);

            if (response.ok) {
                cartTotal = data.total_price / 100; // Base cart total
                updateProductList(data.items); // Update product list in the modal
                updateSubtotal(); // Update subtotal
            }
        } catch (error) {
            console.error('cart api error', error);
        }
    };

    // Update product list
    const updateProductList = (items) => {
        productList.innerHTML = ''; // Clear existing items
        items.forEach(item => {
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

            productList.appendChild(productDiv);
        });
    };

    // Update subtotal
    const updateSubtotal = () => {
        subtotalAmount.textContent = `Rs ${cartTotal.toFixed(2)}`;
        updateTotalPrice(); // Update total price
    };

    // Update total price
    const updateTotalPrice = () => {
        const totalPrice = cartTotal + selectedShippingCost;
        TotalAmount.textContent = `Rs ${totalPrice.toFixed(2)}`;
    };

    // Event listener for shipping method selection
    shippingSelect.addEventListener('change', (event) => {
        selectedShippingCost = parseFloat(event.target.value) || 0;
        shippingCostElement.textContent = `Rs ${selectedShippingCost.toFixed(2)}`;
        updateTotalPrice(); // Update total price
    });

    // Show modal function
    const showModal = (event) => {
        event.preventDefault();
        CartData();
        modal.style.display = "block";
    };

    // Attach event listeners to checkout buttons
    const attachClickListener = (button) => {
        if (button) {
            button.addEventListener('click', showModal);
        }
    };

    // Target all buttons with the class `cart__checkout-button`
    const checkoutButtons = document.querySelectorAll('.cart__checkout-button');
    checkoutButtons.forEach(attachClickListener);

    // Optional: MutationObserver to handle dynamically loaded buttons
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            const updatedButton = document.getElementById('CartDrawer-Checkout');
            if (updatedButton) {
                attachClickListener(updatedButton);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });




// handleSubmit function start 
const handleSumbit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    alert('hello');
};

SubmitForm.addEventListener('submit', handleSumbit);

// handleSubmit function end










});




