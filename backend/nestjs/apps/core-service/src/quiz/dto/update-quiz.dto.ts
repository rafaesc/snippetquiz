export class UpdateQuizDto {
  user_id: string;
  quiz_id: string;
  question_option_id: string;
}

export class UpdateQuizResponseDto {
  message: string;
  success: boolean;
  completed?: boolean;
}
