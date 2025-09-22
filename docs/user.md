# Users

## Create user

```bash
curl -X POST http://127.0.0.1:5000/users -d email=1 -d password=2 -d username=3 -d firstname=4 -d lastname=5
```

* Email, firstname, lastname, username and passowrd max 50 characters
* Email and username are unique
* Not common English keyword as password: cat, dog, etc..

## Login

```bash
curl -X POST http://127.0.0.1:5000/users/login -d username=3 -d password=2
```

## Logout

```bash
curl -X POST http://127.0.0.1:5000/users/logout -d id=xxxx
```
