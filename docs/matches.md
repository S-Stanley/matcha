# Matches

## Get list of matches

```bash
curl http://127.0.0.1:5000/matches -H token:5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2
```

## Send message in a match conversation

Args (data)
* content

Args (query params)
* Match_id

Token will be used to know which user created the message

```bash
curl -X POST http://127.0.0.1:5000/matches/:match_id/message -H token:5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2 -d content="ok"
```

## Get all message of a match


Args (query params):
* Match_id

```bash
curl -X GET http://127.0.0.1:5000/matches/:match_id/message -H token:5fb9b8f1-8b36-445e-a6c0-a71b1a1efaa2
```
