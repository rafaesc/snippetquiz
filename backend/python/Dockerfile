# Use Python 3.11 slim image for development
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY ./python/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory to access protos
COPY ./python .
COPY ./protos ./protos

# Generate gRPC Python files from protobuf definition
RUN python -m grpc_tools.protoc \
    --proto_path=./protos \
    --python_out=. \
    --grpc_python_out=. \
    ./protos/ai_generation.proto

# Add generated directory to Python path
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Expose the gRPC port
EXPOSE 50051

# Use exec form to ensure proper signal forwarding
CMD ["python", "-u", "server.py"]