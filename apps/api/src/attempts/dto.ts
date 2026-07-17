export interface AnswerDto {
  questionId: string;
  chosenIndex: number;
}

export interface SaveAttemptDto {
  stateCode: string;
  mode: 'PRACTICE' | 'MOCK';
  answers: AnswerDto[];
}
