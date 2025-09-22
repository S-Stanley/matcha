def check_new_user_input_len(data):
    print(len(data['lastname']))
    if len(data['email']) > 50:
        return False
    if len(data['username']) > 50:
        return False
    if len(data['firstname']) > 50:
        return False
    if len(data['lastname']) > 50:
        return False
    return True
