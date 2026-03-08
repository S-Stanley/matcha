CREATE_PASSWORD_REQUEST='''
    INSERT INTO "NewPasswordRequest" (user_id, password) VALUES (%s, %s) RETURNING confirm_code;
'''

GET_PASSWORD_REQUEST='''
    SELECT id, password, confirm_code FROM "NewPasswordRequest" WHERE user_id=%s ORDER BY created_at DESC LIMIT 1;
'''

DELETE_PASSWORD_REQUEST='''
    DELETE FROM "NewPasswordRequest" WHERE id=%s;
'''
