import grpc
import books_pb2
import books_pb2_grpc

def run():
    # Create a gRPC channel
    with grpc.insecure_channel('localhost:50051') as channel:
        # Create a stub (client)
        stub = books_pb2_grpc.BookServiceStub(channel)
        
        # Make the request
        request = books_pb2.GetBooksRequest()
        response = stub.GetBooks(request)
        
        # Print the response
        print("Books received:")
        for book in response.books:
            print(f"ID: {book.id}, Title: {book.title}, Author: {book.author}")

if __name__ == '__main__':
    run()