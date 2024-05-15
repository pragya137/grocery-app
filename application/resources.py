from flask_restful import Resource, Api, reqparse, fields, marshal, request
from flask_security import auth_required, roles_required, current_user, roles_accepted
from flask import jsonify
from sqlalchemy import or_
from .models import *
from .sec import datastore
from werkzeug.security import generate_password_hash
import pytz
from .instances import cache

api = Api(prefix='/api')

parser = reqparse.RequestParser()
parser.add_argument('name', type=str,
                    help='Name is required should be a string', required=True)
parser.add_argument('description', type=str,
                    help='Description is required and should be a string', required=True)



class Creator(fields.Raw):
    def format(self, user):
        return user.email


category_fields = {
    'c_id': fields.Integer,
    'name':   fields.String,
    'description':  fields.String,
    'is_approved': fields.Boolean,
    'manager': Creator
}


class CategoryResource(Resource):
    @auth_required("token")
    def get(self):
        if "admin" in current_user.roles:
            categories= Category.query.all()
        elif "manager" in current_user.roles:
            categories = Category.query.filter(or_(Category.is_approved == True, Category.manager_id == current_user.id)).all()
        else:
            categories = Category.query.filter_by(is_approved=True).all()
        return marshal(categories, category_fields)
        

    @auth_required("token")
    @roles_accepted('admin', 'manager')
    def post(self):
        args = parser.parse_args()
        if "admin" in current_user.roles:
            category = Category(name=args.get("name"), description=args.get(
                "description"),is_approved=True, manager_id=current_user.id)
        else:
            category = Category(name=args.get("name"), description=args.get(
                "description"), manager_id=current_user.id)
        db.session.add(category)
        db.session.commit()
        return {"message": "Category Added"}
    
    @auth_required("token")
    @roles_required('admin')
    def put(self, category_id):
        args = parser.parse_args()
        category = Category.query.get(category_id)

        if category is None:
            return {"message": "Category not found"}, 404

        if category:
            category.name = args.get("name", category.name)
            category.description = args.get("description", category.description)
            db.session.commit()
            return {"message": "Category updated"}
        else:
            return {"message": "Unauthorized to update this category"}, 403
        
        
    @auth_required("token")
    @roles_required('admin')
    def delete(self, category_id):
        category = Category.query.get(category_id)

        if category is None:
            return {"message": "Category not found"}, 404

        if "admin" in current_user.roles:
            for product in  category.products:
                db.session.delete(product)
            db.session.delete(category)
            db.session.commit()
            return {"message": "Category deleted"}
        else:
            return {"message": "Unauthorized to delete this category"}, 403


api.add_resource(CategoryResource, '/category','/category/<int:category_id>')


parser_product = reqparse.RequestParser()
parser_product.add_argument('name', type=str, help='Name is required and should be a string', required=True)
parser_product.add_argument('manufacture_date', type=str, help='Manufacture date is required and should be a string', required=True)
parser_product.add_argument('expiry_date', type=str, help='Expiry date is required and should be a string', required=True)
parser_product.add_argument('rate_per_unit', type=float, help='Rate per unit is required and should be a float', required=True)
parser_product.add_argument('unit', type=int, help='Unit is required and should be an integer', required=True)
parser_product.add_argument('category_id', type=int, help='Category ID is required and should be an integer', required=True)


product_fields = {
    'p_id': fields.Integer,
    'name': fields.String,
    'manufacture_date': fields.String,
    'expiry_date': fields.String,
    'rate_per_unit': fields.Float,
    'unit': fields.Integer,
    'category': fields.Nested({
        'c_id': fields.Integer,
        'name': fields.String,
        'description': fields.String,
    }),
}

product_fields_user = {
    'p_id': fields.Integer,
    'name': fields.String,
    'manufacture_date': fields.String,
    'expiry_date': fields.String,
    'rate_per_unit': fields.Float,
    'unit': fields.Integer,
    'category': fields.Nested({
        'c_id': fields.Integer,
        'name': fields.String,
        'description': fields.String,
    })  
}
class ProductResource(Resource):
    @auth_required("token")
    @cache.cached(timeout=50)
    def get(self):
        products = Product.query.all()
        if "admin" in current_user.roles or "manager" in current_user.roles:
            return marshal(products, product_fields)
        elif "customer" in current_user.roles:
            return marshal(products, product_fields_user)
        
    @auth_required("token")
    @roles_accepted('admin', 'manager')
    def post(self):
        args = parser_product.parse_args()
        category_id = args.get("category_id")
        # print(category_id)
        category = Category.query.get(category_id)
        # print(category)

        if not category:
            return {"message": "Category not found"}, 404
        
        # print(current_user.id)
        # print(category.manager_id)

        if "admin" in current_user.roles or "manager" in current_user.roles:
            product = Product(
                name=args.get("name"),
                manufacture_date=args.get("manufacture_date"),
                expiry_date=args.get("expiry_date"),
                rate_per_unit=args.get("rate_per_unit"),
                unit=args.get("unit")
            )
            db.session.add(product)
            product.section.append(category)
            # product_id = product.p_id

            db.session.commit()
            return {"message": "Product Added"}
        else:
            return {"message": "Unauthorized to add product to this category"}, 403

    @auth_required("token")
    @roles_accepted('admin', 'manager')
    def put(self, product_id):
        args = parser_product.parse_args()
        product = Product.query.get(product_id)

        if product is None:
            return {"message": "Product not found"}, 404

        category_id = args.get("category_id")
        category = Category.query.get(category_id)
        print(category)

        if not category:
            return {"message": "Category not found"}, 404

        if "admin" in current_user.roles or "manager" in current_user.roles:
            product.name = args.get("name", product.name)
            product.manufacture_date = args.get("manufacture_date", product.manufacture_date)
            product.expiry_date = args.get("expiry_date", product.expiry_date)
            product.rate_per_unit = args.get("rate_per_unit", product.rate_per_unit)
            product.unit = args.get("unit", product.unit)
            product.section.append(category)
            db.session.commit()
            return {"message": "Product updated"}
        else:
            return {"message": "Unauthorized to update this product"}, 403

    @auth_required("token")
    @roles_accepted('admin', 'manager')
    def delete(self, product_id):
        product = Product.query.get(product_id)

        if product is None:
            return {"message": "Product not found"}, 404

        if "admin" in current_user.roles or  "manager" in current_user.roles:
            db.session.delete(product)
            db.session.commit()
            return {"message": "Product deleted"}
        else:
            return {"message": "Unauthorized to delete this product"}, 403


api.add_resource(ProductResource, '/product', '/product/<int:product_id>')


parser_update_request = reqparse.RequestParser()
parser_update_request.add_argument('name', type=str, help='Name is required and should be a string', required=True)
parser_update_request.add_argument('description', type=str, help='Description is required and should be a string', required=True)
parser_update_request.add_argument('category_id', type=int, help='Category ID is required and should be an integer', required=True)


update_request_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'category_id': fields.Integer,
    'user_id': fields.Integer
}


class UpdateRequestResource(Resource):
    @auth_required("token")
    @roles_required('admin')
    def get(self):
        categories = UpdateRequest.query.all()
        print(categories)
        return marshal(categories,update_request_fields)

    @auth_required("token")
    @roles_required('manager')
    def post(self):
        args = parser_update_request.parse_args()
        # Implement your logic to create an update request
        update_request = UpdateRequest(
            name=args.get('name'),
            description=args.get('description'),
            category_id=args.get('category_id'),
            user_id=current_user.id 
        )
        # Save the update_request to the database
        db.session.add(update_request)
        db.session.commit()
        return {"message": "Update Request Sent"}

    @auth_required("token")
    @roles_required('admin')
    def put(self, update_request_id):
        updaterequest= UpdateRequest.query.get(update_request_id)
        #print(updaterequest)
        category=Category.query.filter_by(c_id=updaterequest.category_id).first()
        # print(category)
        category.name= updaterequest.name
        category.description= updaterequest.description
        db.session.delete(updaterequest)
        db.session.commit()
        return {"message": "Request Approved"}

    @auth_required("token")
    @roles_required('admin')
    def delete(self, update_request_id):
        updaterequest= UpdateRequest.query.get(update_request_id)
        db.session.delete(updaterequest)
        db.session.commit()
        return {"message": "Request Deleted"}
api.add_resource(UpdateRequestResource, '/update-request', '/update-request/<int:update_request_id>')


parser_delete_request = reqparse.RequestParser()
parser_delete_request.add_argument('category_id', type=int, help='Category ID is required and should be an integer', required=True)


update_delete_fields = {
    'id': fields.Integer,
    'category_id': fields.Integer,
    'user_id': fields.Integer
}


class DeleteRequestResource(Resource):
    @auth_required("token")
    @roles_required('admin')
    def get(self):
        categories = DeleteRequest.query.all()
        print(categories)
        return marshal(categories,update_delete_fields)
    
    @auth_required("token")
    @roles_required('manager')
    def post(self):
        args = parser_delete_request.parse_args()
        delete_request = DeleteRequest(
            category_id=args.get('category_id'),
            user_id=current_user.id 
        )
        # Save the update_request to the database
        db.session.add(delete_request)
        db.session.commit()
        return {"message": "Delete Request Sent"}
    
    @auth_required("token")
    @roles_required('admin')
    def put(self, delete_request_id):
        deleterequest= DeleteRequest.query.get(delete_request_id)
        category=Category.query.filter_by(c_id=deleterequest.category_id).first()
        # print(category)
        db.session.delete(category)
        db.session.delete(deleterequest)
        db.session.commit()
        return {"message": "Request Approved"}
    
    @auth_required("token")
    @roles_required('admin')
    def delete(self, delete_request_id):
        deleterequest= DeleteRequest.query.get(delete_request_id)
        db.session.delete(deleterequest)
        db.session.commit()
        return {"message": "Request Deleted"}


api.add_resource(DeleteRequestResource, '/delete-request', '/delete-request/<int:delete_request_id>')
    
category_product = {
    'p_id': fields.Integer,
    'name': fields.String,
    'manufacture_date': fields.String,
    'expiry_date': fields.String,
    'rate_per_unit': fields.String,
    'unit':fields.Integer
}

category_product_user = {
    'p_id': fields.Integer,
    'name': fields.String,
    'manufacture_date': fields.String,
    'expiry_date': fields.String,
    'rate_per_unit': fields.Integer,
    'unit':fields.Integer,
}

class categoryproduct(Resource):
    @auth_required('token')
    def get(self,category_id):
        category = Category.query.get(category_id)
        if category:
            products= category.products
            print(products)
            if products:
                if "customer" in current_user.roles:
                    return marshal(products,category_product_user)
                else:
                    return marshal(products, category_product)
            else: 
                return {"message": "No Products in this category"}
        else:
            return {"message": "No category found"}


api.add_resource(categoryproduct, '/category_product/<int:category_id>')
        
        
parser_cart = reqparse.RequestParser()
parser_cart.add_argument('product_name', type=str, help='Name is required and should be a string', required=True)
parser_cart.add_argument('quantity', type=int, help='Quantity should be an integer', required=True)
parser_cart.add_argument('price', type=float, help='Price should be an integer', required=True)

cart_fields = {
    'products': fields.List(fields.Nested({
        'p_id': fields.Integer,
        'p_name': fields.String,
        'quantity': fields.Integer,
        'price' : fields.Float,
        'total_price': fields.Float,
    })),
    'totals': fields.Nested({
        'total': fields.Float
    })
}

class CartResource(Resource):
    @auth_required('token')
    @roles_required('customer')
    def get(self):
        try:
            # Fetch cart items from the database
            cart_items = Cart.query.filter_by(user_id=current_user.id).all()

            # Combine items with the same product name and calculate total price
            combined_cart = {}
            totaling = 0
            for item in cart_items:
                if item.p_name in combined_cart:
                    combined_cart[item.p_name]['quantity'] += item.quantity
                    combined_cart[item.p_name]['total_price'] += item.quantity * item.price
                else:
                    combined_cart[item.p_name] = {
                        'quantity': item.quantity,
                        'price': item.price,
                        'total_price': item.quantity * item.price,
                    }
                totaling += item.quantity * item.price

            # Convert the combined_cart dictionary to a list of dictionaries
            combined_cart_list = [{'p_name': key, **value} for key, value in combined_cart.items()]

            # Create a dictionary for the response data
            response_data = {
                'products': combined_cart_list,
                'totals': {'total': totaling}
            }
            # print(response_data)
            # Return the response data
            return marshal(response_data, cart_fields), 200
        except Exception as e:
            # Log the exception for troubleshooting
            print(e)
            return {"error": "Internal Server Error"}, 500

    @auth_required('token')
    @roles_required('customer')
    def post(self):
        try:
            args = parser_cart.parse_args()
            product_name = args.get('product_name')
            quantity = args.get('quantity')
            price=args.get('price')
            cart = Cart(p_name=product_name, quantity=quantity,price=price, user_id=current_user.id)
            db.session.add(cart)
            db.session.commit()
        
            return {"message": "Product added to Cart"}, 201  # Adjust the status code if needed
        except Exception as e:
            # Log the exception for troubleshooting
            print(f"Error adding product to cart: {e}")
            return {"error": "Internal Server Error"}, 500  # Adjust the status code and error message if needed
    @auth_required('token')
    @roles_required('customer')   
    def delete(self,p_name):
        try:
            user_id = current_user.id 
            user_cart = Cart.query.filter_by(user_id=user_id, p_name=p_name).all()

            if not user_cart:
                return {'message': 'No products found with the given name in the cart'}

            for cart_item in user_cart:
                db.session.delete(cart_item)

            db.session.commit()

            return {'message': f'Products with name "{p_name}" deleted successfully'}
        except Exception as e:
            db.session.rollback()
            return {'message': 'Error deleting products', 'error': str(e)}


api.add_resource(CartResource, '/cart','/cart/<string:p_name>')


parser_user = reqparse.RequestParser()
parser_user.add_argument('name', type=str, help='Name is required and should be a string', required=True)
parser_user.add_argument('email', type=str, help='Email should be an string', required=True)
parser_user.add_argument('password', type=str, help='Password should be an string', required=True)


class UserRegistrationResource(Resource):
    def post(self):
        data = parser_user.parse_args()

        # Check if the user with the given email already exists
        existing_user = User.query.filter_by(email=data.get('email')).first()
        if existing_user:
            return {'message': 'Email is already registered'}, 400

        # If the user does not exist, proceed with user registration
        new_user = datastore.create_user(
            username=data.get('name'),
            email=data.get('email'),
            password=generate_password_hash(data.get('password')),
            active=True
        )
        datastore.add_role_to_user(new_user, 'customer')
        db.session.commit()
        return {'message': 'User registered successfully'}, 201

    
api.add_resource(UserRegistrationResource,'/user-registration')



parser_manager = reqparse.RequestParser()
parser_manager.add_argument('name', type=str, help='Name is required and should be a string', required=True)
parser_manager.add_argument('email', type=str, help='Email should be an string', required=True)
parser_manager.add_argument('password', type=str, help='Password should be an string', required=True)


class ManagerRegistrationResource(Resource):
    def post(self):
        data = parser_user.parse_args()

        # Check if the user with the given email already exists
        existing_user = User.query.filter_by(email=data.get('email')).first()
        if existing_user:
            return {'message': 'Email is already registered'}, 400

        # If the user does not exist, proceed with user registration
        new_user = datastore.create_user(
            username=data.get('name'),
            email=data.get('email'),
            password=generate_password_hash(data.get('password')),
            active=False
        )
        datastore.add_role_to_user(new_user, 'manager')
        db.session.commit()
        return {'message': 'Manager registered successfully'}, 201

    
api.add_resource(ManagerRegistrationResource,'/manager-registration')


category_search = {
    'c_id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'is_approved': fields.Boolean,
    # Add other fields as needed
}

product_search = {
    'p_id': fields.Integer,
    'name': fields.String,
    'manufacture_date': fields.String,
    'expiry_date': fields.String,
    'rate_per_unit': fields.Float,
    # Add other fields as needed
}

class SearchResource(Resource):
    def get(self):
        query = request.args.get('query', '')

        # Perform a search in categories and products based on the query
        categories = Category.query.filter(Category.name.ilike(f'%{query}%')).all()
        products = Product.query.filter(Product.name.ilike(f'%{query}%')).all()
        print(categories)
        # Use marshal to format the response
        categories_data = marshal(categories, category_search)
        products_data = marshal(products, product_search)

        # Return the search results
        return {'categories': categories_data, 'products': products_data}

# Add the resource to the API
api.add_resource(SearchResource, '/api/search')


class OrderResource(Resource):
    @auth_required('token')
    @roles_required('customer') 
    def get(self):
        user_id = current_user.id
        orders=Orders.query.filter_by(user_id=user_id)
        user=User.query.filter_by(id=user_id).first()
        if not user:
            return {"message": "User not found"}, 404

        # Extract the username from the user object
        username = user.username
        indian_timezone = pytz.timezone("Asia/Kolkata")
        # Organize the data into a dictionary
        response_data = {
            "username": username,
            "orders": [{"product_name": order.name, "quantity": order.quantity, "price": order.price,"timestamp": order.timestamp.astimezone(indian_timezone).isoformat()} for order in orders],
        }

        return response_data, 200
    @auth_required('token')
    @roles_required('customer') 
    def post(self):
        try:
            user_id = current_user.id

            # Get the user's cart items
            user_cart = Cart.query.filter_by(user_id=user_id).all()

            if not user_cart:
                return {'message': 'Your cart is empty. Place items in your cart before placing an order'}

            # Create a new order
            

            # Add each item from the cart to the order
            for cart_item in user_cart:
                order=Orders(
                    name= cart_item.p_name,
                    quantity=cart_item.quantity,
                    price =cart_item.price,
                    user_id= user_id
                )
                db.session.add(order)
                product = Product.query.filter_by(name=cart_item.p_name).first()
                if product:
                    product.unit -= cart_item.quantity

                # Delete the item from the user's cart
                db.session.delete(cart_item)

            # Add the order to the user's order history
            db.session.commit()

            return {'message': 'Order placed successfully'}

        except Exception as e:
            db.session.rollback()
            return {'message': 'Error placing the order', 'error': str(e)}

api.add_resource(OrderResource, '/order')