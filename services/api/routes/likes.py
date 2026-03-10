from . import blueprint
from flask import jsonify, request

import handlers, utils

@blueprint.route("/likes/<liked_user_id>", methods=['DELETE'])
def delete_like_endpoint(liked_user_id):
    connected_user = handlers.get_user_by_token(request.headers.get("token"))
    if not connected_user:
        return "Error", 400
    has_existing_match = handlers.check_if_match_exist([liked_user_id, connected_user['id']])
    handlers.delete_like(liked_user_id, connected_user['id'])
    print("**", has_existing_match)
    if has_existing_match:
        handlers.delete_match_from_unlike(has_existing_match['id']);
        handlers.create_notification({
            "user_id":liked_user_id,
            "type": "NEW_UNLIKE",
            "from_user_id": connected_user['id'],
        })
    return { "deleted": True }, 200

@blueprint.route("/likes", methods=['POST'])
def create_like():
    user = handlers.get_user_by_token(request.headers.get("token"))
    if not user:
        return "Error", 400
    like_created = handlers.create_like({
        "liked_by": user['id'],
        "liked_user": request.form['liked_user']
    })
    handlers.create_notification({
        "user_id": request.form['liked_user'],
        "type": "NEW_LIKE",
        "from_user_id": user['id'],
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
        handlers.create_notification({
            "user_id": request.form['liked_user'],
            "type": "NEW_MATCH",
            "from_user_id": user['id'],
        })
        handlers.create_notification({
            "user_id": user['id'],
            "type": "NEW_MATCH",
            "from_user_id": request.form['liked_user'],
        })
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
