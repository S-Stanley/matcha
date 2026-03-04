from . import blueprint
from flask import jsonify, request

import handlers, utils

@blueprint.route("/likes", methods=['POST'])
def create_like():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    like_created = handlers.create_like({
        "liked_by": user['id'],
        "liked_user": request.form['liked_user']
    })
    print("like_created", like_created)
    return like_created, 200

@blueprint.route("/likes", methods=['GET'])
def get_user_like():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    like_list = handlers.get_like_list(user['id'])
    return like_list, 200
