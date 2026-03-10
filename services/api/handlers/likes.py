import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))


def is_user_liked(liked_user_id, connected_user_id):
    print(liked_user_id, connected_user_id)
    with conn.cursor() as cur:
        cur.execute(
            sql.like.CHECK_IS_USER_LIKED,
            (
                liked_user_id,
                connected_user_id,
            )
        )
        req = cur.fetchone()
        conn.commit()
        return False if req is None else True

def should_create_match(data):
    with conn.cursor() as cur:
        cur.execute(
            sql.like.CHECK_IF_USER_IS_LIKING_BACK,
            (
                data['liked_by'],
                data['liked_user'],
            )
        )
        req = cur.fetchone()
        conn.commit()
    return False if req is None else True

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
