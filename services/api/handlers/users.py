import psycopg2, os, sql, bcrypt, uuid, utils
from datetime import datetime, timedelta

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_login(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.CREATE_LOGIN,
                (
                    user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def create_report(user_id, from_user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.CREATE_REPORT,
                (
                    user_id,
                    from_user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_all_users_ids_blocked(from_user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_ALL_USERS_ID_BLOCKED,
                (
                    from_user_id,
                )
            )
            req = cur.fetchall()
            conn.commit()
            return req
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def create_block(user_id, from_user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.CREATE_BLOCK,
                (
                    user_id,
                    from_user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_pictures_count_by_user_id(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.pictures.COUNT_PICTURES_BY_USER_ID,
                (
                    user_id,
                )
            )
            res = cur.fetchone()
            conn.commit()
            return res[0] if res and len(res) > 0 else 0
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def create_picture(user_id, url):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.pictures.CREATE_PICTURE,
                (
                    user_id,
                    url,
                )
            )
            picture = cur.fetchone()
            conn.commit()
            return {
                "id": picture[0],
                "user_id": picture[1],
                "url": picture[2],
                "created_at": picture[3],
            }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_pictures_by_user_id(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.pictures.GET_PICTURES_BY_USER_ID,
                (
                    user_id,
                )
            )
            rows = cur.fetchall()
            conn.commit()
            output = []
            for row in rows:
                output.append({
                    "id": row[0],
                    "user_id": row[1],
                    "url": row[2],
                    "created_at": row[3],
                })
            return output
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def delete_picture_by_id_for_user(picture_id, user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.pictures.DELETE_PICTURE_BY_ID_AND_USER_ID,
                (
                    picture_id,
                    user_id,
                )
            )
            deleted_rows = cur.rowcount
            conn.commit()
            return deleted_rows > 0
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def add_tag(user_id, tag):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.tags.ADD_TAG,
                (
                    user_id,
                    tag,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def delete_tag(user_id, tag):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.tags.DELETE_TAG,
                (
                    user_id,
                    tag,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def is_tag_exist_for_user(user_id, tag):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.tags.CHECK_IF_TAG_EXIST_FOR_USER,
                (
                    user_id,
                    tag,
                )
            )
            req = cur.fetchall()
            conn.commit()
            if req is None or len(req) == 0:
                return False
            return True
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def update_popularity_score(user_id, delta):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.UPDATE_POPULARITY_SCORE,
                (
                    delta,
                    user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_all_users_nav(
    user,
    age_min=None,
    age_max=None,
    popularity_min=None,
    popularity_max=None,
    city=None,
    tags=None,
    filteredGender=None,
    exceptUsersIds=[],
    sort_by=None,
    order_by=None,
):
    sort_by = sort_by.lower() if sort_by else None
    order_by = order_by.lower() if order_by else None

    cityOfUser = user['city'] if user['city'] else ""
    ageOfUser = user['age'] if user['age'] else "0"
    if sort_by not in ('age', 'popularity', 'city'):
        sort_by = '(CASE WHEN "User".city = \'{}\' THEN 100 ELSE 0 END + "User".popularity * 10 + "User".age - {})'.format(cityOfUser, ageOfUser)
    if order_by not in ('asc', 'desc'):
        order_by = 'desc'
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_ALL_USERS_NAV.format(sort_by,order_by),
                (
                    age_min,
                    age_min,
                    age_max,
                    age_max,
                    popularity_min,
                    popularity_min,
                    popularity_max,
                    popularity_max,
                    city,
                    city,
                    tags,
                    tags,
                    filteredGender,
                    exceptUsersIds,
                )
            )
            req = cur.fetchall()
            conn.commit()
            output = []
            for user in req:
                output.append({
                    "id": user[0],
                    "username": user[1],
                    "firstname": user[2],
                    "lastname": user[3],
                    "popularity": user[4],
                    "age": user[5],
                    "city": user[6],
                })
            return output
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def create_or_delete_tag(user_id, tag):
    if is_tag_exist_for_user(user_id, tag):
        delete_tag(user_id, tag)
    else:
        add_tag(user_id, tag)

def set_all_user_notifications_as_read(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.notifications.UPDATE_USER_SET_ALL_NOTIFICATIONS_AS_READ_BY_USER_ID,
                (
                    user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_all_notifications_by_user_id(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.notifications.GET_ALL_NOTIFICATIONS_BY_USER_ID,
                (
                    user_id,
                )
            )
            req = cur.fetchall()
            conn.commit()
            output = []
            for user in req:
                output.append({
                    "id": user[0],
                    "type": user[1],
                    "from_user_id": user[2],
                    "created_at": user[3],
                })
            return output
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_all_users(
    age_min=None,
    age_max=None,
    popularity_min=None,
    popularity_max=None,
    city=None,
    tags=None,
    exceptUsersIds=[],
    sort_by=None,
    order_by=None
):
    sort_by = (sort_by or 'popularity').lower()
    order_by = (order_by or 'desc').lower()

    if sort_by not in ('age', 'popularity', 'city'):
        sort_by = 'popularity'
    if order_by not in ('asc', 'desc'):
        order_by = 'desc'
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_ALL_USERS.format(sort_by,order_by),
                (
                    age_min,
                    age_min,
                    age_max,
                    age_max,
                    popularity_min,
                    popularity_min,
                    popularity_max,
                    popularity_max,
                    city,
                    city,
                    tags,
                    tags,
                    exceptUsersIds,
                )
            )
            req = cur.fetchall()
            conn.commit()
            output = []
            for user in req:
                output.append({
                    "id": user[0],
                    "username": user[1],
                    "firstname": user[2],
                    "lastname": user[3],
                    "popularity": user[4],
                    "age": user[5],
                    "city": user[6],
                })
            return output
    except Exception as e:
        conn.rollback()
        print(e)
        raise


def delete_password_request(request_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.new_password_request.DELETE_PASSWORD_REQUEST,
                (
                    request_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_password_request(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.new_password_request.GET_PASSWORD_REQUEST,
                (
                    user_id,
                )
            )
            req = cur.fetchone()
            conn.commit()
            if req is None:
                return None
            return {
                "id": req[0],
                "password": req[1],
                "confirm_code": req[2],
            }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def update_user_password(user_id, hashed_password):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.UPDATE_USER_PASSWORD,
                (
                    hashed_password,
                    user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def check_confirm_password_request(username, confirm_code):
    user = get_user_by_username(username)
    request = get_password_request(user['id'])
    if not request:
        print("request not existing")
        return False
    if request['confirm_code'] != confirm_code:
        print("wrong confirm code")
        return False
    update_user_password(user['id'], request['password'])
    delete_password_request(request['id'])
    return True

def request_new_password(username, password):
    user = get_user_by_username(username)
    if not user:
        return False
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.new_password_request.CREATE_PASSWORD_REQUEST,
                (
                    user['id'],
                    hashed_password,
                )
            )
            req = cur.fetchone()
            conn.commit()
            utils.email.send_password_update_request_email(
                dest={
                    "email": user['email'],
                    "name": user['firstname'],
                },
                confirmation_code=req[0]
            )
        return True
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def delete_confirmation_code(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.DELETE_CONFIRMATION_CODE,
                (
                    user_id,
                )
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def is_confirmation_code_successful(username, confirmation_code):
    user = get_user_by_username(username)
    if user['confirm_code'] == confirmation_code:
        delete_confirmation_code(user['id'])
        return user
    return False

def create_user(data):
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.CREATE_USER,
                (
                    data['email'],
                    data['firstname'],
                    data['lastname'],
                    data['username'],
                    hashed_password,
                    str(uuid.uuid4())
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
            "token": new_user[5],
            "confirm_code": new_user[6],
        }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_user_password(username):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_USER_PASSWORD,
                (
                    username,
                )
            )
            user = cur.fetchone()
            conn.commit()
        if user is None:
            return False
        return user[0]
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def check_user_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_username(username):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_USER_BY_USERNAME,
                (
                    username,
                )
            )
            user = cur.fetchone()
            conn.commit()
        if user is None:
            return False
        return {
            "id": user[0],
            "email": user[1],
            "firstname": user[2],
            "lastname": user[3],
            "username": user[4],
            "token": user[5],
            "confirm_code": user[6],
        }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def get_user_by_id(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_USER_BY_ID,
                (
                    user_id,
                )
            )
            user = cur.fetchone()
            conn.commit()
        if user is None:
            return False
        return {
            "id": user[0],
            "firstname": user[1],
            "lastname": user[2],
            "username": user[3],
            "popularity": user[4],
            "city": user[5],
            "age": user[6],
            "last_login": user[7],
        }
    except Exception as e:
        conn.rollback()
        print(e)
        raise


def get_user_by_email(email):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.GET_USER_BY_EMAIL,
                (
                    email,
                )
            )
            user = cur.fetchone()
            conn.commit()
        if user is None:
            return False
        return {
            "id": user[0],
            "email": user[1],
            "firstname": user[2],
            "lastname": user[3],
            "username": user[4],
            "token": user[5],
        }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def disconnect_user(user_id):
    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.users.DISCONNECT_USER,
                (
                    user_id,
                )
            )
            updated_rows = cur.rowcount
            conn.commit()
        return updated_rows > 0
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def connect_user(data):
    hashed_password = get_user_password(data['username'])
    if not hashed_password:
        print("User does not exist")
    if not check_user_password(data['password'], hashed_password):
        print("Wrong password")
        return False
    user = get_user_by_username(data['username'])
    if user['confirm_code']:
        print("Email is not confirmed")
        return False
    return user

def get_user_by_token(token):
    try:
        with conn.cursor() as cur:
            user = cur.execute(
                sql.users.GET_USER_BY_TOKEN,
                (
                    token,
                )
            )
            found_user = cur.fetchone()
            conn.commit()
            if not found_user:
                print("user not found")
                raise Exception("User not found")
            return {
                "id": found_user[0],
                "email": found_user[1],
                "firstname": found_user[2],
                "lastname": found_user[3],
                "username": found_user[4],
                "token": found_user[5],
                "bio": found_user[6],
                "gender": found_user[7],
                "preference": found_user[8],
                "popularity": found_user[9],
                "city": found_user[10],
                "age": found_user[11],
            }
    except Exception as e:
        conn.rollback()
        print(e)
        raise

def patch_user(data, actual_user):
    try:
        with conn.cursor() as cur:
            user = cur.execute(
                sql.users.PATCH_USER,
                (
                    data['email'] if 'email' in data else actual_user['email'],
                    data['firstname'] if 'firstname' in data else actual_user['firstname'],
                    data['lastname'] if 'lastname' in data else actual_user['lastname'],
                    data['bio'] if 'bio' in data else None,
                    data['gender'] if 'gender' in data else None,
                    data['preference'] if 'preference' in data else None,
                    data['username'] if 'username' in data else actual_user['username'],
                    data['city'] if 'city' in data else actual_user['city'],
                    int(data['age']) if 'age' in data else actual_user.get('age'),
                    actual_user['id']
                )
            )
            updated_user = cur.fetchone()
            conn.commit()
            return {
                "id": updated_user[0],
                "email": updated_user[1],
                "firstname": updated_user[2],
                "lastname": updated_user[3],
                "bio": updated_user[4],
                "gender": updated_user[5],
                "preference": updated_user[6],
                "username": updated_user[7],
                "popularity": updated_user[8],
                "city": updated_user[9],
                "age": updated_user[10],
            }
    except Exception as e:
        conn.rollback()
        print(e)
        raise
