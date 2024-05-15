export default {
  template: `<div>
  <h2><div>Welcome Manager</div></h2>
  <div class="show-requests-button">
  <button class="btn btn-secondary" @click='downlodResource'>
    <i class="fa fa-download" aria-hidden="true"></i> Download Product file
  </button>
  <span v-if='isWaiting'> Waiting... </span>
</div>

  <div class="table-responsive">
  <table class="table table-bordered table-striped" style="background-color: #f8f9fa;">
  <thead class="thead-dark">
        <tr>
          <th>Id</th>
          <th>Category Name</th>
          <th>Category Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category.c_id">
          <td>{{ category.c_id}}
          <td>{{ category.name }}</td>
          <td>{{ category.description }}</td>
          <td>
            <button @click="openUpdateRequestModal(category)" class="btn btn-sm btn-success">Request Update</button>
            <button @click="deleteRequest(category.c_id)" class="btn btn-sm btn-danger">Request Delete</button>
            <button @click="fetchProducts(category.c_id)" class="btn btn-sm btn-info">Show Products</button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

  <!-- Update Request Modal -->
  <div class="modal" id="updateRequestModal" tabindex="-1" role="dialog" aria-labelledby="updateRequestModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateRequestModalLabel">Update Request</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeUpdateRequestModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Add form fields for updating a category -->
          <form @submit.prevent="updateRequest">
            <div class="form-group">
              <label for="updateCategoryName">Category Name</label>
              <input type="text" class="form-control" v-model="selectedCategory.name" id="updateCategoryName" required>
            </div>
            <div class="form-group">
              <label for="updateCategoryDescription">Category Description</label>
              <textarea class="form-control" v-model="selectedCategory.description" id="updateCategoryDescription" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Request Update</button>
          </form>
        </div>
      </div>
    </div>
  </div>
  <!-- Display selected category products in a table -->
  <div v-if="selectedCategoryProducts.length > 0">
    <h2>Products in Selected Category</h2>
    <div class="table-responsive">
    <table class="table table-bordered table-striped" style="background-color: #f8f9fa;">
    <thead class="table-dark">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Manufacture Date</th>
                  <th>Expiry Date</th>
                  <th>Rate per Unit</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in selectedCategoryProducts" :key="product.p_id">
                  <td>{{ product.name }}</td>
                  <td>{{ product.manufacture_date }}</td>
                  <td>{{ product.expiry_date }}</td>
                  <td>Rs.{{ product.rate_per_unit }}</td>
                  <td>{{ product.unit }}</td>
                  <td>
                    <button @click="openUpdateProductModal(product)" class="btn btn-sm btn-success">Update</button>
                    <button @click="deleteProduct(product.p_id)" class="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        <!-- Update Product Modal -->
        <div class="modal" id="updateProductModal" tabindex="-1" role="dialog" aria-labelledby="updateProductModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="updateProductModalLabel">Update Product</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeUpdateProductModal">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <!-- Add form fields for updating a product -->
                <form @submit.prevent="updateProduct">
                  <div class="form-group">
                    <label for="productName">Product Name</label>
                    <input type="text" class="form-control" v-model="updatedProduct.name" id="productName" required>
                  </div>
                  <div class="form-group">
                    <label for="manufactureDate">Manufacture Date</label>
                    <input type="date" class="form-control" v-model="updatedProduct.manufacture_date" id="manufactureDate" required>
                  </div>
                  <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="date" class="form-control" v-model="updatedProduct.expiry_date" id="expiryDate" required>
                  </div>
                  <div class="form-group">
                    <label for="unit">Unit</label>
                    <input type="number" class="form-control" v-model="updatedProduct.unit" id="unit" required>
                  </div>
                  <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" class="form-control" v-model="updatedProduct.rate_per_unit" id="price" required>
                  </div>
                  <div class="form-group">
                    <label for="category">Category</label>
                    <select class="form-control" v-model="updatedProduct.category_id" id="category" required>
                      <option v-for="category in categories" :key="category.c_id" :value="category.c_id">{{ category.name }}</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">Update Product</button>
                </form>
              </div>
            </div>
          </div>
        </div>
</div>`,

  data() {
    return {
      categories: [],
      selectedCategory: { name: '', description: '', c_id: null },
      token: localStorage.getItem('auth-token'),
      selectedCategoryProducts: [],
      updatedProduct: {
        p_id: null,
        name: '',
        manufacture_date: '',
        expiry_date: '',
        unit: 0,
        rate_per_unit: 0,
        category_id: null,
      },
      isWaiting: false,
    };
  },

  methods: {
    async fetchCategories() {
      try {
        const res = await fetch('/api/category', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token, 
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.categories = data;
        } else {
          console.error('Error fetching categories:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },
    openUpdateRequestModal(category) {
      this.selectedCategory = { ...category }; // Create a copy of the category to avoid modifying the original
      $('#updateRequestModal').modal('show');
    },

    closeUpdateRequestModal() {
      $('#updateRequestModal').modal('hide');
    },

    async updateRequest() {
      try {
        const res = await fetch(`/api/update-request`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.selectedCategory.name,
            description: this.selectedCategory.description,
            category_id: this.selectedCategory.c_id
          }),
        });

        const data = await res.json();

        if (res.ok) {
          if (data.message) {
            alert(data.message);
          } else {
            console.error('Server response is missing the "message" property:', data);
          }
          this.closeUpdateRequestModal();
          this.fetchCategories(); // Refresh the category list after updating
        } else {
          if (data.message) {
            alert(data.message);
          } else {
            console.error('Server response is missing the "message" property:', data);
          }
        }
      } catch (error) {
        console.error('Error updating category:', error);
      }
    },
    async deleteRequest(categoryId) {
      if (confirm('Are you sure you want to request for deleting this category?')) {
        try {
          const res = await fetch(`/api/delete-request`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category_id: categoryId,
          }),
        });
  
          const data = await res.json();
  
          if (res.ok) {
            if (data.message) {
              alert(data.message);
            } else {
              console.error('Server response is missing the "message" property:', data);
            }
            this.fetchCategories(); // Refresh the category list after deleting
          } else {
            if (data.message) {
              alert(data.message);
            } else {
              console.error('Server response is missing the "message" property:', data);
            }
          }
        } catch (error) {
          console.error('Error request to delete category:', error);
        }
      }
    },
    async fetchProducts(categoryId) {
      try {
        const res = await fetch(`/api/category_product/${categoryId}`, {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.selectedCategoryProducts = data;
        } else {
          console.error('Error fetching products:', res.status, res.statusText);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },
    openUpdateProductModal(product) {
      this.updatedProduct = { ...product }; // Copy product data to the updatedProduct
      $('#updateProductModal').modal('show');
    },

    closeUpdateProductModal() {
      $('#updateProductModal').modal('hide');
    },

    async updateProduct() {
      this.updatedProduct.category_id = parseInt(this.updatedProduct.category_id);
    
      // Update local data first
      const updatedProductIndex = this.selectedCategoryProducts.findIndex(product => product.p_id === this.updatedProduct.p_id);
    
      if (updatedProductIndex !== -1) {
        // Update the product in the array
        this.$set(this.selectedCategoryProducts, updatedProductIndex, { ...this.updatedProduct });
      }
    
      try {
        const res = await fetch(`/api/product/${this.updatedProduct.p_id}`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.updatedProduct),
        });
    
        const data = await res.json();
    
        if (res.ok) {
          if (data.message) {
            alert(data.message);
          } else {
            console.error('Server response is missing the "message" property:', data);
          }
          this.closeUpdateProductModal();
          // Note: You may not need to call fetchProducts() here if the data is already updated
        } else {
          if (data.message) {
            alert(data.message);
          } else {
            console.error('Server response is missing the "message" property:', data);
          }
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },
    

    async deleteProduct(productId) {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          const res = await fetch(`/api/product/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token'),
              'Content-Type': 'application/json',
            },
          });
    
          const data = await res.json();
    
          if (res.ok) {
            if (data.message) {
              alert(data.message);
            } else {
              console.error('Server response is missing the "message" property:', data);
            }
    
            // Update local data immediately
            const deletedProductIndex = this.selectedCategoryProducts.findIndex(product => product.p_id === productId);
    
            if (deletedProductIndex !== -1) {
              // Remove the product from the array
              this.selectedCategoryProducts.splice(deletedProductIndex, 1);
            }
          } else {
            if (data.message) {
              alert(data.message);
            } else {
              console.error('Server response is missing the "message" property:', data);
            }
          }
        } catch (error) {
          console.error('Error deleting product:', error);
        }
      }
    },
    async downlodResource() {
      this.isWaiting = true
      const res = await fetch('/download-csv')
      const data = await res.json()
      if (res.ok) {
        const taskId = data['task-id']
        const intv = setInterval(async () => {
          const csv_res = await fetch(`/get-csv/${taskId}`)
          if (csv_res.ok) {
            this.isWaiting = false
            clearInterval(intv)
            window.location.href = `/get-csv/${taskId}`
          }
        }, 1000)
      }
    },
  },

  // Call the fetchCategories method when the component is created
  created() {
    this.fetchCategories();
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    body {
      background-color: #f4f4f4; /* Set the desired background color for the entire page */
    }
    .welcome {
      font-size: 24px;
      margin-bottom: 20px;
      color: #007bff;
    }
  
    /* Table styles */
    .table-bordered {
      border: 2px solid #dee2e6;
    }
  
    /* Modal styles */
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
  
    .modal-content {
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 0.3rem;
      box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
    }
  
    .modal-header {
      border-bottom: 1px solid #dee2e6;
    }
  
    .modal-title {
      margin-bottom: 0;
    }
  
    .modal-body {
      position: relative;
      padding: 1rem;
    }
  
    .modal-footer {
      border-top: 1px solid #dee2e6;
      padding: 1rem;
    }
  
    /* Buttons styles */
    .btn-primary,
    .btn-danger,
    .btn-info {
      margin-right: 10px;
    }
    .show-requests-button {
      position: fixed;
      top: 90px;
      right: 10px;
      color: black;
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);
  },
};
