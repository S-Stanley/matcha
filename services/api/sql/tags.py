ADD_TAG = '''
    INSERT INTO "Tags" (user_id, tag) VALUES (%s, %s) RETURNING id;
'''

DELETE_TAG = '''
    DELETE FROM "Tags" WHERE user_id=%s AND tag=%s;
'''

CHECK_IF_TAG_EXIST_FOR_USER = '''
    SELECT id FROM "Tags" WHERE user_id=%s AND tag=%s;
'''
