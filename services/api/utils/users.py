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

def getGenderFilter(user_gender, user_preference):
    if user_gender == 'MALE' and user_preference == 'FEMALE':
        return ['FEMALE']
    if user_gender == 'FEMALE' and user_preference == 'MALE':
        return ['MALE']
    return [
      'MALE',
      'FEMALE',
      'OTHERS',
      'DO NOT PRONONCE'
    ]
