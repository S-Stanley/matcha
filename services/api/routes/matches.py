from . import blueprint
from flask import jsonify, request
import psycopg2, os

import handlers, utils

@blueprint.route("/matches/<match_id>/message", methods=['POST'])
def create_new_message(match_id):
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    if "content" not in request.form:
        print("Missing parameter")
        return "Missing parameter", 400
    new_message = handlers.create_message({
        "user_id": user['id'],
        "match_id": match_id,
        "content": request.form['content'],
    })
    if not new_message:
        return "Error", 400
    return new_message, 201

@blueprint.route("/matches/<match_id>/message", methods=['GET'])
def get_all_message_by_match_id(match_id):
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    if not handlers.is_user_member_of_match({
        "match_id": match_id,
        "user_id": user['id'],
    }):
        return "Error", 400
    all_message = handlers.get_all_message_by_match_id({
        "match_id": match_id,
    })
    return all_message, 200
