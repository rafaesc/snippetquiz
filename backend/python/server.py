import grpc
from concurrent import futures
import time
import os
from dotenv import load_dotenv
import ai_generation_pb2
import ai_generation_pb2_grpc

# Load environment variables from .env file
load_dotenv()

class QuizGenerationService(ai_generation_pb2_grpc.QuizGenerationServiceServicer):
    def GenerateQuiz(self, request, context):
        """Generate quiz questions for content entries with streaming progress"""
        print(
            f"Received quiz generation request with {len(request.content_entries)} content entries"
        )

        try:
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

                # Simulate processing time
                time.sleep(1)

                # Generate mock questions for this content entry
                mock_questions = self._generate_mock_questions(content_entry)

                # Send result message with generated questions
                result_message = ai_generation_pb2.QuizGenerationProgress(
                    result=ai_generation_pb2.GenerationResult(
                        content_entry_id=content_entry.id,
                        page_title=content_entry.page_title,
                        questions=mock_questions,
                    )
                )
                yield result_message

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

    def _generate_mock_questions(self, content_entry):
        """Generate mock questions based on content entry"""
        questions = []

        # Generate 2-3 mock questions per content entry
        for i in range(2):
            # Create mock options
            options = [
                ai_generation_pb2.QuestionOption(
                    option_text=f"Option A for {content_entry.page_title} Q{i+1}",
                    option_explanation=f"This is the correct answer because it relates to the main concept in {content_entry.page_title}",
                    is_correct=True,
                ),
                ai_generation_pb2.QuestionOption(
                    option_text=f"Option B for {content_entry.page_title} Q{i+1}",
                    option_explanation=f"This is incorrect because it doesn't align with the content from {content_entry.page_title}",
                    is_correct=False,
                ),
                ai_generation_pb2.QuestionOption(
                    option_text=f"Option C for {content_entry.page_title} Q{i+1}",
                    option_explanation=f"This is incorrect as it contradicts the information in {content_entry.page_title}",
                    is_correct=False,
                ),
                ai_generation_pb2.QuestionOption(
                    option_text=f"Option D for {content_entry.page_title} Q{i+1}",
                    option_explanation=f"This is incorrect and not supported by the content in {content_entry.page_title}",
                    is_correct=False,
                ),
            ]

            # Create the question
            question = ai_generation_pb2.Question(
                question=f"What is the main concept discussed in {content_entry.page_title}? (Question {i+1})",
                type="multiple_choice",
                options=options,
            )

            questions.append(question)

        return questions


def serve():
    # Get port from environment variable, default to 50051
    port = os.getenv('AI_GENERATION_SERVICE_PORT', '50051')
    # Get host from environment variable, default to '[::]' (all interfaces)
    host = os.getenv('AI_GENERATION_SERVICE_HOST', '[::]')
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    ai_generation_pb2_grpc.add_QuizGenerationServiceServicer_to_server(
        QuizGenerationService(), server
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
