def check_new_user_input_len(data):
    if len(data['email']) > 50:
        return False
    if len(data['username']) > 50:
        return False
    if len(data['firstname']) > 50:
        return False
    if len(data['lastname']) > 50:
        return False
    return True

def check_password_not_commun(password):
    if password in ['dog', 'cat', 'hello']:
        return False
    return True
