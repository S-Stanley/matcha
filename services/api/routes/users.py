from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers, utils

@blueprint.route("/users/me", methods=['GET'])
def get_user_me():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    return user, 200

@blueprint.route("/users/<user_id>", methods=['GET'])
def get_user_by_id(user_id):
    try:
        user = handlers.get_user_by_id(user_id)
        return user, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/signup/confirm", methods=['POST'])
def confirm_user_signup():
    user = handlers.is_confirmation_code_successful(request.form['username'], request.form['confirm_code'])
    if not user:
        print("Wrong confirmation conde")
        return "Error", 400
    return user, 200

@blueprint.route("/users", methods=['POST'])
def create_user():
    try:
        existing_email = handlers.users.get_user_by_email(request.form['email'])
        if existing_email:
            print("Email already exist")
            return "Email already exist", 400
        existing_username = handlers.users.get_user_by_username(request.form['username'])
        if existing_username:
            print("Username already exist")
            return "Username already exist", 400
        if utils.check_new_user_input_len(request.form) is False:
            print("Somes input are too long")
            return "Somes input are too long", 400
        if utils.check_password_not_commun(request.form['password']) is False:
            print("Password is too common")
            return "Password is too common", 400
        new_user = handlers.users.create_user(request.form);
        if not new_user:
            print("Error while trying to create user", not new_user)
            return "Error", 400
        if not utils.send_signup_confirmation_email(
            dest={"email": new_user['email'], "name": new_user['firstname']},
            confirmation_code=new_user['confirm_code']
        ):
            return "Error sending email", 400
        return jsonify({
            "id": new_user["id"],
            "email": new_user["email"],
            "firstname": new_user["firstname"],
            "lastname": new_user["lastname"],
            "username": new_user["username"],
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

@blueprint.route("/users/logout", methods=['POST'])
def disconnect_user():
    try: 
        user = handlers.users.disconnect_user(request.form['id']);
        if not user:
            return "User does not exist", 401
        return True, 200
    except Exception as e:
        print(e)
        return "Error", 500

GENDER = [
  'MALE',
  'FEMALE',
  'OTHERS',
  'DO NOT PRONONCE'
]
PREFERENCE = [
  'MALE',
  'FEMALE',
  'BOTH'
]

@blueprint.route("/users", methods=['PATCH'])
def patch_user():
    try:
        actual_user = handlers.get_user_by_token(request.headers.get("token"))
        if not actual_user:
            return "Error", 400
        if 'gender' in request.form and request.form['gender'] not in GENDER:
            print("Genre wrong value")
            return "Error", 400
        if 'preference' in request.form and request.form['preference'] not in PREFERENCE:
            print("Preferences wrong value")
            return "Error", 400
        update_user = handlers.patch_user(request.form, actual_user)
        if not update_user:
            return "Error", 400
        return update_user, 200
    except Exception as e:
        print(e)
        return "Error", 500
