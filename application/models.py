from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_security import UserMixin, RoleMixin
db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))
    category = db.relationship('Category', backref='manager')
    
    
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    
    
    
class Category(db.Model):
    c_id= db.Column(db.Integer(),primary_key=True)
    name=db.Column(db.String(50),nullable=False)
    description=db.Column(db.String(300),nullable=False)
    products=db.relationship("Product",backref="section",secondary='association',cascade="all, delete", passive_deletes=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_approved = db.Column(db.Boolean(), default=False)

    def __repr__(self):
        return f"<Category {self.name}>"

class Product(db.Model):
    p_id= db.Column(db.Integer(),primary_key=True)
    name=db.Column(db.String(50),nullable=False)
    manufacture_date = db.Column(db.String(100), nullable=False)
    expiry_date = db.Column(db.String(100), nullable=False)
    rate_per_unit = db.Column(db.Float(), nullable=False)
    unit=db.Column(db.Integer(),nullable=False)


    def __repr__(self):
        return f"<Product {self.name}>"

class Association(db.Model):
    Category_id=db.Column(db.Integer(), db.ForeignKey("category.c_id"), primary_key=True)
    Product_id = db.Column(db.Integer(), db.ForeignKey("product.p_id"), primary_key=True)


class Cart(db.Model):
    p_id=db.Column(db.Integer(),primary_key=True)
    p_name=db.Column(db.String(50),nullable=False)
    quantity=db.Column(db.Integer(),nullable=False)
    price=db.Column(db.Float(),nullable=False)
    user_id = db.Column(db.Integer(), db.ForeignKey("user.id"), nullable=False)


class Orders(db.Model):
    id=db.Column(db.Integer(),primary_key=True)
    name=db.Column(db.String(50),nullable=False)
    quantity=db.Column(db.Integer(),nullable=False)
    price=db.Column(db.Float(),nullable=False)
    user_id=db.Column(db.Integer(),db.ForeignKey("user.id"),nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class UpdateRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String(),nullable=False)
    description=db.Column(db.String(300),nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.c_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    

class DeleteRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.c_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
