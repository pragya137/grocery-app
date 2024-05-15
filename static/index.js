import router from './router.js'
import Navbar from './components/Navbar.js'


router.beforeEach((to, from, next) => {
  const isLoginPage = to.name === 'Login';
  const isRegistrationPage = to.name === 'RegisterUser' || to.name === 'RegisterManager';
  const isAuthenticated = localStorage.getItem('auth-token');

  if ((isLoginPage || isRegistrationPage) && isAuthenticated) {
    // Allow access to login page and registration pages if authenticated
    next('/');
  } else if (!isAuthenticated && !isLoginPage) {
    // Redirect to login page if not authenticated and not on the login page
    next({ name: 'Login' });
  } else {
    // Allow access to other authenticated pages and non-authenticated pages
    next();
  }
});



new Vue({
  el: '#app',
  template: `<div>
  <Navbar :key='has_changed'/>
  <router-view class="m-3"/>
  </div>`,
  router,
  components: {
    Navbar,
  },
  data: {
    has_changed: true,
  },
  watch: {
    $route(to, from) {
      this.has_changed = !this.has_changed
    },
  },
})