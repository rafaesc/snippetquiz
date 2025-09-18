import json
import time
import os
import queue
import threading
from groq_client import GroqClient
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from openrouter_client import OpenRouterClient
from core_api import CoreApiClient

class KafkaTopicConsumer:
    def __init__(self):
        self.consumer = None
        self.producer = None
        self.running = False
        self.core_api = CoreApiClient()
        
        # Lightweight poller components
        self.message_queue = queue.Queue(maxsize=100)  # Bounded queue for backpressure
        self.poller_thread = None
        self.worker_thread = None
        self.poll_running = False
        self.worker_running = False

    def _initialize_producer(self, kafka_brokers):
        """Initialize Kafka producer for sending messages"""
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=kafka_brokers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                retries=3,
                retry_backoff_ms=1000,
                acks=-1  # Wait for all replicas to acknowledge
            )
            print(f"✅ Kafka producer initialized for {kafka_brokers}")
        except Exception as e:
            print(f"❌ Failed to initialize Kafka producer: {e}")
            self.producer = None

    def _send_save_event_to_kafka(self, user_id, content_id, generated_topics):
        """Send SAVE event with generated topics to 'content-entry-events' Kafka topic"""
        if not self.producer:
            print("❌ Kafka producer not available, cannot send SAVE event")
            return

        try:
            # Create SAVE event payload matching ContentEntryEventDto structure
            save_event = {
                "userId": user_id,
                "contentId": int(content_id),
                "action": "SAVE",
                "topics": generated_topics
            }
            
            # Send message to 'content-entry-events' topic with key
            key = f"content-entry-{content_id}"
            future = self.producer.send(
                'content-entry-events', 
                key=key,
                value=save_event
            )
            
            # Wait for the message to be sent (with timeout)
            record_metadata = future.get(timeout=10)
            
            print(f"✅ Successfully sent SAVE event to Kafka topic 'content-entry-events'")
            print(f"   Topic: {record_metadata.topic}, Partition: {record_metadata.partition}, Offset: {record_metadata.offset}")
            print(f"   Content ID: {content_id}")
            
        except Exception as e:
            print(f"❌ Failed to send SAVE event to Kafka: {e}")

    def _lightweight_poller(self):
        """Dedicated thread for polling messages and maintaining heartbeats"""
        print("🔄 Starting lightweight poller thread")
        
        while self.poll_running:
            try:
                # Poll with short timeout to maintain heartbeats
                message_batch = self.consumer.poll(timeout_ms=1000, max_records=10)
                
                if message_batch:
                    for topic_partition, messages in message_batch.items():
                        for message in messages:
                            try:
                                # Try to put message in queue with timeout
                                self.message_queue.put(message, timeout=5)
                                print(f"📨 Queued message from {message.topic} (queue size: {self.message_queue.qsize()})")
                            except queue.Full:
                                print(f"⚠️ Message queue full, applying backpressure. Dropping message from {message.topic}")
                                # Could implement more sophisticated backpressure here
                                break
                
                # Commit offsets for processed messages
                try:
                    self.consumer.commit_async()
                except Exception as commit_error:
                    print(f"⚠️ Async commit failed: {commit_error}")
                    
            except Exception as e:
                if self.poll_running:  # Only log if we're supposed to be running
                    print(f"❌ Error in poller thread: {e}")
                time.sleep(1)  # Brief pause before retrying
        
        print("🛑 Lightweight poller thread stopped")

    def _message_worker(self):
        """Dedicated thread for processing messages from the queue"""
        print("🔧 Starting message worker thread")
        
        while self.worker_running:
            try:
                # Get message from queue with timeout
                message = self.message_queue.get(timeout=1)
                
                try:
                    # Process the message based on topic
                    if message.topic == "content-entry-events":
                        # Only process GENERATE actions for content-entry-events
                        message_data = message.value
                        action = message_data.get('action')
                        
                        if action == 'GENERATE':
                            self.handle_generate_topics_message(message_data)
                    
                    elif message.topic == "create-quiz":
                        # Handle create-quiz events
                        self.handle_create_quiz_message(message.value)
                    
                    print(f"✅ Processed message from {message.topic} (queue size: {self.message_queue.qsize()})")
                    
                except Exception as processing_error:
                    print(f"❌ Error processing message from {message.topic}: {processing_error}")
                
                finally:
                    # Mark task as done
                    self.message_queue.task_done()
                    
            except queue.Empty:
                # No messages to process, continue polling
                continue
            except Exception as e:
                if self.worker_running:  # Only log if we're supposed to be running
                    print(f"❌ Error in worker thread: {e}")
        
        print("🛑 Message worker thread stopped")

    def start_consumer(self):
        """Start the Kafka consumer with lightweight poller pattern"""
        # Get Kafka configuration from environment variables
        kafka_host = os.getenv("KAFKA_HOST", "localhost")
        kafka_port = os.getenv("KAFKA_PORT", "9092")
        kafka_brokers = f"{kafka_host}:{kafka_port}"
        
        retry_delay = 5  # initial wait in seconds
        max_delay = 60   # cap the wait time

        while not self.running:
            try:
                print(f"Connecting to Kafka at {kafka_brokers} ...")

                self.consumer = KafkaConsumer(
                    "content-entry-events",
                    "create-quiz",
                    bootstrap_servers=kafka_brokers,
                    group_id="python-consumer-group",
                    auto_offset_reset="latest",
                    enable_auto_commit=False,  # Manual commit for better control
                    max_poll_interval_ms=300000,  # 5 minutes
                    session_timeout_ms=30000,    # 30 seconds
                    heartbeat_interval_ms=10000, # 10 seconds
                    max_poll_records=10,         # Smaller batches
                    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                    key_deserializer=lambda k: k.decode('utf-8') if k else None
                )
                
                # Initialize producer after successful consumer connection
                self._initialize_producer(kafka_brokers)

                self.running = True
                self.poll_running = True
                self.worker_running = True
                
                print(f"✅ Kafka consumer started with lightweight poller pattern on {kafka_brokers}")
                
                # Start the poller and worker threads
                self.poller_thread = threading.Thread(target=self._lightweight_poller, daemon=True)
                self.worker_thread = threading.Thread(target=self._message_worker, daemon=True)
                
                self.poller_thread.start()
                self.worker_thread.start()
                
                print("🚀 Lightweight poller and worker threads started")
                
                # Keep main thread alive
                try:
                    while self.running:
                        time.sleep(1)
                        
                        # Monitor thread health
                        if not self.poller_thread.is_alive():
                            print("⚠️ Poller thread died, restarting...")
                            self.poller_thread = threading.Thread(target=self._lightweight_poller, daemon=True)
                            self.poller_thread.start()
                        
                        if not self.worker_thread.is_alive():
                            print("⚠️ Worker thread died, restarting...")
                            self.worker_thread = threading.Thread(target=self._message_worker, daemon=True)
                            self.worker_thread.start()
                            
                except KeyboardInterrupt:
                    print("\n🛑 Received interrupt signal, shutting down...")
                    self.stop_consumer()
                    break

            except NoBrokersAvailable:
                print(f"❌ Kafka brokers not available, retrying in {retry_delay}s ...")
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_delay)  # exponential backoff
            except Exception as e:
                print(f"⚠️ Unexpected error in Kafka consumer: {e}, retrying in {retry_delay}s ...")
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_delay)

    def handle_generate_topics_message(self, message_data):
        """Handle incoming GENERATE events from content-entry-events topic"""
        print(f"Received GENERATE event")

        try:
            # Extract data from the ContentEntryEventDto structure
            user_id = message_data.get("userId", "")
            content_id = message_data.get("contentId", "")
            content = message_data.get("content", "")
            page_title = message_data.get("pageTitle", "")
            existing_topics_str = message_data.get("existingTopics", "")
            
            # Parse existing topics from comma-separated string
            existing_topics = [topic.strip() for topic in existing_topics_str.split(',') if topic.strip()] if existing_topics_str else []

            print(f"Processing topic generation for page: {page_title}")

            # Use OpenRouterClient to generate topics
            client = OpenRouterClient()
            generated_topics = client.generate_topics(
                content=content, page_title=page_title, existing_topics=existing_topics
            )

            # Send the SAVE event with generated topics back to the same topic
            self._send_save_event_to_kafka(user_id, content_id, generated_topics)

        except Exception as e:
            print(f"Error generating topics: {e}")

    def handle_create_quiz_message(self, message_data):
        """Handle incoming events from create-quiz topic"""        
        try:
            # Extract data from CreateQuizGenerationEventPayload structure
            user_id = message_data.get("userId", "")
            quiz_id = message_data.get("quizId", "")
            instructions = message_data.get("instructions", "")
            content_entries = message_data.get("contentEntries", [])
            total_content_entries_skipped = message_data.get("totalContentEntriesSkipped", 0)
            bank_id = message_data.get("bankId", "")
            
            print(f"📋 Received CREATE QUIZ event Quiz ID: {quiz_id}, User ID: {user_id}, Bank ID: {bank_id}, Content Entries Count: {len(content_entries)}")

            # Check quiz status for idempotency
            quiz_response = self.core_api.get_quiz(quiz_id, user_id)
            if quiz_response:
                quiz_status = quiz_response.get("status")
                print(f"📊 Quiz {quiz_id} current status: {quiz_status}")
                
                # If status is not PREPARE, skip processing (idempotency)
                if quiz_status != "PREPARE":
                    print(f"⏭️ Quiz {quiz_id} status is {quiz_status}, skipping processing (already completed or in progress)")
                    # Commit the message to mark it as processed
                    if hasattr(self, 'consumer') and self.consumer:
                        try:
                            self.consumer.commit()
                            print(f"✅ Message committed for quiz {quiz_id} (idempotency)")
                        except Exception as commit_error:
                            print(f"⚠️ Commit failed for idempotency check: {commit_error}")
                    return
            else:
                print(f"⚠️ Could not fetch quiz status for {quiz_id}, proceeding with processing")

            # Calculate total chunks based on content entries
            # Get configurable chunk size from environment variable, default to 2500
            chunk_size = int(os.getenv("CONTENT_CHUNK_SIZE", "2500"))
            total_chunks = 0
            current_chunk_index = 0
            total_questions_generated = 0
            
            # First pass: Calculate total chunks
            for entry in content_entries:
                content = entry.get("content", "")
                if content:
                    chunks = (len(content) + chunk_size - 1) // chunk_size
                    total_chunks += chunks
            
            print(f"📊 Total chunks to process: {total_chunks} (chunk size: {chunk_size}) Quiz ID: {quiz_id}, User ID: {user_id}, Bank ID: {bank_id}")
            
            # Check if content_entries is empty and send event if so
            if not content_entries:
                print(f"📭 No content entries to process for Quiz ID: {quiz_id}")
                quiz_generation_payload = {
                    "quizId": quiz_id,
                    "bankId": str(bank_id),
                    "userId": user_id,
                    "totalContentEntries": len(content_entries),
                    "totalContentEntriesSkipped": total_content_entries_skipped,
                    "currentContentEntryIndex": 0,
                    "questionsGeneratedSoFar": 0,
                    "totalChunks": 0,
                    "currentChunkIndex": 0,
                }
                
                # Send quiz generation event to Kafka
                time.sleep(5)
                self._send_quiz_generation_event_to_kafka(quiz_generation_payload)
                print(f"📤 Sent empty content entries event for Quiz ID: {quiz_id}")
                return
            
            # Second pass: Process each content entry and each chunk
            for entry_index, entry in enumerate(content_entries):
                entry_id = entry.get("id", "N/A")
                page_title = entry.get("pageTitle", "")
                content = entry.get("content", "")
                
                if content:
                    # Calculate number of chunks for this entry
                    entry_chunks = (len(content) + chunk_size - 1) // chunk_size
                    print(f"  📄 Entry {entry_index + 1} (ID: {entry_id}): '{page_title}' - {len(content)} chars -> {entry_chunks} chunks")
                    
                    # Process each chunk of this content entry
                    for chunk_index in range(entry_chunks):
                        start_pos = chunk_index * chunk_size
                        end_pos = min(start_pos + chunk_size, len(content))
                        chunk_content = content[start_pos:end_pos]
                        
                        # Initialize summaries list for this content entry (reset for each entry)
                        if chunk_index == 0:
                            summaries = []
                        
                        # Generate questions using AI instead of mock questions
                        try:
                            client = OpenRouterClient()
                            result = client.generate_quiz_questions(
                                instructions=instructions,
                                summaries=summaries,
                                page_title=page_title,
                                content=chunk_content,
                            )
                            
                            # Convert AI response to the expected format
                            chunk_questions = []
                            for q_data in result.get("questions", []):
                                # Create options from AI response
                                options = []
                                for opt_data in q_data.get("options", []):
                                    option = {
                                        "optionText": opt_data.get("text", ""),
                                        "optionExplanation": opt_data.get("explanation", ""),
                                        "isCorrect": opt_data.get("correct", False),
                                    }
                                    options.append(option)
                                
                                # Create the question
                                question = {
                                    "question": q_data.get("question", ""),
                                    "options": options
                                }
                                chunk_questions.append(question)
                            
                            # Add summary to summaries list for next chunks
                            if result.get("summary"):
                                summaries = []
                                summaries.append(result["summary"])
                            
                            print(f"Generated {len(chunk_questions)} questions from chunk {chunk_index + 1}")
                            
                        except Exception as e:
                            print(f"Error generating questions for chunk {chunk_index + 1}: {e}")
                            # Fallback to empty questions list if AI generation fails
                            chunk_questions = []
                        
                        # Create content entry for this chunk
                        chunk_content_entry = {
                            "id": entry_id,
                            "pageTitle": page_title,
                            "wordCountAnalyzed": len(chunk_content.split()),
                            "questions": chunk_questions
                        }
                        
                        # Increment total questions generated by 3 for each chunk
                        total_questions_generated += 3
                        
                        # Create QuizGenerationEventPayload
                        quiz_generation_payload = {
                            "quizId": quiz_id,
                            "bankId": str(bank_id),
                            "userId": user_id,
                            "totalContentEntries": len(content_entries),
                            "totalContentEntriesSkipped": total_content_entries_skipped,
                            "currentContentEntryIndex": entry_index,
                            "questionsGeneratedSoFar": total_questions_generated,
                            "contentEntry": chunk_content_entry,
                            "totalChunks": total_chunks,
                            "currentChunkIndex": current_chunk_index,
                        }
                        
                        # Send quiz generation event to Kafka
                        self._send_quiz_generation_event_to_kafka(quiz_generation_payload)
                        
                        # Increment the global chunk index
                        current_chunk_index += 1
                        print(f"📈 Total questions generated so far: {total_questions_generated}")
                        time.sleep(20)  # 20 second delay between chunks
                else:
                    print(f"📄 Entry {entry_index + 1} (ID: {entry_id}): '{page_title}' - No content")
            print(f"🎯 Final total questions generated: {total_questions_generated}")
            
        except Exception as e:
            print(f"❌ Error processing CREATE QUIZ event: {e}")

    def _send_quiz_generation_event_to_kafka(self, payload):
        """Send quiz generation event to 'quiz-generation' Kafka topic"""
        if not self.producer:
            print("❌ Kafka producer not available, cannot send quiz generation event")
            return

        try:
            # Use user-{userId} as key since only one quiz can be in progress per user
            key = f"user-{payload['userId']}"
            future = self.producer.send(
                'quiz-generation', 
                key=key,
                value=payload
            )
            
            # Wait for the message to be sent (with timeout)
            record_metadata = future.get(timeout=10)
    
            print(f"✅ Successfully Topic: {record_metadata.topic}, Partition: {record_metadata.partition}, Offset: {record_metadata.offset}")
            print(f"✅ Successfully sent quiz generation, Key: {key}, Quiz ID: {payload['quizId']}, Chunk: {payload['currentChunkIndex'] + 1}/{payload['totalChunks']}")
            
        except Exception as e:
            print(f"❌ Failed to send quiz generation event to Kafka: {e}")

    def stop_consumer(self):
        """Stop the Kafka consumer and all threads"""
        print("🛑 Stopping Kafka consumer...")
        
        # Stop threads
        self.running = False
        self.poll_running = False
        self.worker_running = False
        
        # Wait for threads to finish
        if self.poller_thread and self.poller_thread.is_alive():
            self.poller_thread.join(timeout=5)
            print("🛑 Poller thread stopped")
            
        if self.worker_thread and self.worker_thread.is_alive():
            # Process remaining messages in queue
            try:
                while not self.message_queue.empty():
                    self.message_queue.get_nowait()
                    self.message_queue.task_done()
            except queue.Empty:
                pass
            
            self.worker_thread.join(timeout=5)
            print("🛑 Worker thread stopped")
        
        # Close Kafka connections
        if self.consumer:
            self.consumer.close()
            print("🛑 Kafka consumer stopped")
        if self.producer:
            self.producer.close()
            print("🛑 Kafka producer stopped")
