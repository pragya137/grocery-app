from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required, roles_accepted
from werkzeug.security import check_password_hash
from flask_restful import marshal, fields
from .models import *
from .sec import datastore
from .tasks import *
import flask_excel as excel
from celery.result import AsyncResult

@app.get('/')
def home():
    return render_template("index.html")
@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Hello admin"

@app.get('/activate/manager/<int:manager_id>')
@auth_required("token")
@roles_required("admin")
def activate_instructor(manager_id):
    manager = User.query.get(manager_id)
    if not manager or "manager" not in manager.roles:
        return jsonify({"message":"Manager not found"}), 404
    
    manager.active=True
    db.session.commit()
    return jsonify({"message":"User Activated"})



@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400
    
    user = datastore.find_user(email=email)
    

    if not user:
        return jsonify({"message": "User Not Found"}), 404
    
    
    if not user.active:
        return jsonify({"message": "User Account Not Active"}), 401  # Unauthorized

    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name})
    else:
        return jsonify({"message": "Wrong Password"}), 400

user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean,
}

@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message": "No User Found"}), 404
    return marshal(users, user_fields)


@app.get('/category/<int:id>/approve')
@auth_required("token")
@roles_required("admin")
def resource(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({"message": "Category Not found"}), 404
    category.is_approved = True
    db.session.commit()
    return jsonify({"message": "Aproved"})

get_fields = {
    'c_id': fields.Integer,
    'name':   fields.String,
    'description':  fields.String,
    'is_approved': fields.Boolean,
    'manager_id': fields.Integer
}

@app.get('/get/category')
@auth_required("token")
@roles_accepted("admin","manager")
def get_category():
    categories = Category.query.filter_by(is_approved=True).all()
    if not categories:
        return jsonify({"message": "Category Not found"}), 404
    print(categories)
    return marshal(categories, get_fields)




@app.get('/download-csv/')
def download_csv():
    task = find_prod_res.delay()
    return jsonify({"task-id": task.id})


@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404
    
    
@app.route('/api/search', methods=['GET'])
def search():
    search_query = request.args.get('query', '')

    # Perform the search based on the query
    # Search for matching categories
    categories = Category.query.filter(
        (Category.name.ilike(f'%{search_query}%')) |
        (Category.description.ilike(f'%{search_query}%'))
    ).all()

    # Search for matching products
    products = Product.query.filter(
        (Product.name.ilike(f'%{search_query}%')) |
        (Product.manufacture_date.ilike(f'%{search_query}%')) |
        (Product.expiry_date.ilike(f'%{search_query}%'))
    ).all()

    # Create a list of dictionaries representing the search results
    search_results = []

    for category in categories:
        # Include information about the category
        category_info = {
            'type': 'category',
            'id': category.c_id,
            'name': category.name,
            'description': category.description,
        }
        search_results.append(category_info)

        # Include information about products in this category
        for product in category.products:
            product_info = {
                'type': 'product',
                'id': product.p_id,
                'name': product.name,
                'manufacture_date': product.manufacture_date,
                'expiry_date': product.expiry_date,
                'rate_per_unit': product.rate_per_unit,
                'unit': product.unit,
            }
            search_results.append(product_info)

    for product in products:
        # Include information about the product
        product_info = {
            'type': 'product',
            'id': product.p_id,
            'name': product.name,
            'manufacture_date': product.manufacture_date,
            'expiry_date': product.expiry_date,
            'rate_per_unit': product.rate_per_unit,
            'unit': product.unit,
        }
        search_results.append(product_info)

    return jsonify(search_results)