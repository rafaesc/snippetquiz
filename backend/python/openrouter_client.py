import requests
import json
import os
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class OpenRouterClient:
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "openai/gpt-3.5-turbo"  # Using a more reliable model
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")
    
    def generate_completion(self, messages: List[dict], max_tokens: int = 1000) -> Optional[str]:
        """
        Generate completion using OpenRouter AI API
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            max_tokens: Maximum tokens for the response
            
        Returns:
            Generated text content or None if error
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            
            data = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.7,
            }
            
            response = requests.post(
                url=self.base_url,
                headers=headers,
                data=json.dumps(data),
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                return result['choices'][0]['message']['content'].strip()
            else:
                print(f"Unexpected response format: {result}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
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
        
        response = self.generate_completion(messages, max_tokens=1500)
        
        if response:
            # Parse the JSON response
            try:
                result = json.loads(response)
                return {
                    'questions': result.get('questions', []),
                    'summary': result.get('summary', '')
                }
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {e}")
                print(f"Raw response: {response}")
                return {'questions': [], 'summary': ''}
        else:
            print("Failed to generate quiz questions, returning empty result")
            return {'questions': [], 'summary': ''}