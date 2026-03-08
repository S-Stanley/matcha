import psycopg2, os, sql, bcrypt, uuid

conn = psycopg2.connect(os.environ.get("DATABASE_URL"))

def create_user(data):
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    with conn.cursor() as cur:
        user = cur.execute(
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

def get_user_password(username):
    with conn.cursor() as cur:
        user = cur.execute(
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

def check_user_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_username(username):
    with conn.cursor() as cur:
        user = cur.execute(
            sql.users.GET_USER_BY_USERNAME,
            (
                username,
            )
        )
        user = cur.fetchone()
        conn.commit()
    print(user)
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

def get_user_by_id(user_id):
    with conn.cursor() as cur:
        user = cur.execute(
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
    }


def get_user_by_email(email):
    with conn.cursor() as cur:
        user = cur.execute(
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

def disconnect_user(user_id):
    with conn.cursor() as cur:
        user = cur.execute(
            sql.users.DISCONNECT_USER,
            (
                user_id,
            )
        )
        conn.commit()

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
            }
    except Exception as e:
        print(e)
        return False

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
                "username": updated_user[7]
            }
    except Exception as e:
        print(e)
        return False
