from main import app
from application.sec import datastore
from application.models import db, Role
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name="admin", description="User is an admin")
    datastore.find_or_create_role(name="manager", description="User is a manager")
    datastore.find_or_create_role(name="customer", description="User is a customer")
    db.session.commit()
    if not datastore.find_user(email="admin@email.com"):
        datastore.create_user(username="admin", email="admin@email.com", password=generate_password_hash("admin1"), roles=["admin"])
    if not datastore.find_user(email="manager1@email.com"):
        datastore.create_user(email="manager1@email.com", password=generate_password_hash("manager1"), roles=["manager"], active=False)   
    if not datastore.find_user(email="customer1@email.com"):
        datastore.create_user(email="customer1@email.com", password=generate_password_hash("customer1"), roles=["customer"])
    db.session.commit()