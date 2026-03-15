import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_notification(data):
    try:
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
    except Exception as e:
        conn.rollback()
        print(e)
        raise
