export default {
    template:  `<div class="center-container">
    <div class="add-category-form">
    <input type="text" placeholder="Name" v-model="resource.name" class="form-control" />
    <input type="text" placeholder="Description" v-model="resource.description" class="form-control" />
    <button @click="Addcategory" class="btn btn-success">Add Category</button>
  </div>
  </div>`,
  
    data() {
      return {
        resource: {
          name: null,
          description: null,
        },
        token: localStorage.getItem('auth-token'),
      }
    },
  
    methods: {
      async Addcategory() {
        const res = await fetch('/api/category', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.resource),
        })
  
        const data = await res.json()
        if (res.ok) {
          alert(data.message)  
          this.$router.push("/")
        }
      },
    },
    created(){
      let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML =`
      body {
        background-color: #f4f4f4; /* Set the desired background color for the entire page */
      }
      .add-category-form {
        max-width: 400px;
        margin: auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      
      .form-control {
        width: 100%;
        margin-bottom: 10px;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .btn-primary {
        background-color: #007bff;
        border-color: #007bff;
        color: #fff;
        cursor: pointer;
        padding: 10px;
        border-radius: 4px;
      }
      
      .btn-primary:hover {
        background-color: #0056b3;
        border-color: #0056b3;
      }`;
      document.getElementsByTagName('head')[0].appendChild(style);
    }
  }


