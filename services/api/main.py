from flask import Flask, request, jsonify
import os, psycopg2, json
from dotenv import load_dotenv
from routes import blueprint

import routes.users

app = Flask(__name__)

load_dotenv()

app.register_blueprint(blueprint)

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
