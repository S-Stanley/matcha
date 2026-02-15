# View

## Definiton

Views are profile views

## Create View

Create a new profile view, it will be stored as an user has checked another user profile

```bash
curl -X POST http://127.0.0.1:5000/views/ -H token:5f737066-f767-4235-bbde-8765a7edff18 -d  profileUserId=8d622fc8-a8cf-46d8-b705-aa095aa68dc6
```

Args:
* ProfileUserId: the user id of the profile being viewed

We will use the token to know which user has seen that profile


## Get all views

An user can see who's checked his profile, and only his profile.

```bash
curl http://127.0.0.1:5000/views/me -H token:5f737066-f767-4235-bbde-8765a7edff18
```

No args required
