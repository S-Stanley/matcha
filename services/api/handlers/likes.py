import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_like(data):
    with conn.cursor() as cur:
        cur.execute(
            sql.like.CREATE_LIKE,
            (
                data['liked_by'],
                data['liked_user'],
            )
        )
        new_like = cur.fetchone()
        conn.commit()
    return {
        "id": new_like[0],
        "likedBy": new_like[1],
        "libedUser": new_like[2],
    }

def get_like_list(user_id):
    with conn.cursor() as cur:
        req = cur.execute(
            sql.like.GET_LIKE_LIST,
            (
                user_id,
            )
        )
        req = cur.fetchall()
        conn.commit()
        if req is None:
            return False
        return req
