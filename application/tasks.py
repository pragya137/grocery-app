from celery import shared_task
from .models import *
from datetime import datetime as date, timedelta
from flask import render_template_string
import flask_excel as excel
from celery.schedules import crontab
from httplib2 import Http
from json import dumps
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from email import encoders
from email.mime.base import MIMEBase

@shared_task(ignore_result=False)
def find_prod_res():
    prod_res=Product.query.with_entities(Product.p_id,Product.name,Product.manufacture_date,Product.expiry_date,Product.rate_per_unit,Product.unit).all()
    csv_output=  excel.make_response_from_query_sets(prod_res, ["p_id","name","manufacture_date","expiry_date","rate_per_unit","unit"], "csv")
    filename = "test.csv"

    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename

@shared_task(ignore_result=False)
def send_reminder():
    try:
        """Google Chat incoming webhook quickstart."""
        url = "https://chat.googleapis.com/v1/spaces/AAAAQP7gd0I/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=-DVmSsTJrGsIfTC8sq8tlhMYnKYtGZgVHD7vMIAy9VI"
        all_users = User.query.filter(User.roles.any(name="customer")).all()
    
        for user in all_users:
            latest_orders = Orders.query.filter_by(user_id=user.id).order_by(Orders.timestamp.desc()).first()
            if latest_orders is None:
                bot_message = {'text': f'Hello {user.username}.. You have not purchased anything yet. Please visit our site to shop.'}
                message_headers = {"Content-Type": "application/json; charset=UTF-8"}
                http_obj = Http()
                response = http_obj.request(
                    uri=url,
                    method="POST",
                    headers=message_headers,
                    body=dumps(bot_message),
                )
                print(response)
            elif latest_orders.timestamp < datetime.utcnow() - timedelta(hours=24):
                bot_message = {'text': f'Hello {user.username}.. It has been more than 24 hours since your last shopping. Please visit our site to shop again.'}
                message_headers = {"Content-Type": "application/json; charset=UTF-8"}
                http_obj = Http()
                response = http_obj.request(
                    uri=url,
                    method="POST",
                    headers=message_headers,
                    body=dumps(bot_message),
                )
                print(response)
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    return "reminder will be sent shortly..."


SMPTP_SERVER_HOST="localhost"
SMPTP_SERVER_PORT=1025
SENDER_ADDRESS="admin@example.com"
SENDER_PASSWORD=""

def send_email(to_address,subject,message,content="text",attachment_file=None):
    msg=MIMEMultipart()
    msg["From"]=SENDER_ADDRESS
    msg["To"]=to_address
    msg["Subject"]=subject
    if content=="html":      
        msg.attach(MIMEText(message,"html"))
    else:
        msg.attach(MIMEText(message,"plain"))
        
    if attachment_file:
        with open(attachment_file,"rb") as attachment:
            
            part =MIMEBase("application","octet-stream")
            part.set_payload(attachment.read())
            encoders.encode_base64(part)


    s=smtplib.SMTP(host=SMPTP_SERVER_HOST,port=SMPTP_SERVER_PORT)
    s.login(SENDER_ADDRESS,SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()
    return True

@shared_task(ignore_result=False)
def send_reminder_via_email():
    # Query the User and Booking tables
    all_users = User.query.all()

    for user in all_users:
        bookings = Orders.query.filter_by(user_id=user.id).all()
        if bookings:
            email_content = render_template_string(
                """
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                        }
                        h2 {
                            color: #333;
                        }
                        ul {
                            list-style-type: none;
                            padding: 0;
                        }
                        li {
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <h2>Your Shopping Details</h2>
                    <p>Hello {{ user.username }},</p>
                    <p>Here are your recent bookings:</p>
                    <ul>
                        {% for booking in bookings %}
                            <li>
                                <strong>Order ID:</strong> {{ booking.id }}<br>
                                <strong>Product:</strong> {{ booking.name }}<br>
                                <strong>Quantity:</strong> {{ booking.quantity }}<br>
                                <strong>Price:</strong> {{ booking.price }}<br>
                                <strong>Timestamp:</strong> {{ booking.timestamp }}
                            </li>
                            <br>
                        {% endfor %}
                    </ul>
                </body>
                </html>
                """,
                user=user,
                bookings=bookings,
            )

            send_email(
                to_address=user.email,
                subject="Your Recent Shopping Details",
                message=email_content,
                content="html",
            )
    
    return "Reminder emails sent successfully"

