import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_message(data):
    with conn.cursor() as cur:
        new_item = cur.execute(
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

def get_all_message_by_match_id(data):
    with conn.cursor() as cur:
        try:
            req = cur.execute(
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
            print(e)
            return []
