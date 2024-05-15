export default{
    template:`<div>
    <h1>Your Cart</h1>

    <div v-if="cart.products && cart.products.length === 0">
      <p>Your cart is empty.</p>
    </div>

    <div v-else>
      <div v-for="item in cart.products" :key="item.p_name" class="cart-item">
        <p>
          <span class="product-name">{{ item.p_name }}</span>
          <span class="quantity">Quantity: {{ item.quantity }}</span>
          <span class="price">Price: Rs.{{ item.price }}</span>
          <span class="total-price">Total Price: Rs.{{ item.total_price || 'N/A' }}</span>
          <button @click="deleteItem(item)" class="btn btn-sm btn-danger">Delete</button>
        </p>
      </div>

      <p class="total-price-all">Total Price for All Products: Rs.{{ cart.totals && cart.totals.total || 'N/A' }}</p>

      <button v-if="!showAddressForm" @click="toggleAddressForm" class="btn btn-primary">Proceed to Buy</button>
    </div>
    <div v-if="showAddressForm" class="address-form">
      <h2>Enter Shipping Address</h2>
      <!-- Your address form fields go here -->
      <form @submit.prevent="placeOrder">
        <label for="name">Name:</label>
        <input type="text" v-model="address.name" required>

        <label for="phone">Phone:</label>
        <input type="text" v-model="address.phone" required>

        <label for="street">Street:</label>
        <input type="text" v-model="address.street" required>

        <!-- Add more address fields as needed -->

        <button type="submit" class="btn btn-primary">Place Order</button>
      </form>
    </div>
  </div>
`,
  data() {
    return {
        cart: {
            products: [],
            totals: {},
          },
      token: localStorage.getItem('auth-token'),
      showAddressForm: false,
      address: {
        name: '',
        phone: '',
        street: '',
      },
    };
  },
  mounted() {
    this.fetchCart();
  },

  methods: {
    async fetchCart() {
      try {
        const response = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', data);
          console.log('Products:', this.cart.products);
          console.log('Totals:', this.cart.totals);
          if (data && data.totals) {
            this.cart.products = data.products || [];  // Ensure that data.products is an array
            this.cart.totals = data.totals;
          }
        } else {
          console.error('Error fetching cart:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },

    async deleteItem(item) {
      // Implement the logic to delete the item from the cart
      try {
        const response = await fetch(`/api/cart/${item.p_name}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Item deleted successfully, update the cart
          alert(data.message);
          this.fetchCart();
        } else {
          console.error('Error deleting item from cart:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },

    toggleAddressForm() {
      this.showAddressForm = !this.showAddressForm;
    },
    async placeOrder() {
      try {
        // Make an API request to place the order with the entered address
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: this.address,
          }),
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log('Order placed successfully:', data);
    
          // Reset the form and update the cart
          this.showAddressForm = false;
          this.address = { name: '', phone: '', street: '' }; // Reset address fields
          this.fetchCart();
    
          // Optionally, you can provide feedback to the user, e.g., show a success message
          alert('Order placed successfully!');
        } else {
          console.error('Error placing order:', response.status, response.statusText);
          // Optionally, provide feedback to the user about the error
          alert('Error placing order. Please try again.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // Optionally, provide feedback to the user about the error
        alert('Error placing order. Please try again.');
      }
    },
    async placeOrder() {
      try {
        // Make an API request to place the order with the entered address
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: this.address,
          }),
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log('Order placed successfully:', data);
    
          // Reset the form and update the cart
          this.showAddressForm = false;
          this.address = { name: '', phone: '', street: '' }; // Reset address fields
          this.fetchCart();
    
          // Optionally, you can provide feedback to the user, e.g., show a success message
          alert('Order placed successfully!');
          this.$router.push('/') 
        } else {
          console.error('Error placing order:', response.status, response.statusText);
          // Optionally, provide feedback to the user about the error
          alert('Error placing order. Please try again.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // Optionally, provide feedback to the user about the error
        alert('Error placing order. Please try again.');
      }
    },
        
  },
  created() {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    body {
      background-color: #f4f4f4; /* Set the desired background color for the entire page */
    }
    .cart-item {
      border: 1px solid #ddd;
      padding: 10px;
      margin: 10px 0;
      border-radius: 5px;
      background-color: #f8f9fa;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  
    .product-name {
      font-weight: bold;
      margin-right: 10px;
    }
  
    .quantity,
    .price,
    .total-price {
      margin-right: 20px;
    }
  
    .btn-danger {
      margin-left: 10px;
    }
  
    .total-price-all {
      font-weight: bold;
      margin-top: 20px;
    }
  
    .address-form {
      margin-top: 20px;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
      background-color: #f8f9fa;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
      `;
    document.getElementsByTagName('head')[0].appendChild(style);
  },
}  