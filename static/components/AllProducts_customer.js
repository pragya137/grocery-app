export default{
  template: `<div>
  <div>
  <!-- Search bar -->
  <h5>
  <div class="search-bar">
    <label for="searchInput"></label>
    <i class="fa fa-search" aria-hidden="true"></i>
    <input v-model="searchQuery" placeholder="Search categories and products" />
    <button @click="search" class="btn btn-sm btn-dark">Search</button>
  </div>
  </h5>
  <div class="featured-section" style="background-image: url('static/360_F_335853625_3K72uAMROWzKAwbw4vJnAmlHZapg0GAu.jpg');">
  </br>
  </br>
  </br>
  <h1 style="text-align: center; color: #fff; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);"><b><i>Find grocery items for your Kitchen</i></b></h1>
  </br>
  </br>
  </br>
  </br>
  </br>
</div>
<div v-if="searchClicked" class="search-results">
<div v-if="searchResults.length > 0">
  <h3>Search Results</h3>
  <div v-for="result in searchResults" :key="result.id" class="search-result">
  <div-if="result.type === 'category'">
      <!-- Display category information -->
      <h3>{{ result.name }}</h3>
      <p>{{ result.description }}</p>
    </tdiv>
    <div class="products-container">
    <div v-else-if="result.type === 'product'" class="product-box">
      <h4>{{ result.name }}</h4>
      <p>Manufacture Date: {{ result.manufacture_date }}</p>
      <p>Expiry Date: {{ result.expiry_date }}</p>
      <p>Rate per Unit: Rs.{{ result.rate_per_unit }}</p>
      <p>
      <div v-if="result.unit > 0">
      <button @click="openAddToCartModal(result)" class="btn btn-sm btn-success">Add to Cart</button>
    </div>
    <div v-else>
      <span class="text-danger">Out of Stock</span>
    </div>
    </p>
    </div>
    </div>
    </div>
  </div>
<div v-else>
  <p>No results found.</p>
</div>
</div>
  <h2>All Products</h2>
    <div class="products-container">
      <div v-for="product in products" :key="product.p_id" class="product-box">
        <h3>{{ product.name }}</h3>
        <p>Manufacture Date: {{ product.manufacture_date }}</p>
        <p>Expiry Date: {{ product.expiry_date }}</p>
        <p>Rate per Unit: Rs.{{ product.rate_per_unit }}</p>
        <p v-if="product.unit > 0">
          <button @click="openAddToCartModal(product)" class="btn btn-sm btn-success">Add to Cart</button>
        </p>
        <p v-else class="text-danger">Out of Stock</p>
      </div>
    </div>

  <div class="modal" id="addcartModal" tabindex="-1" role="dialog" aria-labelledby="addcartModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addProductModalLabel">Add Quantity</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeAddtoCartModal">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <!-- Add form fields for adding quantity to a product -->
        <form @submit.prevent="addQuantity">
          <div class="form-group">
            <label for="productQuantity">Quantity</label>
            <input type="number" class="form-control" v-model="quantity" id="productQuantity" required>
          </div>

          <!-- Close the form properly -->
          <button type="submit" class="btn btn-primary">Add Quantity</button>
        </form>
      </div>
    </div>
  </div>
</div>


</div>`,

data() {
  return {
      products: [],
      token: localStorage.getItem('auth-token'),
      quantity: 1, // New property for quantity
      selectedProduct: null,
      searchQuery: '',
      searchResults: [],
      searchClicked: false,
    };
},

computed: {
  filteredCategories() {
    if (!this.searchQuery) {
      return this.categories;
    }

    const lowercaseQuery = this.searchQuery.toLowerCase();
    return this.categories.filter(category => {
      // Check if the category name or any product name matches the search query
      return (
        category.name.toLowerCase().includes(lowercaseQuery) ||
        category.products.some(product => product.name.toLowerCase().includes(lowercaseQuery))
      );
    });
  },
},




methods: {
  async fetchproducts() {
      try {
        const res = await fetch('/api/product', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.products = data;
        } else {
          console.error('Error fetching categories:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },

    openAddToCartModal(product) {
      // Set the selected product
      this.selectedProduct = product;
      // Use the correct modal ID
      $('#addcartModal').modal('show');
    },

    closeAddtoCartModal() {
      // Clear the selected product and quantity when closing the modal
      this.selectedProduct = null;
      this.quantity = 1;
      // Use the correct modal ID
      $('#addcartModal').modal('hide');
    },

    async addQuantity() {
      // Check if a product is selected
      if (this.selectedProduct) {
        // Update the quantity of the selected product
        this.selectedProduct.quantity = (this.selectedProduct.quantity || 0) + this.quantity;

        // Make a POST request to the /cart API endpoint
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_name: this.selectedProduct.name,
              quantity: this.quantity,
              price: this.selectedProduct.rate_per_unit
            }),
          });

          if (res.ok) {
            // Show an alert to the user
            alert('Product added to cart successfully!');
          } else {
            console.error('Error adding product to cart:', res.status, res.statusText);
          }
        } catch (error) {
          console.error('Fetch error:', error);
        }

        // Close the modal
        this.closeAddtoCartModal();
    }

},
async search() {
  this.searchClicked = true;
  if (this.searchQuery !== '') {
  try {
    const response = await fetch(`/api/search?query=${this.searchQuery}`, {
      method: 'GET',
      headers: {
        'Authentication-Token': localStorage.getItem('auth-token'),
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      this.searchResults = data;
    } else {
      console.error('Error fetching search results:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
else {
  // If the search query is empty, reset the search results
  this.searchResults = [];
}
}

},


created() {
  this.fetchproducts();
  let style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
  body {
    background-color: #f4f4f4; /* Set the desired background color for the entire page */
  }
  .welcome-container {
    text-align: center;
    margin-top: 20px;
    }
    
    .category-container {
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .category-title {
    color: #007bff;
    }
    
    .category-description {
    color: #495057;
    }
    
    
    
    .product-card {
    border: 1px solid #ddd;
    padding: 15px;
    margin: 10px;
    border-radius: 10px;
    background-color: #f8f9fa;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .products-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
    }

    .product-box {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 10px;
      border-radius: 10px;
      background-color: #F8F8FF;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .text-danger {
      color: #dc3545;
    }

    .search-results {
      margin-top: 20px;
    }

    .search-result {
      border: 1px solid #ccc;
      padding: 5px;
      margin-bottom: 10px;
    }

    .search-result h3 {
      margin-bottom: 5px;
    }

    .search-result p {
      margin-bottom: 10px;
    }

    .search-bar {
      display: flex;
      align-items: center; /* Align items vertically in the center */
      background-color: #f8f9fa;
      max-width: 500px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 5px;
      margin: 0 auto;
    }
  
    .fa-search {
      margin-right: 5px;
    }
  
    input {
      flex: 1;
      border: none;
      padding: 8px;
      border-radius: 5px;
      outline: none;
    }
  
    button {
      background-color: #343a40; /* Use your preferred color */
      color: #fff;
      border: none;
      padding: 8px 15px;
      border-radius: 5px;
      cursor: pointer;
      margin-left: 5px; /* Add margin to the left to separate the button from the input */
    }
  
    button:hover {
      background-color: #23272b; /* Use your preferred hover color */
    }
    
`;
    document.getElementsByTagName('head')[0].appendChild(style);


}
}