# Python gRPC Quiz Generation Service

A simple gRPC server implementation in Python that provides a quiz generation service.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Generate gRPC Python files from the protobuf definition:
```bash
python -m grpc_tools.protoc --proto_path=../protos --python_out=. --grpc_python_out=. ../protos/quiz_generation.proto
```

This will generate:
- `quiz_generation_pb2.py` - Contains the message classes
- `quiz_generation_pb2_grpc.py` - Contains the service classes

## Running the Server

```bash
python server.py
```

The server will start on port 50051.

## Testing with the Client

In a separate terminal:

```bash
python client.py
```

## Project Structure