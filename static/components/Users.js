export default {
  template: `
  <div>
  <div v-if="error" class="alert alert-danger">{{ error }}</div>
  <div v-for="user in allUsers" :key="user.id" class="user-card">
    <div class="user-info">
      <span class="email">{{ user.email }}</span>
      <button v-if="!user.active" class="btn btn-primary" @click="approve(user.id)">Approve</button>
    </div>
  </div>
</div>
  `,
  data() {
    return {
      allUsers: [],
      token: localStorage.getItem('auth-token'),
      error: null,
    };
  },
  methods: {
    async approve(managerId) {
      try {
        const res = await fetch(`/activate/manager/${managerId}`, {
          headers: {
            'Authentication-Token': this.token,
          },
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);

          // Update the user's 'active' status in the allUsers array
          const approvedUserIndex = this.allUsers.findIndex((user) => user.id === managerId);
          if (approvedUserIndex !== -1) {
            this.$set(this.allUsers, approvedUserIndex, { ...this.allUsers[approvedUserIndex], active: true });
          }
        }
      } catch (error) {
        console.error('Error approving user:', error);
      }
    },
  },
  async mounted() {
    try {
      const res = await fetch('/users', {
        headers: {
          'Authentication-Token': this.token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        this.allUsers = data;
      } else {
        this.error = res.status;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
  created(){
    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML=`
    body {
      background-color: #f4f4f4; /* Set the desired background color for the entire page */
    }
    .user-card {
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .user-info {
      display: flex;
      justify-content: space-between;
      background-color:  #F8F8FF;
      align-items: center;
    }
    
    .email {
      font-weight: bold;
    }
    
    /* Customize the styling for the "Approve" button */
    .btn-primary {
      background-color: #28a745; /* Bootstrap success color */
      border-color: #28a745; /* Bootstrap success color */
    }
    
    .btn-primary:hover {
      background-color: #218838; /* Darker shade for hover effect */
      border-color: #218838; /* Darker shade for hover effect */
    }`;
    document.getElementsByTagName('head')[0].appendChild(style);
  
  }
};
