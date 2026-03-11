from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers, utils

@blueprint.route("/views/", methods=['POST'])
def create_new_view():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    if "profileUserId" not in request.form:
        print("Missing parameter")
        return "Missing parameter", 400
    new_view = handlers.create_view({
        "profileUserId": request.form['profileUserId'],
        "viewerUserId": user['id']
    })
    handlers.create_notification({
        "user_id": request.form['profileUserId'],
        "type": "NEW_VIEW",
        "from_user_id": user['id'],
    })
    return new_view, 201

@blueprint.route("/views/me", methods=['GET'])
def read_all_users_views():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    all_views = handlers.get_all_profile_view(user['id'])
    return all_views, 200
