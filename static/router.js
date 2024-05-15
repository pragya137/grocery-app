import Home from './components/Home.js'
import Login from './components/login.js'
import Users from './components/Users.js'
import Addcategory from './components/Addcategory.js'
import AllProducts from './components/AllProducts.js'
import AllProducts_customer from './components/AllProducts_customer.js'
import Cart from './components/Cart.js'
import Profile from './components/Profile.js'


const routes = [
    { path: '/', component: Home, name: 'Home' },
    { path: '/Login', component: Login, name: 'Login' },
    { path: '/users', component: Users, name: 'Users' },
    { path: '/category', component: Addcategory},
    { path: '/products', component: AllProducts},
    { path: '/all_products', component: AllProducts_customer},
    { path: '/cart', component: Cart},
    { path: '/profile', component: Profile},
    

  ]
  
  export default new VueRouter({
    routes,
  })