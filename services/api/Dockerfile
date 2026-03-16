FROM python:3.14.2

WORKDIR app/

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .
CMD flask --app services/api/main.py --debug run
