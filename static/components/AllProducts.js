export default{
  template: `
    <div>
    <h2>All Products</h2>
    <div class="header-actions d-flex justify-content-end mb-3">
      <button @click="openAddProductModal" class="btn btn-primary">Add Product</button>
    </div>
    <table class="table table-bordered table-striped">
      <thead class="thead-dark">
        <tr>
          <th scope="col">Product Name</th>
          <th scope="col">Manufacture Date</th>
          <th scope="col">Expiry Date</th>
          <th scope="col">Rate per Unit</th>
          <th scope="col">Unit</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.p_id">
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


    <div class="modal" id="addProductModal" tabindex="-1" role="dialog" aria-labelledby="addProductModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addProductModalLabel">Add Product</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeAddProductModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <!-- Add form fields for adding a product -->
          <form @submit.prevent="addProduct">
            <div class="form-group">
              <label for="productName">Product Name</label>
              <input type="text" class="form-control" v-model="newProduct.name" id="productName" required>
            </div>
            <div class="form-group">
              <label for="manufactureDate">Manufacture Date</label>
              <input type="date" class="form-control" v-model="newProduct.manufacture_date" id="manufactureDate" required>
            </div>
            <div class="form-group">
              <label for="expiryDate">Expiry Date</label>
              <input type="date" class="form-control" v-model="newProduct.expiry_date" id="expiryDate" required>
            </div>
            <div class="form-group">
              <label for="unit">Unit</label>
              <input type="number" class="form-control" v-model="newProduct.unit" id="unit" required>
            </div>
            <div class="form-group">
              <label for="price">Price</label>
              <input type="number" class="form-control" v-model="newProduct.rate_per_unit" id="price" required>
            </div>
            <div class="form-group">
              <label for="category">Category</label>
              <select class="form-control" v-model="newProduct.category_id" id="category" required>
                <option v-for="category in categories" :key="category.c_id" :value="category.c_id">{{ category.name }}</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" >Add Product</button>
          </form>
        </div>
      </div>
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
                <button type="submit" class="btn btn-primary" >Update Product</button>
              </form>
            </div>
          </div>
        </div>
      </div>
  </div>`,
  
  
  data() {
      return {
        products: [],
        newProduct: {
          name: '',
          manufacture_date: '',
          expiry_date: '',
          unit: 0,
          rate_per_unit: 0,
          category_id: null,
          },
          updatedProduct: {
            p_id: null,
            name: '',
            manufacture_date: '',
            expiry_date: '',
            unit: 0,
            rate_per_unit: 0,
            category_id: null,
          },
          categories: [],
        };
      },

  methods: {
      async fetchProducts() {
          try {
              const res = await fetch('/api/product', {
              method: 'GET',
              headers: {
                  'Authentication-Token': localStorage.getItem('auth-token'),
                  'Content-Type': 'application/json',
              },
              });
  
              if (res.ok) {
              const data = await res.json();
              this.products = data;
              } else {
              console.error('Error fetching products:', res.status, res.statusText);
              }
          } catch (error) {
              console.error('Fetch error:', error);
          }
      },

      async fetchCategories() {
          try {
            const res = await fetch('/get/category', {
              // method: 'GET',
              headers: {
                'Authentication-Token': localStorage.getItem('auth-token'),
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

      openAddProductModal() {
          this.fetchCategories();
          $('#addProductModal').modal('show');
        },
      closeAddProductModal() {
          $('#addProductModal').modal('hide');
      },
      
      async addProduct() {

        this.newProduct.category_id = parseInt(this.newProduct.category_id);
        try {
          const res = await fetch('/api/product', {
            method: 'POST',
            headers: {
              'Authentication-Token': localStorage.getItem('auth-token'),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.newProduct),
          });
      
          const data = await res.json();

          if (res.ok) {
            if (data.message) {
              alert(data.message);
              this.closeAddProductModal();
              this.fetchProducts();
              this.newProduct = {
                name: '',
                manufacture_date: '',
                expiry_date: '',
                unit: 0,
                rate_per_unit: 0,
                category_id: null,
              };
            } else {
              console.error('Server response is missing the "message" property:', data);
            }
          } else {
            console.error('Error adding product to cart:', res.status, res.statusText);
          }
      
        } catch (error) {
          console.error('Error adding product:', error);
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
            this.fetchProducts();
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
              this.fetchProducts(); // Refresh the product list after deletion
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
    this.fetchProducts();
    this.fetchCategories();
    let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML =`
      body {
        background-color: #f4f4f4; /* Set the desired background color for the entire page */
      }
      .table {
        width: 100%;
        margin-bottom: 1rem;
        color: #212529;
        background-color: #fff;
        border-collapse: collapse;
        border: 1px solid rgba(0, 0, 0, 0.125);
      }
      
      .table th,
      .table td {
        padding: 0.75rem;
        vertical-align: top;
        border-top: 1px solid rgba(0, 0, 0, 0.125);
      }
      
      .table thead th {
        vertical-align: bottom;
        border-bottom: 2px solid #dee2e6;
      }
      
      .table tbody + tbody {
        border-top: 2px solid #dee2e6;
      }
      
      .table .thead-dark th {
        color: #fff;
        background-color: #343a40;
        border-color: #454d55;
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
      }`;
      document.getElementsByTagName('head')[0].appendChild(style);
    },
  
};
    