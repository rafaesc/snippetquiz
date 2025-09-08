import json
import time
import os
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from openrouter_client import OpenRouterClient


class KafkaTopicConsumer:
    def __init__(self):
        self.consumer = None
        self.producer = None
        self.running = False

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

    def start_consumer(self):
        """Start the Kafka consumer in a separate thread"""
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
                    "create-quiz",  # Added create-quiz topic
                    bootstrap_servers=kafka_brokers,
                    group_id="python-consumer-group",
                    auto_offset_reset="latest",
                    enable_auto_commit=True,
                    value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                    key_deserializer=lambda k: k.decode('utf-8') if k else None,
                )
                
                # Initialize producer after successful consumer connection
                self._initialize_producer(kafka_brokers)

                self.running = True
                print(f"✅ Kafka consumer started, listening to 'content-entry-events' and 'create-quiz' on {kafka_brokers}")

                # Start consuming
                for message in self.consumer:
                    if not self.running:
                        break
                    try:
                        # Route messages based on topic
                        if message.topic == "content-entry-events":
                            # Only process GENERATE actions for content-entry-events
                            message_data = message.value
                            action = message_data.get('action')
                            
                            if action == 'GENERATE':
                                self.handle_generate_topics_message(message_data)
                        
                        elif message.topic == "create-quiz":
                            # Handle create-quiz events
                            self.handle_create_quiz_message(message.value)
                            
                    except Exception as e:
                        print(f"Error processing Kafka message: {e}")

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
        print(f"🎯 Received CREATE QUIZ event")
        
        try:
            # Extract data from CreateQuizGenerationEventPayload structure
            user_id = message_data.get("userId", "")
            quiz_id = message_data.get("quizId", "")
            instructions = message_data.get("instructions", "")
            content_entries = message_data.get("contentEntries", [])
            entries_skipped = message_data.get("entriesSkipped", 0)
            total_content_entries_skipped = message_data.get("totalContentEntriesSkipped", 0)
            bank_id = message_data.get("bankId", "")
            
            print(f"📋 Quiz ID: {quiz_id}")
            print(f"👤 User ID: {user_id}")
            print(f"🏦 Bank ID: {bank_id}")
            print(f"📝 Instructions: {instructions[:100]}..." if len(instructions) > 100 else f"📝 Instructions: {instructions}")
            print(f"📚 Content Entries Count: {len(content_entries)}")
            print(f"⏭️ Entries Skipped: {entries_skipped}")
            if total_content_entries_skipped:
                print(f"📊 Total Content Entries Skipped: {total_content_entries_skipped}")
            
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
            
            print(f"📊 Total chunks to process: {total_chunks} (chunk size: {chunk_size})")
            
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
                        
                        print(f"    🔹 Chunk {current_chunk_index + 1}/{total_chunks} (Entry {entry_index + 1}, Local chunk {chunk_index + 1}/{entry_chunks})")
                        print(f"      Content: {chunk_content[:50]}..." if len(chunk_content) > 50 else f"      Content: {chunk_content}")
                        print(f"      Size: {len(chunk_content)} chars (pos {start_pos}-{end_pos})")
                        
                        
                        # Generate mock questions for this chunk
                        mock_questions = [
                            {
                                "question": f"What is the main topic discussed in this section about {page_title}?",
                                "options": [
                                    {"optionText": "Option A", "optionExplanation": "This is option A explanation", "isCorrect": True},
                                    {"optionText": "Option B", "optionExplanation": "This is option B explanation", "isCorrect": False},
                                    {"optionText": "Option C", "optionExplanation": "This is option C explanation", "isCorrect": False},
                                    {"optionText": "Option D", "optionExplanation": "This is option D explanation", "isCorrect": False}
                                ]
                            },
                            {
                                "question": f"Which concept is most relevant to the content in {page_title}?",
                                "options": [
                                    {"optionText": "Concept A", "optionExplanation": "This is concept A explanation", "isCorrect": False},
                                    {"optionText": "Concept B", "optionExplanation": "This is concept B explanation", "isCorrect": True},
                                    {"optionText": "Concept C", "optionExplanation": "This is concept C explanation", "isCorrect": False},
                                    {"optionText": "Concept D", "optionExplanation": "This is concept D explanation", "isCorrect": False}
                                ]
                            },
                            {
                                "question": f"Based on the information provided, what can be concluded about {page_title}?",
                                "options": [
                                    {"optionText": "Conclusion A", "optionExplanation": "This is conclusion A explanation", "isCorrect": False},
                                    {"optionText": "Conclusion B", "optionExplanation": "This is conclusion B explanation", "isCorrect": False},
                                    {"optionText": "Conclusion C", "optionExplanation": "This is conclusion C explanation", "isCorrect": True},
                                    {"optionText": "Conclusion D", "optionExplanation": "This is conclusion D explanation", "isCorrect": False}
                                ]
                            }
                        ]

                        # Create content entry for this chunk
                        chunk_content_entry = {
                            "id": entry_id,
                            "pageTitle": page_title,
                            "wordCountAnalyzed": len(chunk_content.split()),
                            "questions": mock_questions
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
                        print(f"      📈 Total questions generated so far: {total_questions_generated}")
                        
                        # Add delay to simulate processing time and show progress
                        time.sleep(20)  # 2 second delay between chunks
                        print(f"      ⏳ Processing delay completed for chunk {current_chunk_index}/{total_chunks}")
                else:
                    print(f"  📄 Entry {entry_index + 1} (ID: {entry_id}): '{page_title}' - No content")
            
            print(f"✅ CREATE QUIZ event processed successfully - Processed {current_chunk_index} chunks total")
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
            
            print(f"✅ Successfully sent quiz generation event to Kafka topic 'quiz-generation'")
            print(f"   Topic: {record_metadata.topic}, Partition: {record_metadata.partition}, Offset: {record_metadata.offset}")
            print(f"   Key: {key}, Quiz ID: {payload['quizId']}, Chunk: {payload['currentChunkIndex'] + 1}/{payload['totalChunks']}")
            
        except Exception as e:
            print(f"❌ Failed to send quiz generation event to Kafka: {e}")

    def stop_consumer(self):
        """Stop the Kafka consumer and producer"""
        self.running = False
        if self.consumer:
            self.consumer.close()
            print("Kafka consumer stopped")
        if self.producer:
            self.producer.close()
            print("Kafka producer stopped")
