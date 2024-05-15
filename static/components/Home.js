import AdminHome from "./AdminHome.js"
import ManagerHome from "./ManagerHome.js"
import CustomerHome from "./CustomerHome.js"



export default {
  template: `<div>
  <AdminHome v-if="userRole === 'admin'" />
  <CustomerHome v-if="userRole === 'customer'" />
  <ManagerHome v-if="userRole === 'manager'" />
  </div>`,


  data() {
    return {
      userRole: localStorage.getItem('role'),
      authToken: localStorage.getItem('auth-token'),
      resources: [],
    }
  },

  components: {
    AdminHome,
    CustomerHome,
    ManagerHome,
  },
}