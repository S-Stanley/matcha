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
    RETURNING id, email, firstname, lastname, username, token
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
        username
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
        token
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
        token
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
    SET token=NULL
    WHERE id=%s
'''

PATCH_USER = '''
    UPDATE "User"
    SET email=%s
    WHERE id=%s
    RETURNING id, email
'''
