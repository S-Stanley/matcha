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
    WHERE email=%s
'''
