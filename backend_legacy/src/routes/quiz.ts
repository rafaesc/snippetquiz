import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { Quiz, QuizTopics, QuizQuestionResponse, QuizQuestion, QuizQuestionOption } from '../models';

const router = Router();

// GET route to retrieve user's quizzes with topics
router.get('/', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = (req.user as any).id;

    // Get total count of quizzes for the user
    const totalQuery = Quiz.query()
      .where('user_id', userId);
    
    const total = await totalQuery.resultSize();

    // Get quizzes for the user with pagination
    const quizzes = await Quiz.query()
      .select(
        'quizzes.id',
        'quizzes.created_at',
        'quizzes.questions_count',
        'quizzes.questions_completed',
        'quizzes.content_entries_count'
      )
      .where('quizzes.user_id', userId)
      .orderBy('quizzes.created_at', 'desc')
      .page(Number(page) - 1, Number(limit));

    // Get topics for each quiz
    const quizIds = quizzes.results.map(quiz => quiz.id);
    const topics = await QuizTopics.query()
      .select('quiz_id', 'topic_name')
      .whereIn('quiz_id', quizIds);

    // Group topics by quiz_id
    const topicsByQuizId = topics.reduce((acc, topic) => {
      if (!acc[topic.quiz_id]) {
        acc[topic.quiz_id] = [];
      }
      acc[topic.quiz_id].push(topic.topic_name);
      return acc;
    }, {} as Record<number, string[]>);

    // Format the response
    const formattedQuizzes = quizzes.results.map(quiz => ({
      id: quiz.id,
      createdAt: quiz.created_at,
      questionsCount: quiz.questions_count,
      questionsCompleted: quiz.questions_completed,
      contentEntriesCount: quiz.content_entries_count,
      topics: topicsByQuizId[quiz.id] || []
    }));

    res.json({
      quizzes: formattedQuizzes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to retrieve basic quiz info by ID
router.get('/:id', authenticateJWT, async function (req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any).id;
    const quizId = parseInt(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }

    // Check if the quiz exists and belongs to the user
    const quiz = await Quiz.query()
      .findById(quizId)
      .where('user_id', userId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or you do not have permission to access it' });
    }

    // Get quiz topics
    const topics = await QuizTopics.query()
      .select('topic_name')
      .where('quiz_id', quizId);

    res.json({
      id: quiz.id,
      createdAt: quiz.created_at,
      questionsCompleted: quiz.questions_completed,
      contentEntriesCount: quiz.content_entries_count,
      topics: topics.map(t => t.topic_name),
      totalQuestions: quiz.questions_count
    });
  } catch (error) {
    console.error('Error fetching quiz info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to retrieve quiz responses with pagination
router.get('/:id/responses', authenticateJWT, async function (req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = (req.user as any).id;
    const quizId = parseInt(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }

    // Check if the quiz exists and belongs to the user
    const quiz = await Quiz.query()
      .findById(quizId)
      .where('user_id', userId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or you do not have permission to access it' });
    }

    // Get total count of responses
    const totalQuery = QuizQuestionResponse.query()
      .where('quiz_id', quizId);
    
    const total = await totalQuery.resultSize();

    // Get quiz question responses with related data and pagination
    const responses = await QuizQuestionResponse.query()
      .select(
        'quiz_question_responses.is_correct',
        'quiz_question_responses.correct_answer',
        'quiz_questions.question',
        'quiz_questions.content_entry_source_url',
        'quiz_question_options.option_text',
        'quiz_question_options.option_explanation'
      )
      .join('quiz_questions', 'quiz_question_responses.quiz_question_id', 'quiz_questions.id')
      .join('quiz_question_options', 'quiz_question_responses.quiz_question_option_id', 'quiz_question_options.id')
      .where('quiz_question_responses.quiz_id', quizId)
      .page(Number(page) - 1, Number(limit));

    // Format responses
    const formattedResponses = responses.results.map((response: any) => ({
      isCorrect: response.is_correct,
      question: response.question,
      answer: response.option_text,
      correctAnswer: response.correct_answer,
      explanation: response.option_explanation,
      sourceUrl: response.content_entry_source_url
    }));

    res.json({
      responses: formattedResponses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching quiz responses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to retrieve quiz summary by ID (simplified version)
router.get('/:id/summary', authenticateJWT, async function (req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any).id;
    const quizId = parseInt(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }

    // Check if the quiz exists and belongs to the user
    const quiz = await Quiz.query()
      .findById(quizId)
      .where('user_id', userId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or you do not have permission to access it' });
    }

    // Get quiz topics
    const topics = await QuizTopics.query()
      .select('topic_name')
      .where('quiz_id', quizId);

    // Get total correct answers count (without fetching all responses)
    const totalCorrectAnswers = await QuizQuestionResponse.query()
      .where('quiz_id', quizId)
      .where('is_correct', true)
      .resultSize();

    res.json({
      topics: topics.map(t => t.topic_name),
      totalQuestions: quiz.questions_count,
      totalCorrectAnswers
    });
  } catch (error) {
    console.error('Error fetching quiz summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE route to delete a quiz by ID
router.delete('/:id', authenticateJWT, async function (req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any).id;
    const quizId = parseInt(req.params.id);

    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }

    // Check if the quiz exists and belongs to the user
    const quiz = await Quiz.query()
      .findById(quizId)
      .where('user_id', userId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or you do not have permission to delete it' });
    }

    // Delete the quiz (cascade delete will handle related records)
    await Quiz.query().deleteById(quizId);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: POST route to create a dummy quiz with hardcoded questions and options
router.post('/', authenticateJWT, async function (req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.user as any).id;
    const { bankId } = req.body;

    if (!bankId) {
      return res.status(400).json({ error: 'bankId is required' });
    }

    // Create a dummy quiz
    const quiz = await Quiz.query().insert({
      user_id: userId,
      bank_id: bankId,
      content_entries_count: 3,
      questions_count: 3,
      questions_completed: 0,
      bank_name: 'Dummy Quiz Bank'
    });

    // Create dummy topics for the quiz
    const topics = ['JavaScript', 'Programming', 'Web Development'];
    await Promise.all(
      topics.map(topic => 
        QuizTopics.query().insert({
          quiz_id: quiz.id,
          topic_name: topic
        })
      )
    );

    // Create dummy questions with options
    const questionsData = [
      {
        question: 'What is the correct way to declare a variable in JavaScript?',
        content_entry_type: 'text',
        content_entry_source_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types',
        options: [
          { option_text: 'var myVar = 5;', option_explanation: 'This is the traditional way to declare variables in JavaScript.', is_correct: true },
          { option_text: 'variable myVar = 5;', option_explanation: 'This is not valid JavaScript syntax.', is_correct: false },
          { option_text: 'declare myVar = 5;', option_explanation: 'This is not valid JavaScript syntax.', is_correct: false },
          { option_text: 'int myVar = 5;', option_explanation: 'This is Java/C++ syntax, not JavaScript.', is_correct: false }
        ]
      },
      {
        question: 'Which method is used to add an element to the end of an array?',
        content_entry_type: 'text',
        content_entry_source_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push',
        options: [
          { option_text: 'array.push(element)', option_explanation: 'Correct! The push() method adds elements to the end of an array.', is_correct: true },
          { option_text: 'array.add(element)', option_explanation: 'JavaScript arrays do not have an add() method.', is_correct: false },
          { option_text: 'array.append(element)', option_explanation: 'JavaScript arrays do not have an append() method.', is_correct: false },
          { option_text: 'array.insert(element)', option_explanation: 'JavaScript arrays do not have an insert() method.', is_correct: false }
        ]
      },
      {
        question: 'What does the \"===\" operator do in JavaScript?',
        content_entry_type: 'text',
        content_entry_source_url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality',
        options: [
          { option_text: 'Strict equality comparison', option_explanation: 'Correct! The === operator checks for strict equality without type coercion.', is_correct: true },
          { option_text: 'Assignment operator', option_explanation: 'The assignment operator is =, not ===.', is_correct: false },
          { option_text: 'Loose equality comparison', option_explanation: 'Loose equality comparison uses ==, not ===.', is_correct: false },
          { option_text: 'Greater than or equal', option_explanation: 'Greater than or equal uses >=, not ===.', is_correct: false }
        ]
      }
    ];

    // Create questions and their options
    for (const questionData of questionsData) {
      const question = await QuizQuestion.query().insert({
        question: questionData.question,
        content_entry_type: questionData.content_entry_type,
        content_entry_source_url: questionData.content_entry_source_url,
        quiz_id: quiz.id
      });

      // Create options for this question
      await Promise.all(
        questionData.options.map(option => 
          QuizQuestionOption.query().insert({
            quiz_question_id: question.id,
            option_text: option.option_text,
            option_explanation: option.option_explanation,
            is_correct: option.is_correct
          })
        )
      );
    }

    res.status(201).json({ 
      message: 'Dummy quiz created successfully',
      quizId: quiz.id 
    });
  } catch (error) {
    console.error('Error creating dummy quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;