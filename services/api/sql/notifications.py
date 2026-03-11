CREATE_NOTIFICATION = '''
    INSERT INTO "Notifications" (user_id, type, from_user_id) VALUES (%s, %s, %s) RETURNING id;
'''

GET_ALL_NOTIFICATIONS_BY_USER_ID = '''
    SELECT id, type, from_user_id, created_at
    FROM "Notifications"
    WHERE user_id = %s AND status = 'UNREAD';
'''

UPDATE_USER_SET_ALL_NOTIFICATIONS_AS_READ_BY_USER_ID = '''
    UPDATE "Notifications" SET status = 'READ' WHERE user_id=%s;
'''
