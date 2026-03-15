import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def get_all_profile_view(profileUserId):
    try:
        with conn.cursor() as cur:
            cur.execute(
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
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def create_view(data):
    try:
        with conn.cursor() as cur:
            cur.execute(
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
    except Exception as e:
        conn.rollback()
        print(e)
        raise
