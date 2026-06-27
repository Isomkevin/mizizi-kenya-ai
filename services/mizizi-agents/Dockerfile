FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY run.py .

ENV HOST=0.0.0.0
ENV PORT=8080
ENV MASUMI_MODE=demo

EXPOSE 8080

CMD ["python", "run.py"]
