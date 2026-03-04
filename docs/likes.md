# Like

## Create like

```bash
curl -X POST http://127.0.0.1:5000/likes -H token:5f737066-f767-4235-bbde-8765a7edff18 -d liked_user="8d622fc8-a8cf-46d8-b705-aa095aa68dc6"
```

Args:
* liked_user: the user being liked

We will use the token to know which user liked the profile


## Get user likes

```bash
curl -X GET http://127.0.0.1:5000/likes -H token:5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2
```

We will use the token to know which user request this like list
