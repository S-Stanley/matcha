import psycopg2, os

import sql

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_user(data):
    with conn.cursor() as cur:
        user = cur.execute(
            sql.users.CREATE_USER,
            (
                data['email'],
                data['firstname'],
                data['lastname'],
                data['username'],
                data['password']
            )
        )
        new_user = cur.fetchone()
        conn.commit()
    return {
        "id": new_user[0],
        "email": new_user[1],
        "firstname": new_user[2],
        "lastname": new_user[3],
        "username": new_user[4],
    }
