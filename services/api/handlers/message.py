import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_message(data):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.message.CREATE_MESSAGE,
                (
                    data['user_id'],
                    data['match_id'],
                    data['content']
                )
            )
            req = cur.fetchone()
            conn.commit()
            return {
                "id": req[0],
                "user_id": req[1],
                "match_id": req[2],
                "content": req[3],
            }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_all_message_by_match_id(data):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.message.GET_ALL_MATCH_MESSAGES,
                (
                    data['match_id'],
                )
            )
            req = cur.fetchall()
            conn.commit()
            if not req or req is None:
                return []
            return req
    except Exception as e:
        conn.rollback()
        print(e)
        raise
