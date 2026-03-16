from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers, utils

@blueprint.route("/users/<blocked_user_id>/block", methods=['POST'])
def report_user(blocked_user_id):
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        handlers.create_block(blocked_user_id, user['id'])
        has_existing_match = handlers.check_if_match_exist([blocked_user_id, user['id']])
        handlers.update_popularity_score(blocked_user_id, -20)
        if has_existing_match:
            handlers.delete_match_from_unlike(has_existing_match['id'])
        return { "is_blocked": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/<reported_user_id>/report", methods=['POST'])
def block_user(reported_user_id):
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        handlers.create_report(reported_user_id, user['id'])
        handlers.update_popularity_score(reported_user_id, -50)
        return { "reported": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/tag/<tag_name>", methods=['PATCH'])
def update_tag(tag_name):
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        handlers.create_or_delete_tag(user['id'], tag_name)
        return { "updated": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/picture", methods=['PATCH'])
def add_profile_picture():
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        if 'file' not in request.files:
            return "Error, file is required", 400
        current_count = handlers.get_pictures_count_by_user_id(user['id'])
        if current_count >= 5:
            return "Error, cannot upload more than 5 pictures", 400
        url = utils.upload_files(user['id'], request.files['file'])
        picture = handlers.create_picture(user['id'], url)
        if not picture:
            return "Error", 400
        return { "picture": picture, "total": current_count + 1 }, 201
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/picture/<picture_id>", methods=['DELETE'])
def delete_profile_picture(picture_id):
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        handlers.delete_picture_by_id_for_user(picture_id, user['id'])
        return { "deleted": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500


@blueprint.route("/users/me/notifications", methods=['PATCH'])
def set_all_notifications_as_read_by_user_id():
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        handlers.set_all_user_notifications_as_read(user['id'])
        return { "updated": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/me/notifications", methods=['GET'])
def get_all_user_notifications():
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        return handlers.get_all_notifications_by_user_id(user['id']), 200
    except Exception as e:
        print(e)
        return "Error", 500

SORT_BY_VALUES = ('age', 'popularity', 'city')
ORDER_VALUES = ('asc', 'desc')

@blueprint.route("/users/nav", methods=['GET'])
def get_user_nav():
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        age_min = request.args.get("ageMin")
        age_max = request.args.get("ageMax")
        popularity_min = request.args.get("popularityMin")
        popularity_max = request.args.get("popularityMax")
        city = request.args.get("city")
        tags_value = request.args.get("tags")
        sort_by = request.args.get("sortBy")
        order_by = request.args.get("orderBy")
        try:
            age_min_int = int(age_min) if age_min is not None else None
            age_max_int = int(age_max) if age_max is not None else None
            popularity_min_int = int(popularity_min) if popularity_min is not None else None
            popularity_max_int = int(popularity_max) if popularity_max is not None else None
        except ValueError:
            return "Error, ageMin, ageMax, popularityMin and popularityMax must be integers", 400
        if sort_by is not None and sort_by not in SORT_BY_VALUES:
            return "Error, unknown value sortBy", 400
        if order_by is not None and order_by not in ORDER_VALUES:
            return "Error, unknown value orderBy", 400
        tags = None if tags_value is None else tags_value.split(",")
        filteredGender = utils.getGenderFilter(user['gender'], user['preference'])
        exceptUsersIds = handlers.get_all_users_ids_blocked(user['id'])
        print(exceptUsersIds)
        exceptUsersIds.append(user['id'])
        return handlers.get_all_users_nav(
            user,
            age_min_int,
            age_max_int,
            popularity_min_int,
            popularity_max_int,
            city=city,
            tags=tags,
            filteredGender=filteredGender,
            exceptUsersIds=exceptUsersIds,
            sort_by=sort_by,
            order_by=order_by,
        ), 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users", methods=['GET'])
def get_user_list():
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        age_min = request.args.get("ageMin")
        age_max = request.args.get("ageMax")
        popularity_min = request.args.get("popularityMin")
        popularity_max = request.args.get("popularityMax")
        city = request.args.get("city")
        tags_value = request.args.get("tags")
        sort_by = request.args.get("sortBy")
        order_by = request.args.get("orderBy")
        try:
            age_min_int = int(age_min) if age_min is not None else None
            age_max_int = int(age_max) if age_max is not None else None
            popularity_min_int = int(popularity_min) if popularity_min is not None else None
            popularity_max_int = int(popularity_max) if popularity_max is not None else None
        except ValueError:
            return "Error, ageMin, ageMax, popularityMin and popularityMax must be integers", 400
        if sort_by is not None and sort_by not in SORT_BY_VALUES:
            return "Error, unknown value sortBy", 400
        if order_by is not None and order_by not in ORDER_VALUES:
            return "Error, unknown value orderBy", 400
        tags = None if tags_value is None else tags_value.split(",")
        exceptUsersIds = handlers.get_all_users_ids_blocked(user['id'])
        exceptUsersIds.append(user['id'])
        return handlers.get_all_users(
            age_min_int,
            age_max_int,
            popularity_min_int,
            popularity_max_int,
            city=city,
            tags=tags,
            exceptUsersIds=exceptUsersIds,
            sort_by=sort_by,
            order_by=order_by,
        ), 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/password/change/confirm", methods=['POST'])
def confirm_password_change():
    try:
        if 'username' not in request.form or 'confirm_code' not in request.form:
            return "Error", 400
        if not handlers.check_confirm_password_request(request.form['username'], request.form['confirm_code']):
            return { "updated": False }, 400
        return { "updated": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/me", methods=['GET'])
def get_user_me():
    try:
        user = handlers.get_user_by_token(request.headers.get("token"))
        if not user:
            return "Error", 400
        pictures = handlers.get_pictures_by_user_id(user['id'])
        user_with_pictures = dict(user)
        user_with_pictures['pictures'] = pictures
        return user_with_pictures, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/<user_id>", methods=['GET'])
def get_user_by_id(user_id):
    try:
        connected_user = handlers.get_user_by_token(request.headers.get("token"))
        if not connected_user:
            return "Error", 400
        user = handlers.get_user_by_id(user_id)
        if not user:
            return "Error", 404
        is_already_liked = handlers.is_user_liked(liked_user_id=user_id, connected_user_id=connected_user['id'])
        pictures = handlers.get_pictures_by_user_id(user_id)
        tags = handlers.get_tags_by_user_id(user_id)
        return {
            "id": user['id'],
            "firstname": user['firstname'],
            "lastname": user['lastname'],
            "username": user['username'],
            "bio": user['bio'],
            "gender": user['gender'],
            "preference": user['preference'],
            "popularity": user['popularity'],
            "city": user['city'],
            "age": user['age'],
            "tags": tags,
            "pictures": pictures,
            "isLiked": is_already_liked,
            "last_login": user['last_login'],
        }, 200
    except Exception as e:
        print(e)
        return "Error", 500

@blueprint.route("/users/signup/confirm", methods=['POST'])
def confirm_user_signup():
    try:
        user = handlers.is_confirmation_code_successful(request.form['username'], request.form['confirm_code'])
        if not user:
            print("Wrong confirmation code")
            return "Error", 400
        handlers.create_login(user['id'])
        return user, 200
    except Exception as e:
        print(e)
        return "Error", 500

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
            print("Some inputs are too long")
            return "Some inputs are too long", 400
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
    try:
        is_request_successful = handlers.request_new_password(
            username=request.form['username'],
            password=request.form['password'],
        )
        if not is_request_successful:
            return { "requested": False }, 400
        return { "requested": True }, 200
    except Exception as e:
        print(e)
        return "Error", 500

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
