export default {
    template: `
    <div class="login-page">
    <!-- Only show the login form if registration forms are not visible -->
    <div v-if="!registrationType">
      <div class="d-flex justify-content-center mt-5">
        <div class="card login-card" style="width: 20rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Login</h3>
            <div class="text-danger text-center">{{ error }}</div>
            <form>
              <div class="mb-3">
                <label for="user-email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
              </div>
              <div class="mb-3">
                <label for="user-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="user-password" v-model="cred.password">
              </div>
              <button class="btn btn-success mt-3" @click="login">Login</button>
              <div class="d-flex justify-content-center mt-3">
                <button class="btn btn-link me-2" @click="setRegistrationType('user')">Register as Customer</button>
                <button class="btn btn-link" @click="setRegistrationType('manager')">Register as Manager</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Show user registration form -->
    <div v-if="registrationType === 'user'">
      <div class="d-flex justify-content-center mt-5">
        <div class="card registration-card" style="width: 20rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div class="card-body">
            <h5 class="card-title text-center mb-4">Register as Customer</h5>
            <div class="text-danger text-center">{{ error }}</div>
            <form @submit.prevent="registerUser">
              <div class="mb-3">
                <label for="new-user-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="new-user-name" v-model="newUser.name">
              </div>
              <div class="mb-3">
                <label for="new-user-email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="new-user-email" placeholder="name@example.com" v-model="newUser.email">
              </div>
              <div class="mb-3">
                <label for="new-user-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="new-user-password" v-model="newUser.password">
              </div>
              <button type="submit" class="btn btn-success mt-3">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Show manager registration form -->
    <div v-if="registrationType === 'manager'">
      <div class="d-flex justify-content-center mt-5">
        <div class="card registration-card" style="width: 20rem; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div class="card-body">
            <h5 class="card-title text-center mb-4">Register as Manager</h5>
            <div class="text-danger text-center">{{ error }}</div>
            <form @submit.prevent="registerManager">
              <div class="mb-3">
                <label for="new-manager-name" class="form-label">Name</label>
                <input type="text" class="form-control" id="new-manager-name" v-model="newManager.name">
              </div>
              <div class="mb-3">
                <label for="new-manager-email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="new-manager-email" placeholder="name@example.com" v-model="newManager.email">
              </div>
              <div class="mb-3">
                <label for="new-manager-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="new-manager-password" v-model="newManager.password">
              </div>
              <button type="submit" class="btn btn-success mt-3">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
    data() {
      return {
        cred: {
          email: null,
          password: null,
        },
        newUser: {
          name: '',
          email: '',
          password: '',
        },
        newManager: {
          name: '',
          email: '',
          password: '',
        },
        error: null,
        showRegistrationForms: false,
        registrationType: null,
      }
    },
    methods: {
      async login() {
        const res = await fetch('/user-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.cred),
        })
        const data = await res.json()
        if (res.ok) {
          localStorage.setItem('auth-token', data.token)
          localStorage.setItem('role', data.role)
          this.$router.push({ path: '/' , query: { role : data.role} })
        } else {
          this.error = data.message
        }
      },

      async registerUser() {
        try {
          const res = await fetch('/api/user-registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.newUser),
          });
      
          const data = await res.json();
      
          if (res.ok) {
            // Registration successful, handle as needed (e.g., show a success message)
            console.log('User registered successfully:', data);
      
            // Update error to show registration success message
            this.error = 'User registered successfully. Please login.';
      
            // Automatically switch back to the login form after a short delay 
            setTimeout(() => {
              this.error = null;  // Clear the success message
              this.registrationType = null;  // Switch back to the login form
            }, 3000);
          } else {
            // Registration failed, update error message
            this.error = data.message;
          }
        } catch (error) {
          console.error('Error during registration:', error);
          this.error = 'An unexpected error occurred during registration.';
        }
      },

      async registerManager() {
        try {
          const res = await fetch('/api/manager-registration', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.newManager),
          });
  
          const data = await res.json();
  
          if (res.ok) {
            // Manager registration successful, handle as needed
            console.log('Manager registered successfully:', data);
  
            // Update error to show registration success message
            this.error = 'Manager registered successfully. Please wait for admin approval to login.';
  
            // Automatically switch back to the login form after a short delay (e.g., 3 seconds)
            setTimeout(() => {
              this.error = null;  // Clear the success message
              this.registrationType = null;  // Switch back to the login form
            }, 3000);
          } else {
            // Registration failed, update error message
            this.error = data.message;
          }
        } catch (error) {
          console.error('Error during manager registration:', error);
          this.error = 'An unexpected error occurred during manager registration.';
        }
      },
      
      toggleRegistrationForms() {
        this.showRegistrationForms = !this.showRegistrationForms;
      },

      setRegistrationType(type) {
        this.registrationType = type;
      },
    },

    created (){

    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
    body {
      background-color: #f4f4f4; /* Set the desired background color for the entire page */
    }
    .login-page {
      background-color: #f4f4f4; /* Set the desired background color */
    }
    
    .login-card,
    .registration-card {
      background-color: #ffffff; /* Set the desired background color for the cards */
      border: none; /* Remove border for a cleaner look */
    }`;

    document.getElementsByTagName('head')[0].appendChild(style);

    }

  }
  
