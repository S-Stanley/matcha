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
        })
    except Exception as e:
        print(e)
        return "Error"
