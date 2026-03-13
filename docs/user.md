# Users

## Create user

```bash
curl -X POST http://127.0.0.1:5000/users -d email=email@student.42.fr -d password=2 -d username=3 -d firstname=4 -d lastname=5
```

* Email, firstname, lastname, username and passowrd max 50 characters
* Email and username are unique
* Not common English keyword as password: cat, dog, etc..

Do not return token, email should be confirmed. An email with the confirmation code is sent to the email adress.

## Login

```bash
curl -X POST http://127.0.0.1:5000/users/login -d username=3 -d password=2
```

Cannot login if email is not confirmed

## Confirm email

```bash
curl -X POST http://127.0.0.1:5000/users/signup/confirm -d confirm_code="xxx" -d username=3
```

## Logout

```bash
curl -X POST http://127.0.0.1:5000/users/logout -d id=xxxx
```

## Update user

```bash
curl -X PATCH http://127.0.0.1:5000/users -d email=4 -d firstname=firstname -d lastname=lastname -d bio=bio -d gender=MALE -d preference=FEMALE -d username=username -d city=Paris -H token:5f737066-f767-4235-bbde-8765a7edff18
```

* Bio, gender and preference if not sent will be deleted, other field will just not update
* Preference enum values: MALE, FEMALE, BOTH
* Gender enum values: MALE, FEMALE, OTHERS, DO NOT PRONONCE

## Get user me

```bash
curl http://127.0.0.1:5000/users/me -H token:5f737066-f767-4235-bbde-8765a7edff18
```

## Get user by id
 
```
curl http://127.0.0.1:5000/users/8d622fc8-a8cf-46d8-b705-aa095aa68dc6 -H token:5f737066-f767-4235-bbde-8765a7edff18
```


## Request new password:

```bash
curl http://127.0.0.1:5000/users/password/change/request -d username=3 -d password=new-pass
```

## Confirm password change request

```bash
curl -X POST http://127.0.0.1:5000/users/password/change/confirm -d username=3 -d confirm_code=xxx
```

## Get user list/search

```bash
curl http://127.0.0.1:5000/users -H token:5f737066-f767-4235-bbde-8765a7edff18
```

## Get all users notifications

```bash
curl http://127.0.0.1:5000/users/me/notifications -H token:5f737066-f767-4235-bbde-8765a7edff18
```

* Only return unread notifications

## Set all users notifications as readed

```bash
curl -X PATCH http://127.0.0.1:5000/users/me/notifications -H token:5f737066-f767-4235-bbde-8765a7edff18
```

## Update profil picture

```bash
curl -X PATCH http://127.0.0.1:5000/users/picture -H token:5f737066-f767-4235-bbde-8765a7edff18 -F "file=@./assets/img.jpg"
```

## Add or delete tag

```bash
curl -X PATCH http://127.0.0.1:5000/users/tag/geek -H token:5f737066-f767-4235-bbde-8765a7edff18
```

If the tag does not exist for this user it will be created, if already exist for this user is will be deleted
