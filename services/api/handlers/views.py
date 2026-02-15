import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def get_all_profile_view(profileUserId):
    with conn.cursor() as cur:
        req = cur.execute(
            sql.views.GET_ALL_PROFILE_VIEW,
            (
                profileUserId,
            )
        )
        req = cur.fetchall()
        conn.commit()
    if req is None:
        return False
    return req

def create_view(data):
    print(data)
    with conn.cursor() as cur:
        view = cur.execute(
            sql.views.CREATE_VIEW,
            (
                data['profileUserId'],
                data['viewerUserId']
            )
        )
        new_view = cur.fetchone()
        conn.commit()
    return {
        "id": new_view[0],
    }
