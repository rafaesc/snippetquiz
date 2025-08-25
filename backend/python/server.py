import grpc
from concurrent import futures
import time
import os
from dotenv import load_dotenv
import ai_generation_pb2
import ai_generation_pb2_grpc
from groq_client import GroqClient

load_dotenv()

class AiGenerationService(ai_generation_pb2_grpc.AiGenerationServiceServicer):
    def GenerateQuiz(self, request, context):
        """Generate quiz questions for content entries with streaming progress using AI"""
        print(
            f"Received quiz generation request with {len(request.content_entries)} content entries"
        )
    
        try:
            client = GroqClient()
            
            for i, content_entry in enumerate(request.content_entries):
                # Check if client cancelled the request
                if not context.is_active():
                    print(f"Client disconnected, stopping at content entry {i}")
                    break
    
                # Send status message indicating we're processing this content entry
                status_message = ai_generation_pb2.QuizGenerationProgress(
                    status=ai_generation_pb2.GenerationStatus(
                        content_entry_id=content_entry.id,
                        page_title=content_entry.page_title,
                        word_count_analyzed=content_entry.word_count_analyzed,
                        status=f"Generating questions for page title: {content_entry.page_title}",
                    )
                )
                yield status_message
    
                print(f"Processing content entry {i+1}: {content_entry.page_title}")
    
                # Split content into chunks of 2500 characters
                content = content_entry.content or ""
                chunk_size = 2500
                chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]
                
                # Initialize summaries list for this content entry
                summaries = []
                
                # Default instructions (can be made configurable later)
                instructions = request.instructions
                
                print(f"Split content into {len(chunks)} chunks for processing")
                
                # Process each chunk
                for chunk_idx, chunk in enumerate(chunks):
                    if not context.is_active():
                        print(f"Client disconnected, stopping at chunk {chunk_idx}")
                        break
                    
                    print(f"Processing chunk {chunk_idx + 1}/{len(chunks)}")
                    
                    # Generate questions and summary for this chunk
                    try:
                        result = client.generate_quiz_questions(
                            instructions=instructions,
                            summaries=summaries,
                            page_title=content_entry.page_title,
                            content=chunk
                        )
                        
                        # Convert AI response to protobuf questions
                        chunk_questions = []
                        for q_data in result.get('questions', []):
                            # Create mock options from AI response
                            options = []
                            for opt_data in q_data.get('options', []):
                                option = ai_generation_pb2.QuestionOption(
                                    option_text=opt_data.get('text', ''),
                                    option_explanation=opt_data.get('explanation', ''),
                                    is_correct=opt_data.get('correct', False),
                                )
                                options.append(option)
                            
                            # Create the question
                            question = ai_generation_pb2.Question(
                                question=q_data.get('question', ''),
                                type="multiple_choice",
                                options=options,
                            )
                            chunk_questions.append(question)
                        
                        # Add summary to summaries list for next chunks
                        if result.get('summary'):
                            summaries.append(result['summary'])
                        
                        print(f"Generated {len(chunk_questions)} questions from chunk {chunk_idx + 1}")
                        
                        # Send result message for this chunk
                        result_message = ai_generation_pb2.QuizGenerationProgress(
                            result=ai_generation_pb2.GenerationResult(
                                content_entry_id=content_entry.id,
                                page_title=content_entry.page_title,
                                word_count_analyzed=content_entry.word_count_analyzed,
                                questions=chunk_questions,
                            )
                        )
                        yield result_message
                        
                    except Exception as e:
                        print(f"Error processing chunk {chunk_idx + 1}: {e}")
                        continue
                        
                    # Small delay between chunks
                    time.sleep(0.5)
    
                # Small delay before next content entry
                if i < len(request.content_entries) - 1:
                    time.sleep(0.5)
                    
            print("Finished generating quiz questions for all content entries")
    
            completed_message = ai_generation_pb2.QuizGenerationProgress(
                completed=True
            )
            yield completed_message
    
        except Exception as e:
            print(f"Error during quiz generation: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Quiz generation error: {str(e)}")

    def GenerateTopics(self, request, context):
        """Generate topics based on content and existing topics"""
        print(f"Received topic generation request for page: {request.page_title}")
        print(f"Content length: {len(request.content)} characters")
        print(f"Existing topics: {list(request.existing_topics)}")
        
        try:            
            client = GroqClient()

            generated_topics = client.generate_topics(
                content=request.content,
                page_title=request.page_title,
                existing_topics=list(request.existing_topics)
            )

            response = ai_generation_pb2.GenerateTopicsResponse(
                topics=generated_topics
            )
            
            print(f"Generated {len(generated_topics)} topics: {generated_topics}")
            return response
            
        except Exception as e:
            print(f"Error during topic generation: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Topic generation error: {str(e)}")
            return ai_generation_pb2.GenerateTopicsResponse(topics=[])

def serve():
    # Get port from environment variable, default to 50051
    port = os.getenv('AI_GENERATION_SERVICE_PORT', '50051')
    # Get host from environment variable, default to '[::]' (all interfaces)
    host = os.getenv('AI_GENERATION_SERVICE_HOST', '[::]')
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ai_generation_pb2_grpc.add_AiGenerationServiceServicer_to_server(
        AiGenerationService(), server
    )
    server.add_insecure_port(f"{host}:{port}")
    server.start()
    print(f"gRPC Server started. Listening on {host}:{port}...")
    try:
        while True:
            time.sleep(60*60*24)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == "__main__":
    serve()
