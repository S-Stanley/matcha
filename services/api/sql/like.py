DELETE_LIKE = '''
    DELETE FROM "Like" WHERE liked_user=%s AND liked_by=%s;
'''

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

CHECK_IS_USER_LIKED = '''
    SELECT id, liked_by, liked_user FROM "Like" WHERE liked_user=%s AND liked_by=%s;
'''

GET_LIKE_LIST = '''
    SELECT (
        id,
        liked_by
    )
    FROM "Like"
    WHERE liked_user = %s
'''

CHECK_IF_USER_IS_LIKING_BACK = '''
    SELECT id
    FROM "Like"
    WHERE liked_user=%s AND liked_by=%s
'''
