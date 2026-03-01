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
