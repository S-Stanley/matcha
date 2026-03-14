CREATE_LOGIN='''
    INSERT INTO "Login" (user_id) VALUES (%s);
'''

CREATE_REPORT = '''
    INSERT INTO "Report" (user_id, from_user_id) VALUES (%s, %s);
'''

CREATE_BLOCK = '''
    INSERT INTO "Block" (user_id, from_user_id) VALUES (%s, %s);
'''

IS_BLOCKED = '''
    SELECT id FROM "Block" WHERE user_id=%s AND from_user_id=%s;
'''

GET_ALL_USERS = '''
    SELECT id, username, firstname, lastname, popularity
    FROM "User"
    WHERE (%s IS NULL OR age >= %s)
      AND (%s IS NULL OR age <= %s)
      AND (%s IS NULL OR popularity >= %s)
      AND (%s IS NULL OR popularity <= %s)
    ORDER BY popularity DESC, age ASC NULLS LAST;
'''

DELETE_CONFIRMATION_CODE='''
    UPDATE "User" SET confirm_code=NULL WHERE id=%s;
'''

CREATE_USER = '''
    INSERT INTO "User" (
            email,
            firstname,
            lastname,
            username,
            password,
            token
        ) VALUES (
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
    RETURNING id, email, firstname, lastname, username, token, confirm_code;
'''

GET_USER_BY_EMAIL = '''
    SELECT
        id,
        email,
        firstname,
        lastname,
        username,
        token
    FROM "User"
    WHERE email=%s
'''

GET_USER_BY_ID = '''
    SELECT
        id,
        firstname,
        lastname,
        username,
        popularity,
        city,
        age,
        (SELECT created_at FROM "Login" WHERE user_id="User".id ORDER BY created_at DESC LIMIT 1) as last_login
    FROM "User"
    WHERE id=%s
'''

GET_USER_BY_TOKEN = '''
    SELECT
        id,
        email,
        firstname,
        lastname,
        username,
        token,
        bio,
        gender,
        preference,
        popularity,
        city,
        age
    FROM "User"
    WHERE token=%s
'''

GET_USER_BY_USERNAME = '''
    SELECT
        id,
        email,
        firstname,
        lastname,
        username,
        token,
        confirm_code
    FROM "User"
    WHERE username=%s
'''

GET_USER_PASSWORD = '''
    SELECT 
        password
    FROM "User"
    WHERE username=%s
'''

DISCONNECT_USER = '''
    UPDATE "User"
    SET token=gen_random_uuid()
    WHERE id=%s
'''

PATCH_USER = '''
    UPDATE "User"
    SET
        email=%s,
        firstname=%s,
        lastname=%s,
        bio=%s,
        gender=%s,
        preference=%s,
        username=%s,
        city=%s,
        age=%s
    WHERE id=%s
    RETURNING id, email, firstname, lastname, bio, gender, preference, username, popularity, city, age
'''

UPDATE_USER_PASSWORD='''
    UPDATE "User" SET password=%s WHERE id=%s;
'''
