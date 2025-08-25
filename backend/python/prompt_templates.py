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
1. Generate 1-6 topics that are relevant to the content
2. Topics should be generic and meaningful
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
        summaries_context = ""
        if summaries:
            summaries_text = "\n".join([f"- {summary}" for summary in summaries])
            summaries_context = f"\n\nPrevious content summaries for context:\n{summaries_text}"
        
        prompt = f"""You are an expert quiz creator. Generate high-quality multiple-choice questions and a summary based on the provided content.

Page Title: {page_title}

Custom Instructions: {instructions}
{summaries_context}

Content to analyze:
{content}

Instructions:
1. Create 2-3 multiple-choice questions based on the content and custom instructions
2. Each question should have 4 options (A, B, C, D)
3. Only one option should be correct
4. Questions should test understanding, not just memorization
5. Provide clear explanations for why each option is correct or incorrect
6. Generate a concise summary (1-2 sentences) of the key points in this content chunk
7. Consider the previous summaries for context but focus on new information in this chunk

Format your response as JSON with this exact structure:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": [
        {{"text": "Option A", "correct": true, "explanation": "Why this is correct"}},
        {{"text": "Option B", "correct": false, "explanation": "Why this is incorrect"}},
        {{"text": "Option C", "correct": false, "explanation": "Why this is incorrect"}},
        {{"text": "Option D", "correct": false, "explanation": "Why this is incorrect"}}
      ]
    }}
  ],
  "summary": "Concise summary of this content chunk"
}}"""
        
        return prompt