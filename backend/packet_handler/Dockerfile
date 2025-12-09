FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install git+https://github.com/faucetsdn/ryu.git
# RUN which ryu-manager # This line is for debugging purposes

COPY controller_app ./controller_app

ENV PYTHONPATH=/app

CMD ["ryu-manager", "controller_app.controller"]