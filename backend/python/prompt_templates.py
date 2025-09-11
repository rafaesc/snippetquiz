from typing import List


class PromptTemplates:
    """
    Standardized prompt templates for AI generation tasks
    """

    @staticmethod
    def get_topic_generation_prompt(
        content: str, page_title: str, existing_topics: List[str]
    ) -> str:
        """
        Generate a prompt for topic generation based on content and context

        Args:
            content: The content to analyze for topics
            page_title: Title of the page/document
            existing_topics: List of existing topics to avoid duplicates

        Returns:
            Formatted prompt string
        """
        existing_topics_str = ", ".join(existing_topics) if existing_topics else "None"

        prompt = f"""You are an expert content analyst. Your task is to generate relevant, specific topics based on the provided content.

Page Title: {page_title}

Content to analyze:
{content[:2500]}{'...' if len(content) > 2500 else ''}

Existing topics that you can reuse if you need it:
{existing_topics_str}

Instructions:
1. Generate 1-3 topics that are relevant to the content
2. Topics should be generic
3. First identify reusable topics from existing topics before creating new ones.
4. Topics should be concise (2-5 words each)
5. Focus on key concepts, themes, or subjects discussed in the content

Please provide ONLY the topics as a simple numbered list, one topic per line:
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]
...

Topics:"""

        return prompt

    @staticmethod
    def get_quiz_generation_system_prompt(instructions: str, summaries: List[str]) -> str:
        """
        Generate a system prompt that includes instructions and context summaries
        
        Args:
            instructions: User-customizable instructions for question generation
            summaries: List of summaries from previous chunks for context
            
        Returns:
            Formatted system prompt string
        """
        system_prompt = f"You are an expert quiz creator. Follow these custom instructions: {instructions}"
        
        if summaries:
            summaries_text = "\n".join([f"- {summary}" for summary in summaries])
            system_prompt += f"\n\nPrevious content summaries for context:\n{summaries_text}"
            system_prompt += "\n\nConsider the previous summaries for context but focus on new information in the current content chunk."
        
        return system_prompt

    @staticmethod
    def get_quiz_generation_prompt(instructions: str, summaries: List[str], page_title: str, content: str) -> str:
        """
        Generate a prompt for quiz question generation with custom instructions and context

        Args:
            instructions: User-customizable instructions for question generation
            summaries: List of summaries from previous chunks for context
            page_title: Title of the page/document
            content: The content chunk to create questions from

        Returns:
            Formatted prompt string for quiz generation
        """
        
        prompt = f"""You are an expert quiz creator. Generate high-quality multiple-choice questions and a summary based on the provided content.

Page Title: {page_title}

Content to analyze:
{content}

Instructions:
1. Create 2-3 multiple-choice questions based on the content and custom instructions
2. Each question should have 4 options (A, B, C, D)
3. Only one option should be correct
4. Options should be without ambiguous options
5. Questions should test understanding, not just memorization
6. Provide clear explanations for why each option is correct or incorrect
7. Generate a concise summary (1-2 sentences) of the key points in this content chunk
"""
        
        return prompt

    @staticmethod
    def get_quiz_generation_json_schema() -> dict:
        """
        Get the JSON schema for quiz generation response structure
        
        Returns:
            Dictionary containing the JSON schema for structured quiz output
        """
        return {
            "name": "quiz_generation_response",
            "schema": {
                "type": "object",
                "properties": {
                    "questions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "question": {
                                    "type": "string",
                                    "description": "The quiz question text"
                                },
                                "options": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "text": {
                                                "type": "string",
                                                "description": "The option text"
                                            },
                                            "correct": {
                                                "type": "boolean",
                                                "description": "Whether this option is correct"
                                            },
                                            "explanation": {
                                                "type": "string",
                                                "description": "Explanation for why this option is correct or incorrect"
                                            }
                                        },
                                        "required": ["text", "correct", "explanation"],
                                        "additionalProperties": False
                                    },
                                    "minItems": 4,
                                    "maxItems": 4
                                }
                            },
                            "required": ["question", "options"],
                            "additionalProperties": False
                        }
                    },
                    "summary": {
                        "type": "string",
                        "description": "Concise summary of the content chunk"
                    }
                },
                "required": ["questions", "summary"],
                "additionalProperties": False
            }
        }