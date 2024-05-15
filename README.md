# Grocery Store Web Application

This project involves the development of a web application for a grocery store with role-based access control (RBAC) implemented using Flask-Security-Too. The application allows users with different roles—admin, manager, and customer—to perform various actions within the system.

## Features

### Roles and Permissions
- **Admin**: One admin user with the authority to add, update, and delete categories and products.
- **Manager**: Multiple manager users who can request the addition, updating, and deletion of categories. Managers also have the ability to add, update, and delete products.
- **Customer**: Several customer users who can view products, search for them, add them to the cart, make purchases, and view order history.

### Role-Based Access Control (RBAC)
- Managers can only perform their functions after approval from the admin.

### Functionality
- **Categories and Products**: Admin can manage categories and products.
- **Manager Requests**: Managers can request changes to categories and products.
- **Product Export**: Managers can export product details to CSV files.
- **Cart**: Customers can add products to their cart and make purchases.
- **Order History**: Users can view their order history.

### Technology Stack
- **Server**: Flask
- **Frontend**: Vue CDN, HTML, CSS, Bootstrap
- **Database**: SQLite
- **Authentication**: Flask-Security-Too for RBAC login
- **Background Tasks**: Redis, Celery
- **Email Notifications**: Mailhog for webhook messages and email reminders
- **Caching**: Redis

## Setup Instructions

1. Clone the repository.
2. Install dependencies using `pip install -r requirements.txt`.
3. Set up Redis and Celery for background tasks.
4. Configure Flask-Security-Too for RBAC.
5. Run the `upload_initial_data.py` script to upload initial data to the database.
    ```bash
    python upload_initial_data.py
    ```
6. Run the `main.py` script to start the application.
    ```bash
    python main.py
    ```

## Usage

- Access the application through the browser.
- Log in using your credentials based on your role.
- Navigate through the different sections based on your role permissions.
- Perform the respective actions allowed for your role.

