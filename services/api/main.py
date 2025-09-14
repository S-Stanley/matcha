from flask import Flask, request, jsonify
import os, psycopg2, json
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

@app.route("/users", methods=['POST'])
def create_user():
    try:
        with conn.cursor() as cur:
            user = cur.execute(
                'INSERT INTO "User" (email, password) VALUES (%s, %s) RETURNING id, email',
                (request.form['email'], request.form['password'])
            )
            new_user = cur.fetchone()
            conn.commit()
        return jsonify({
            "id": new_user[0],
            "email": new_user[1],
        })
    except Exception as e:
        print(e)
        return "Error"

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
