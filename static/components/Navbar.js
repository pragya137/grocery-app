export default {
  template: `<div>
  <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #4FB06D;">
  <div class="container-fluid">
    <router-link class="navbar-brand" to="#">
      <h2><i class="fa-solid fa-wheat-awn-circle-exclamation"></i>Grocery Store<i class="fa-solid fa-cart-shopping"></i></h2>
    </router-link>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item" v-if="role === 'manager' || role === 'admin' || role === 'customer'">
          <router-link class="nav-link" to="/">
            <i class="fas fa-home me-2"></i> 
          </router-link>
        </li>
        <!-- Add other menu items as needed -->
        <li class="nav-item" v-if="role === 'admin'">
          <router-link class="nav-link" to="/users">
          <i class="fa-solid fa-users"></i>
          </router-link>
        </li>
        <li class="nav-item" v-if="role === 'customer'">
          <router-link class="nav-link" to="/profile">
          <i class="fa-sharp fa-solid fa-user"></i>
          </router-link>
        </li>
        <li class="nav-item" v-if="role === 'manager' || role === 'admin'">
          <router-link class="nav-link" to="/category">
          <i class="fa-solid fa-plus"></i>Add Category
          </router-link>
        </li>
        <li class="nav-item" v-if="role === 'manager' || role === 'admin'">
          <router-link class="nav-link" to="/products">
          <i class="fa-solid fa-basket-shopping"></i>All products
          </router-link>
        </li>
        <li class="nav-item" v-if="role === 'customer'">
          <router-link class="nav-link" to="/all_products">
          <i class="fa-solid fa-basket-shopping"></i> All Products
          </router-link>
        </li>
        <li class="nav-item" v-if="role === 'customer'">
              <router-link class="nav-link" to="/cart">
                <i class="fas fa-shopping-cart me-2"></i> 
              </router-link>
        </li>
        <li class="nav-item" v-if="is_login">
              <button class="btn btn-link text-black" @click='logout'>
                <i class="fas fa-sign-out-alt me-2"></i>
              </button>
        </li>
      </ul>
    </div>
  </div>
</nav>
</div>`,
  data() {
    return {
      role: localStorage.getItem('role'),
      is_login: localStorage.getItem('auth-token'),
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('role')
      this.$router.push({ path: '/login' })
    },
  },
  // #00c4b1
}