import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @MessagePattern('createQuiz')
  create(@Payload() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @MessagePattern('findAllQuiz')
  findAll() {
    return this.quizService.findAll();
  }

  @MessagePattern('findOneQuiz')
  findOne(@Payload() id: number) {
    return this.quizService.findOne(id);
  }

  @MessagePattern('updateQuiz')
  update(@Payload() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(updateQuizDto.id, updateQuizDto);
  }

  @MessagePattern('removeQuiz')
  remove(@Payload() id: number) {
    return this.quizService.remove(id);
  }
}
