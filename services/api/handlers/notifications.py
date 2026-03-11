import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_notification(data):
    with conn.cursor() as cur:
        cur.execute(
            sql.notifications.CREATE_NOTIFICATION,
            (
                data['user_id'],
                data['type'],
                data['from_user_id'],
            )
        )
        req = cur.fetchone()
        conn.commit()
    return {
        "id": req[0],
    }
