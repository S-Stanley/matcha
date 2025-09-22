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
    }

def get_user_password(email):
    with conn.cursor() as cur:
        user = cur.execute(
            sql.users.GET_USER_PASSWORD,
            (
                email,
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


def connect_user(data):
    hashed_password = get_user_password(data['email'])
    if not hashed_password:
        print("User does not exist")
    if not check_user_password(data['password'], hashed_password):
        print("Wrong password")
        return False
    return get_user_by_email(data['email'])

