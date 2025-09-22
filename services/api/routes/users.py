from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers, utils

@blueprint.route("/users", methods=['POST'])
def create_user():
    try:
        existing_email = handlers.users.get_user_by_email(request.form['email'])
        if existing_email:
            return "Email already exist", 400
        existing_username = handlers.users.get_user_by_username(request.form['username'])
        if existing_username:
            return "Username already exist", 400
        if utils.check_new_user_input_len(request.form) is False:
            return "Somes input are too long", 400
        new_user = handlers.users.create_user(request.form);
        if not new_user:
            return "Error", 400
        return jsonify({
            "id": new_user["id"],
            "email": new_user["email"],
            "firstname": new_user["firstname"],
            "lastname": new_user["lastname"],
            "username": new_user["username"],
            "token": new_user["token"],
        }), 201
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/login", methods=['POST'])
def connect_user():
    try: 
        user = handlers.users.connect_user(request.form);
        if not user:
            return "User does not exist", 401
        return jsonify(user)
    except Exception as e:
        print(e)
        return "Error", 500
