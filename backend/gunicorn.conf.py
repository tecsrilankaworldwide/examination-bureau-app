# Gunicorn configuration for high-concurrency exam platform
# Optimized for 1000+ concurrent users

import multiprocessing
import os

# Binding
bind = "0.0.0.0:8002"

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1  # Recommended formula
worker_class = "uvicorn.workers.UvicornWorker"

# Connections
worker_connections = 1000
max_requests = 1000  # Restart workers after this many requests
max_requests_jitter = 100  # Add randomness to max_requests

# Timeouts
timeout = 120  # Longer timeout for exam operations
keepalive = 5
graceful_timeout = 30

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"

# Process naming
proc_name = "grade5-exam-backend"

# Server mechanics
daemon = False
pidfile = None
user = None
group = None
tmp_upload_dir = None

# SSL (if needed later)
# keyfile = None
# certfile = None

print(f"Starting with {workers} workers for high concurrency")
