CREATE_MESSAGE = '''
    INSERT INTO "Messages" (
        user_id,
        match_id,
        content
    ) VALUES (
        %s,
        %s,
        %s
    ) RETURNING id, user_id, match_id, content, created_at;
''';


GET_ALL_MATCH_MESSAGES = '''
    SELECT id, user_id, match_id, content, created_at FROM "Messages" where match_id = %s;
'''
