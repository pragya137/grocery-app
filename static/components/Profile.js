export default {
  template: `
  <div>
  <div class="user-profile-container">
    <h2>User Profile</h2>
    <div v-if="user">
      <p class="welcome-message">Welcome, {{ user.username }}!</p>

      <div class="order-history">
        <h3>Order History</h3>
        <ul v-if="user.orders && user.orders.length" class="order-list">
          <li v-for="order in user.orders" :key="order.id" class="order-item">
            <p><strong>Product Name:</strong> {{ order.product_name }}</p>
            <p><strong>Quantity:</strong> {{ order.quantity }}</p>
            <p><strong>Price:</strong> {{ order.price }}</p>
            <p><strong>Time:</strong> {{ order.timestamp}}</p>

          </li>
        </ul>
        <p v-else class="no-orders">No order history available.</p>
      </div>
    </div>
    <p v-else>Loading user information...</p>
  </div>
</div>
  `,
  data() {
    return {
      user: null,
      token: localStorage.getItem('auth-token')
    };
  },
  methods: {
    async getUserData() {
      try {
        const response = await fetch('/api/order', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token, 
          }
        });
        if (response.ok) {
          const userData = await response.json();
          this.user = userData;
        } else {
          console.error('Error fetching user information:', response.status, response.statusText);
          // Handle error, e.g., show an error message to the user
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // Handle error, e.g., show an error message to the user
      }
    },
  },
  created() {
    this.getUserData();
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML =`
    body {
      background-color: #f4f4f4; /* Set the desired background color for the entire page */
    }
    .user-profile-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    
    .welcome-message {
      font-size: 1.5em;
      color: #333;
    }
    
    .order-history {
      margin-top: 20px;
    }
    
    .order-list {
      list-style: none;
      padding: 0;
    }
    
    .order-item {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      background-color: #F8F8FF;
      margin-bottom: 10px;
    }
    
    .no-orders {
      color: #888;
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);

  },
};
