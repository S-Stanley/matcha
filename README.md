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

Launch the API in dev mode

```python
flask --app services/api/main.py run
```
