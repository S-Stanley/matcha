from flask import Flask, request, jsonify
import os, psycopg2, json
from dotenv import load_dotenv
from routes import blueprint
from flask_cors import CORS

import routes.users
import handlers

app = Flask(__name__)
CORS(app)

load_dotenv()

app.register_blueprint(blueprint)

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

_UNPROTECTED_ROUTES_ = {
    "POST": ["/users", "/users/", "/users/login", "/users/login/"]
}

def isProtectedRoute(method, path):
    unprotectedRoutesOnMethod = _UNPROTECTED_ROUTES_.get(method)
    if not unprotectedRoutesOnMethod:
        return False
    unprotectedRoutesOnPath = path in unprotectedRoutesOnMethod
    return False if unprotectedRoutesOnPath else True

@app.before_request
def before_request():
    if isProtectedRoute(request.method, request.path):
        token = request.headers.get("token")
        if not token:
            return "Error", 401
        usr = handlers.get_user_by_token(token)
        if not usr or usr is None or usr is False:
            return "Error", 401

@app.route("/")
def get_status():
    return jsonify({
        "status": "OK"
    })
