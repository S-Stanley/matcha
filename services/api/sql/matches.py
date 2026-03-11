IS_USER_MEMBER_OF_MATCH = '''
    SELECT id FROM "MatchMember" WHERE match_id=%s and user_id=%s;
'''

CREATE_MATCH = '''
    INSERT INTO "Match" DEFAULT VALUES
    RETURNING id, created_at
'''

CREATE_MATCH_MEMBER = '''
    INSERT INTO "MatchMember" (
            match_id,
            user_id
        ) VALUES (
            %s,
            %s
        )
    RETURNING id, match_id, user_id, created_at
'''

GET_MATCH_BY_ID = '''
    SELECT id, created FROM "Match" WHERE id=%s 
'''

CHECK_IF_MATCH_ALREADY_EXIST = '''
    WITH all_user_match AS (
        SELECT "Match".id, "Match".created_at
        FROM "Match"
        LEFT JOIN "MatchMember" ON "Match".id = "MatchMember".match_id
        WHERE "MatchMember".user_id = %s
    )
    SELECT
        all_user_match.id,
        all_user_match.created_at
    FROM
        all_user_match
    LEFT JOIN "MatchMember" ON "MatchMember".match_id = all_user_match.id
    WHERE "MatchMember".user_id = %s
'''

DELETE_MATCH = '''
    DELETE FROM "Match" WHERE id=%s
'''

DELETE_MATCH_MEMBER = '''
    DELETE FROM "MatchMember" WHERE match_id=%s
'''

GET_ALL_MATCH_BY_USER_ID = '''
    WITH all_user_match AS (
        SELECT "Match".id, "Match".created_at
        FROM "Match"
        LEFT JOIN "MatchMember" ON "Match".id = "MatchMember".match_id
        WHERE "MatchMember".user_id = %s
    )
    SELECT
        all_user_match.id,
        "User".id,
        "User".username,
        "User".firstname,
        "User".lastname
    FROM
        all_user_match
    LEFT JOIN "MatchMember" ON "MatchMember".match_id = all_user_match.id
    LEFT JOIN "User" ON "MatchMember".user_id = "User".id
    WHERE "MatchMember".user_id != %s
''';
