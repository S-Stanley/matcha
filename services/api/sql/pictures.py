CREATE_PICTURE = '''
    INSERT INTO "Picture" (user_id, url)
    VALUES (%s, %s)
    RETURNING id, user_id, url, created_at;
'''

COUNT_PICTURES_BY_USER_ID = '''
    SELECT COUNT(*) FROM "Picture" WHERE user_id=%s;
'''

GET_PICTURES_BY_USER_ID = '''
    SELECT id, user_id, url, created_at
    FROM "Picture"
    WHERE user_id=%s
    ORDER BY created_at ASC;
'''

DELETE_PICTURE_BY_ID_AND_USER_ID = '''
    DELETE FROM "Picture"
    WHERE id=%s AND user_id=%s;
'''

