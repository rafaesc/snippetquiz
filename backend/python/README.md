# Python gRPC AI Generation Service

A simple gRPC server implementation in Python that provides a quiz generation service.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Generate gRPC Python files from the protobuf definition:
```bash
python -m grpc_tools.protoc --proto_path=../protos --python_out=. --grpc_python_out=. ../protos/ai_generation.proto
```

This will generate:
- `ai_generation_pb2.py` - Contains the message classes
- `ai_generation_pb2_grpc.py` - Contains the service classes

## Running the Server

```bash
python server.py
```

## User Container

```bash
cd ./backend && docker build -f python/Dockerfile.dev -t snippetquiz-python . && docker run -p 50051:50051 snippetquiz-python
```

The server will start on port 50051.