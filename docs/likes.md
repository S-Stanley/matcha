# Like

## Create like

```bash
curl -X POST http://127.0.0.1:5000/likes -H token:5f737066-f767-4235-bbde-8765a7edff18 -d liked_user="8d622fc8-a8cf-46d8-b705-aa095aa68dc6"
```

Args:
* liked_user: the user being liked

We will use the token to know which user liked the profile

**MATCH**

If the user creating this new like, has aleady been liked by the user just liked, then a new match is created and returned.

With fixtures could be tested by sending a new like by another user after the first one:

```bash
curl -X POST http://127.0.0.1:5000/likes -H token:5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2 -d liked_user="f8dd18fe-35dc-4fc1-8b69-f7586686fc80"
```


## Get user likes

```bash
curl -X GET http://127.0.0.1:5000/likes -H token:5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2
```

We will use the token to know which user request this like list
