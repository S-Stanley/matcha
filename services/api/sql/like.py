CREATE_LIKE = '''
    INSERT INTO "Like" (
        liked_by,
        liked_user
        ) VALUES (
            %s,
            %s
        )
    RETURNING id, liked_by, liked_user
'''

GET_LIKE_LIST = '''
    SELECT (
        id,
        liked_by
    )
    FROM "Like"
    WHERE liked_user = %s
'''
