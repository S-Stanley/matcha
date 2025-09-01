# Matcha

## Setup

Create virtual env

```python
python3 -m venv .venv
```

Activate virtual env

```python
. .venv/bin/activate
```

Install dependencies

```python
pip3 install -r requirements.txt
```

## Run project

If not yet, activate virtual env

```python
. .venv/bin/activate
```

Setup postgres container:
```bash
docker-compose up --build -d database
```

Init or re-create database schema from scratch
```bash
./scripts/reset-local-db.sh
```

Launch the API in dev mode

```python
flask --app services/api/main.py run
```
