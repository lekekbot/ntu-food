# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend /app/backend

# Ensure Python can import the app package
ENV PYTHONPATH=/app/backend

# Expose default port (Railway sets $PORT dynamically)
EXPOSE 8000

# Entrypoint to run migrations then start the server
COPY backend/entrypoint.sh /app/backend/entrypoint.sh
RUN chmod +x /app/backend/entrypoint.sh

CMD ["bash", "-lc", "/app/backend/entrypoint.sh"]