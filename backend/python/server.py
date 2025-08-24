import grpc
from concurrent import futures
import time
import os
from dotenv import load_dotenv
import ai_generation_pb2
import ai_generation_pb2_grpc

# Load environment variables from .env file
load_dotenv()

class AiGenerationService(ai_generation_pb2_grpc.AiGenerationServiceServicer):
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
                        word_count_analyzed=content_entry.word_count_analyzed,
                        questions=mock_questions,
                    )
                )
                yield result_message
                time.sleep(1)
                yield result_message
                time.sleep(1)
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

    def GenerateTopics(self, request, context):
        """Generate topics based on content and existing topics"""
        print(f"Received topic generation request for page: {request.page_title}")
        print(f"Content length: {len(request.content)} characters")
        print(f"Existing topics: {list(request.existing_topics)}")
        
        try:
            # Simulate processing time
            time.sleep(1)
            
            # Generate mock topics based on the content and page title
            generated_topics = self._generate_mock_topics(request)
            
            # Create response
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

    def _generate_mock_topics(self, request):
        """Generate mock topics based on content, page title, and existing topics"""
        # Extract some keywords from page title for topic generation
        page_words = request.page_title.lower().split()
        
        # Base topics that could be generated from any content
        base_topics = [
            "Introduction",
            "Overview", 
            "Key Concepts",
            "Best Practices",
            "Implementation",
            "Examples",
            "Advanced Topics",
            "Troubleshooting",
            "Summary",
            "Next Steps"
        ]
        
        # Generate topics based on page title keywords
        page_specific_topics = []
        for word in page_words:
            if len(word) > 3:  # Only use meaningful words
                page_specific_topics.extend([
                    f"{word.capitalize()} Fundamentals",
                    f"{word.capitalize()} Applications",
                    f"Understanding {word.capitalize()}"
                ])
        
        # Combine all potential topics
        all_potential_topics = base_topics + page_specific_topics
        
        # Filter out topics that are too similar to existing ones
        existing_topics_lower = [topic.lower() for topic in request.existing_topics]
        new_topics = []
        
        for topic in all_potential_topics:
            # Check if this topic is similar to existing ones
            is_similar = False
            for existing in existing_topics_lower:
                if (topic.lower() in existing or existing in topic.lower() or 
                    any(word in existing.split() for word in topic.lower().split() if len(word) > 3)):
                    is_similar = True
                    break
            
            if not is_similar and topic not in new_topics:
                new_topics.append(topic)
                
            # Limit to 5-8 new topics
            if len(new_topics) >= 6:
                break
        
        # If we don't have enough new topics, add some generic ones
        if len(new_topics) < 3:
            fallback_topics = ["Core Principles", "Practical Guide", "Deep Dive"]
            for topic in fallback_topics:
                if topic not in new_topics:
                    new_topics.append(topic)
                if len(new_topics) >= 5:
                    break
        
        return new_topics[:6]  # Return at most 6 topics

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
