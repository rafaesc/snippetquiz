import json
import os
import re
from typing import List, Optional
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

class GroqClient:
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.model = "qwen/qwen3-32b"
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.client = Groq(api_key=self.api_key)
    
    def generate_completion(self, messages: List[dict], max_tokens: int = 4096, stream: bool = False) -> Optional[str]:
        """
        Generate completion using Groq AI API
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            max_tokens: Maximum tokens for the response
            
        Returns:
            Generated text content or None if error
        """
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.6,
                max_completion_tokens=max_tokens,
                top_p=0.95,
                reasoning_effort="default",
                stream=stream,
                stop=None
            )
            
            if stream:
                # Handle streaming response
                content = ""
                for chunk in completion:
                    if chunk.choices[0].delta.content:
                        content += chunk.choices[0].delta.content
                return content.strip()
            else:
                # Handle non-streaming response
                if completion.choices and len(completion.choices) > 0:
                    return self.extract_block_between_braces(completion.choices[0].message.content.strip())
                else:
                    print(f"Unexpected response format: {completion}")
                    return None
                    
        except Exception as e:
            print(f"Groq API error: {e}")
            return None
    
    def generate_topics(self, content: str, page_title: str, existing_topics: List[str]) -> List[str]:
        """
        Generate topics based on content, page title, and existing topics
        
        Args:
            content: The content to analyze
            page_title: Title of the page
            existing_topics: List of existing topics to avoid duplicates
            
        Returns:
            List of generated topic strings
        """
        from prompt_templates import PromptTemplates
        
        # Create the prompt using the template
        prompt = PromptTemplates.get_topic_generation_prompt(
            content=content,
            page_title=page_title,
            existing_topics=existing_topics
        )
        
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        response = self.generate_completion(messages, max_tokens=500)
        
        if response:
            # Parse the response to extract topics
            topics = self._parse_topics_response(response)
            return topics
        else:
            print("Failed to generate topics, returning empty list")
            return []
    
    def _parse_topics_response(self, response: str) -> List[str]:
        """
        Parse the AI response to extract topic list
        
        Args:
            response: Raw response from AI
            
        Returns:
            List of parsed topics
        """
        topics = []
        
        # Try to extract topics from various formats
        lines = response.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines and headers
            if not line or line.lower().startswith(('topics:', 'generated topics:', 'here are')):
                continue
            
            # Remove numbering, bullets, and dashes
            cleaned_line = line
            for prefix in ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '-', '•', '*']:
                if cleaned_line.startswith(prefix):
                    cleaned_line = cleaned_line[len(prefix):].strip()
                    break
            
            # Remove quotes if present
            cleaned_line = cleaned_line.strip('"\'')
            
            if cleaned_line and len(cleaned_line) > 2:
                topics.append(cleaned_line)
        
        # If no topics found in list format, try JSON parsing
        if not topics:
            try:
                # Try to find JSON array in response
                import re
                json_match = re.search(r'\[.*?\]', response, re.DOTALL)
                if json_match:
                    topics_json = json.loads(json_match.group())
                    if isinstance(topics_json, list):
                        topics = [str(topic).strip() for topic in topics_json if str(topic).strip()]
            except:
                pass
        
        # Limit to 6 topics maximum
        return topics[:6]
    
    def extract_block_between_braces(self, s: str) -> str | None:
        """
        Extract the first complete JSON block between braces from a string
        
        Args:
            s: Input string that may contain JSON block
            
        Returns:
            The JSON block string or None if not found
        """
        open_braces = 0
        start_index = -1
        end_index = -1

        for i, ch in enumerate(s):
            if ch == "{":
                if open_braces == 0:
                    start_index = i
                open_braces += 1
            elif ch == "}":
                open_braces -= 1
                if open_braces == 0:
                    end_index = i
                    break

        if start_index != -1 and end_index != -1:
            return s[start_index:end_index + 1]

        return None

    def _clean_json_response(self, response: str) -> str:
        """
        Clean the AI response to ensure valid JSON format
        Handles common issues like trailing commas, extra whitespace, etc.
        """
        if not response:
            return response
            
        # First try to extract JSON block between braces
        json_block = self.extract_block_between_braces(response)
        if json_block:
            response = json_block
        
        # Remove any markdown code block markers
        response = re.sub(r'^```json\s*', '', response, flags=re.MULTILINE)
        response = re.sub(r'^```\s*$', '', response, flags=re.MULTILINE)
        
        # Remove trailing commas before closing brackets/braces
        response = re.sub(r',\s*([}\]])', r'\1', response)
        
        # Remove any leading/trailing whitespace
        response = response.strip()
        
        return response
    
    def generate_quiz_questions(self, instructions: str, summaries: List[str], page_title: str, content: str) -> dict:
        """
        Generate quiz questions and summary based on content chunk
        
        Args:
            instructions: User-customizable instructions for question generation
            summaries: List of summaries from previous chunks
            page_title: Title of the page
            content: Content chunk to analyze
            
        Returns:
            Dictionary with 'questions' list and 'summary' string
        """
        from prompt_templates import PromptTemplates
        
        # Create the prompt using the template
        prompt = PromptTemplates.get_quiz_generation_prompt(
            instructions=instructions,
            summaries=summaries,
            page_title=page_title,
            content=content
        )
        
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        # First attempt
        response = self.generate_completion(messages, max_tokens=1500)
        
        # Retry mechanism - single retry attempt if first attempt fails
        if not response:
            print("First attempt failed, retrying once...")
            response = self.generate_completion(messages, max_tokens=1500)
        
        if response:
            # Clean and parse the JSON response
            try:
                cleaned_response = self._clean_json_response(response)
                result = json.loads(cleaned_response)
                return {
                    'questions': result.get('questions', []),
                    'summary': result.get('summary', '')
                }
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {e}")
                print(f"Raw response: {response}")
                # Retry with a fresh request if JSON parsing fails
                print("JSON parsing failed, retrying request once...")
                retry_response = self.generate_completion(messages, max_tokens=1500)
                if retry_response:
                    try:
                        cleaned_retry_response = self._clean_json_response(retry_response)
                        retry_result = json.loads(cleaned_retry_response)
                        return {
                            'questions': retry_result.get('questions', []),
                            'summary': retry_result.get('summary', '')
                        }
                    except json.JSONDecodeError as retry_e:
                        print(f"Retry also failed to parse JSON: {retry_e}")
                        print(f"Retry response: {retry_response}")
                return {'questions': [], 'summary': ''}
        else:
            print("Failed to generate quiz questions after retry, returning empty result")
            return {'questions': [], 'summary': ''}