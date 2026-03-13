from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers, utils

@blueprint.route("/users/<blocked_user_id>/block", methods=['POST'])
def report_user(blocked_user_id):
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    handlers.create_block(blocked_user_id, user['id'])
    has_existing_match = handlers.check_if_match_exist([blocked_user_id, user['id']])
    handlers.delete_match_from_unlike(has_existing_match['id']);
    return { "is_blocked": True }, 200

@blueprint.route("/users/<reported_user_id>/report", methods=['POST'])
def block_user(reported_user_id):
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    handlers.create_report(reported_user_id, user['id'])
    return { "reported": True }, 200

@blueprint.route("/users/tag/<tag_name>", methods=['PATCH'])
def update_tag(tag_name):
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    handlers.create_or_delete_tag(user['id'], tag_name)
    return { "updated": True }, 200

@blueprint.route("/users/picture", methods=['PATCH'])
def update_profile_picture():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    url = utils.upload_files(user['id'], request.files['file'])
    handlers.store_picture(user['id'], url)
    return { "url": url }, 200


@blueprint.route("/users/me/notifications", methods=['PATCH'])
def set_all_notifications_as_read_by_user_id():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    handlers.set_all_user_notifications_as_read(user['id'])
    return { "updated": True }, 200

@blueprint.route("/users/me/notifications", methods=['GET'])
def get_all_user_notifications():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    return handlers.get_all_notifications_by_user_id(user['id']), 200

@blueprint.route("/users", methods=['GET'])
def get_user_list():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    return handlers.get_all_users(), 200

@blueprint.route("/users/password/change/confirm", methods=['POST'])
def confirm_password_change():
    if 'username' not in request.form or 'confirm_code' not in request.form:
        return "Error", 400
    if not handlers.check_confirm_password_request(request.form['username'], request.form['confirm_code']):
        return { "updated": False }, 400
    return { "updated": True }, 200

@blueprint.route("/users/me", methods=['GET'])
def get_user_me():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    return user, 200

@blueprint.route("/users/<user_id>", methods=['GET'])
def get_user_by_id(user_id):
    try:
        connected_user = handlers.get_user_by_token(request.headers.get("token"))
        if not connected_user:
            return "Error", 400
        user = handlers.get_user_by_id(user_id)
        is_already_liked = handlers.is_user_liked(liked_user_id=user_id, connected_user_id=connected_user['id'])
        return {
            "id": user['id'],
            "firstname": user['firstname'],
            "lastname": user['lastname'],
            "username": user['username'],
            "popularity": user['popularity'],
            "city": user['city'],
            "picture_url": user['picture_url'],
            "isLiked": is_already_liked,
            "last_login": user['last_login'],
        }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/signup/confirm", methods=['POST'])
def confirm_user_signup():
    user = handlers.is_confirmation_code_successful(request.form['username'], request.form['confirm_code'])
    if not user:
        print("Wrong confirmation conde")
        return "Error", 400
    handlers.create_login(user['id'])
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
        print("code", new_user['confirm_code'])
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
        handlers.create_login(user['id'])
        return jsonify(user)
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/logout", methods=['POST'])
def disconnect_user():
    try: 
        actual_user = handlers.get_user_by_token(request.headers.get("token"))
        if not actual_user:
            return "Error", 401
        user = handlers.users.disconnect_user(actual_user['id'])
        if not user:
            return "User does not exist", 401
        return { "disconnected": True }, 200
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

@blueprint.route("/users/password/change/request", methods=['POST'])
def request_new_password():
    is_request_successful = handlers.request_new_password(
        username=request.form['username'],
        password=request.form['password'],
    )
    if not is_request_successful:
        return { "requested": False }, 400
    return { "requested": True }, 200

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
