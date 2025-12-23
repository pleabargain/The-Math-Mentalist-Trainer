
export enum Operation {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  DIVISION = 'division',
  SQUARE_ROOT = 'square_root',
  CUBE_ROOT = 'cube_root',
  PRIME = 'prime',
  PERCENTAGE = 'percentage'
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export enum GameMode {
  PRACTICE = 'practice',
  TIME_ATTACK = 'time_attack'
}

export enum GameState {
  CONFIG = 'config',
  PLAYING = 'playing',
  RESULTS = 'results'
}

export interface Question {
  num1: number;
  num2?: number; // num2 is optional for single-operand operations like roots/primality
  operation: Operation;
  answer: number;
}

export interface GameStats {
  score: number;
  totalAnswered: number;
  correctCount: number;
  currentStreak: number;
  maxStreak: number;
  timeRemaining: number;
}
