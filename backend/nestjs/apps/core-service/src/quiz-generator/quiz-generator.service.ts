import { Injectable, Inject } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface Book {
  id: string;
  title: string;
  author: string;
}

interface GetBooksResponse {
  books: Book[];
}

interface BookStreamResponse {
  book: Book;
}

interface BookService {
  getBooks(data: {}): Observable<GetBooksResponse>;
  getBooksStream(data: {}): Observable<BookStreamResponse>;
}

@Injectable()
export class QuizGeneratorService {
  private bookService: BookService;

  constructor(@Inject('HERO_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.bookService = this.client.getService<BookService>('BookService');
  }

  getBooks(): Observable<GetBooksResponse> {
    return this.bookService.getBooks({});
  }

  getBooksStream(): Observable<BookStreamResponse> {
    return this.bookService.getBooksStream({});
  }
}
