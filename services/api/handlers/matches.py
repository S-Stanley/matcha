import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def get_all_matches_by_user_id(user_id): 
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.GET_ALL_MATCH_BY_USER_ID,
            (
                user_id,
                user_id,
            )
        )
        req = cur.fetchall()
        conn.commit()
        output = []
        for user in req:
            output.append({
                "id": user[0],  # Backward-compatible alias of match_id
                "match_id": user[0],
                "user_id": user[1],
                "username": user[2],
                "firstname": user[3],
                "lastname": user[4],
            })
        return output

def delete_match_message(match_id): 
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.DELETE_ALL_CHAT_MESSAGE,
            (
                match_id,
            )
        )
        conn.commit()
    return True


def delete_match(match_id):
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.DELETE_MATCH,
            (
                match_id,
            )
        )
        conn.commit()
    return True

def delete_match_member(match_id):
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.DELETE_MATCH_MEMBER,
            (
                match_id,
            )
        )
        conn.commit()
    return True

def delete_match_from_unlike(match_id):
    delete_match_member(match_id)
    delete_match_message(match_id)
    delete_match(match_id)

def create_match_member(data):
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.CREATE_MATCH_MEMBER,
            (
                data['match_id'],
                data['user_id']
            )
        )
        req = cur.fetchone()
        conn.commit()
    return {
        "id": req[0],
        "match_id": req[1],
        "user_id": req[2],
        "created_at": req[3],
    }

def create_match():
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.CREATE_MATCH,
        )
        req = cur.fetchone()
        conn.commit()
    return {
        "id": req[0],
        "created_at": req[1],
    }

def get_other_member_of_match(match_id, connected_user_id):
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.GET_OTHER_MEMBER_OF_MATCH,
            (
                match_id,
                connected_user_id,
            )
        )
        req = cur.fetchone()
        conn.commit()
    return req[0]

def check_if_match_exist(userIds):
    with conn.cursor() as cur:
        cur.execute(
            sql.matches.CHECK_IF_MATCH_ALREADY_EXIST,
            (
                userIds[0],
                userIds[1],
            )
        )
        req = cur.fetchone()
        conn.commit()
    return {
        "id": req[0],
        "created_at": req[1]
    } if (req is not None and len(req) >= 1 and req[0]) else None

def is_user_member_of_match(data):
    with conn.cursor() as cur:
        try:
            cur.execute(
                sql.matches.IS_USER_MEMBER_OF_MATCH,
                (
                    data['match_id'],
                    data['user_id'],
                )
            )
            req = cur.fetchone()
            conn.commit()
            return True if req else None
        except Exception as e:
            print(e)
            return False

def init_new_match(userIds):
    if len(userIds) != 2:
        return False
    existing_match = check_if_match_exist(userIds)
    if existing_match:
        return existing_match
    new_match = create_match()
    create_match_member({
        "match_id": new_match['id'],
        "user_id": userIds[0]
    })
    create_match_member({
        "match_id": new_match['id'],
        "user_id": userIds[1]
    })
    return new_match
