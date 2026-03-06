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
    is_new_match = False
    if handlers.should_create_match({
        "liked_by": user['id'],
        "liked_user": request.form['liked_user']
    }):
        print("It's a match!")
        is_new_match = handlers.init_new_match([
            user['id'],
            request.form['liked_user']
        ])
    else:
        print("It is not a match..")
    return {
        "like": like_created,
        "is_new_match": True if is_new_match else False,
        "match": is_new_match if is_new_match else None
    }, 200

@blueprint.route("/likes", methods=['GET'])
def get_user_like():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    like_list = handlers.get_like_list(user['id'])
    return like_list, 200
