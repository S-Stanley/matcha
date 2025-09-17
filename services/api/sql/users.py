CREATE_USER = '''
    INSERT INTO "User" (
            email,
            firstname,
            lastname,
            username,
            password
        ) VALUES (
            %s,
            %s,
            %s,
            %s,
            %s
        )
    RETURNING id, email, firstname, lastname, username
'''
