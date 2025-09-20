from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers

@blueprint.route("/users", methods=['POST'])
def create_user():
    try:
        new_user = handlers.users.create_user(request.form);
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
            return "Error", 401
        return jsonify(user)
    except Exception as e:
        print(e)
        return "Error", 500
