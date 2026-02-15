CREATE_VIEW = '''
    INSERT INTO "View" (
            profile_user_id,
            viewer_user_id
        ) VALUES (
            %s,
            %s
        )
    RETURNING id
'''

GET_ALL_PROFILE_VIEW = '''
    WITH all_viewers AS (
        SELECT
            viewer_user_id as user_id
        FROM
            "View"
        WHERE
            profile_user_id=%s
    )
    SELECT
        "User".id,
        "User".email,
        "User".username,
        "User".lastname,
        "User".firstname
    FROM 
        all_viewers
    LEFT JOIN "User" ON "User".id = all_viewers.user_id
'''
