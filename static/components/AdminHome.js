
export default{
  template:`<div>
  <h1 class="welcome-admin">Welcome Admin</h1>
  <!-- Button to show update and delete requests -->
  <div class="admin-actions">
  <button class="btn btn-info show-requests-button" @click="showRequests">Show Requests</button>
  </div>
  <div class="modal fade" id="requestsModal" tabindex="-1" role="dialog" aria-labelledby="requestsModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="requestsModalLabel">Update and Delete Requests</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <!-- Update Requests Table -->
        <h3>Update Requests</h3>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>User ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="updateRequest in updateRequests" :key="updateRequest.id">
              <td>{{ updateRequest.name }}</td>
              <td>{{ updateRequest.description }}</td>
              <td>{{ updateRequest.user_id }}</td>
              <td>
                <button class="btn btn-success" @click="approveUpdateRequest(updateRequest.id)">Approve</button>
                <button class="btn btn-danger" @click="DeleteUpdateRequest(updateRequest.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Delete Requests Table -->
        <h3>Delete Requests</h3>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deleteRequest in deleteRequests" :key="deleteRequest.id">
              <td>{{ deleteRequest.category_id }}</td>
              <td>
                <button class="btn btn-success" @click="approveDeleteRequest(deleteRequest.id)">Approve</button>
                <button class="btn btn-danger" @click="DeleteDeleteRequest(deleteRequest.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
  <div class="table-responsive">
      <table class="table table-bordered table-striped" style="background-color: #f8f9fa;">
        <thead class="table-dark">
      <tr>
        <th>Id</th>
        <th>Name</th>
        <th>Description</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="category in categories" :key="category.c_id">
      <tr
            v-for="category in categories"
            :key="category.c_id"
            :style="{ 'background-color': category.is_approved ? '#d4edda' : '' }"
          >
        <td>{{ category.c_id }}
        <td>{{ category.name }}</td>
        <td>{{ category.description }}</td>
        <td>
          <button v-if="!category.is_approved" class="btn btn-success" @click="approveCategory(category.c_id)">Approve</button>
          <button class="btn btn-success" @click="openUpdateModal(category)">Update</button>
          <button class="btn btn-danger" @click="deleteCategory(category.c_id)">Delete</button>
          <button class="btn btn-info" @click="fetchProducts(category.c_id)">Show Products</button>
        </td>
      </tr>
    </tbody>
  </table>
  </div>

  <!-- Modal for updating category -->
  <div class="modal fade" id="updateModal" tabindex="-1" role="dialog" aria-labelledby="updateModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateModalLabel">Update Category</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Add form fields for updating category -->
          <div class="mb-3">
            <label for="updateName" class="form-label">Name</label>
            <input type="text" class="form-control" v-model="updatedCategory.name" id="updateName">
          </div>
          <div class="mb-3">
            <label for="updateDescription" class="form-label">Description</label>
            <textarea class="form-control" v-model="updatedCategory.description" id="updateDescription"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="updateCategory">Save changes</button>
        </div>
      </div>
    </div>
  </div>

  
<!-- Display selected category products in a table -->
<div v-if="selectedCategoryProducts.length > 0" class="mt-4">
  <h2>Products in Selected Category</h2>
  <div class="table-responsive">
        <table class="table table-bordered table-striped" style="background-color: #d1ecf1;">
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
  </div>` ,
  data() {
    return {
      categories: [],
      token: localStorage.getItem('auth-token'),
      updatedCategory: {
        id: null,
        name: '',
        description: '',
      },
      updateRequests: [],
      deleteRequests: [],
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
      searchQuery: '',
      searchResults: [],
      searchClicked: false,
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

    async approveCategory(categoryId) {
      try {
        const res = await fetch(`/category/${categoryId}/approve`, {
          headers: {
            'Authentication-Token': this.token,
          },
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          this.fetchCategories(); // Refresh the category list after approval
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error approving category:', error);
      }
    },

    async deleteCategory(categoryId) {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          const res = await fetch(`/api/category/${categoryId}`, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': this.token,
              'Content-Type': 'application/json',  
            },
          });
          
          const data = await res.json();
    
          if (res.ok) {
            alert(data.message);
            this.fetchCategories(); // Refresh the category list after deletion
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      }
    },
    

    openUpdateModal(category) {
      // Populate the updatedCategory data
      this.updatedCategory.id = category.c_id;
      this.updatedCategory.name = category.name;
      this.updatedCategory.description = category.description;

      // Show the modal
      $('#updateModal').modal('show');
    },

    async updateCategory() {
      try {
        const res = await fetch(`/api/category/${this.updatedCategory.id}`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.updatedCategory.name,
            description: this.updatedCategory.description,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          $('#updateModal').modal('hide');
          this.fetchCategories(); // Refresh the category list after update
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error updating category:', error);
      }
    },
    async showRequests() {
      try {
        // Fetch update requests
        const updateRes = await fetch('/api/update-request', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });

        if (updateRes.ok) {
          this.updateRequests = await updateRes.json();
        } else {
          console.error('Error fetching update requests:', updateRes.status, updateRes.statusText);
        }

        // Fetch delete requests
        const deleteRes = await fetch('/api/delete-request', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
        });

        if (deleteRes.ok) {
          this.deleteRequests = await deleteRes.json();
        } else {
          console.error('Error fetching delete requests:', deleteRes.status, deleteRes.statusText);
        }

        // Show the modal
        $('#requestsModal').modal('show');
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },

    async approveUpdateRequest(requestId) {
      try {
        const res = await fetch(`/api/update-request/${requestId}`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': this.token,  // Include your authentication token
            'Content-Type': 'application/json',
          },
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert(data.message);
          this.fetchCategories();
          this.showRequests();  // Assuming you have a method to fetch update requests
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error approving update request:', error);
      }
    },

    async DeleteUpdateRequest(requestId) {
      try {
        const res = await fetch(`/api/update-request/${requestId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,  // Include your authentication token
            'Content-Type': 'application/json',
          },
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert(data.message);
          this.fetchCategories();
          this.showRequests();  // Assuming you have a method to fetch update requests
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error approving update request:', error);
      }
    },

    async approveDeleteRequest(requestId) {
      try {
        const res = await fetch(`/api/delete-request/${requestId}`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': this.token,  // Include your authentication token
            'Content-Type': 'application/json',
          },
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert(data.message);
          this.fetchCategories();
          this.showRequests();  // Assuming you have a method to fetch update requests
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error approving update request:', error);
      }
    },

    async DeleteDeleteRequest(requestId) {
      try {
        const res = await fetch(`/api/delete-request/${requestId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,  // Include your authentication token
            'Content-Type': 'application/json',
          },
        });
    
        const data = await res.json();
    
        if (res.ok) {
          alert(data.message);
          this.fetchCategories();
          this.showRequests();  // Assuming you have a method to fetch update requests
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error approving update request:', error);
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

    
  },
  created() {
    this.fetchCategories();
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    body {
      background-color: #f4f4f4; /* Set the desired background color for the entire page */
    }
    .table-header-color {
      background-color: dark; /* Set your desired background color for the table header */
      color: #fff;
    }
    
    .show-requests-button {
      position: fixed;
      top: 90px;
      right: 10px;
      z-index: 1000;
    }
    .welcome-admin {
      display: inline-block; /* Ensures "Welcome Admin" and button are in the same line */
      margin-right: 10px;    /* Adjust the margin as needed */
    }
  
    .admin-actions {
      display: inline-block;
    }
    
  `;
    document.getElementsByTagName('head')[0].appendChild(style);
  },
}