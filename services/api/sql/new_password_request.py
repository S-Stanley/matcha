CREATE_PASSWORD_REQUEST='''
    INSERT INTO "NewPasswordRequest" (user_id, password) VALUES (%s, %s) RETURNING confirm_code;
'''
