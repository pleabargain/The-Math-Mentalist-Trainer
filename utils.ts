
import { Operation, Difficulty, Question } from './types';

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i = i + 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

export const generateQuestion = (
  operations: Operation[],
  difficulty: Difficulty,
  lastQuestion?: Question
): Question => {
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  const getDifficultyNums = () => {
    let n1, n2;
    if (difficulty === Difficulty.INTERMEDIATE) {
      // Intermediate: Mixed 2-digit and 1-digit, avoiding 1 for non-triviality
      const isFirstBig = Math.random() > 0.5;
      n1 = isFirstBig ? getRandomInt(10, 50) : getRandomInt(2, 9);
      n2 = isFirstBig ? getRandomInt(2, 9) : getRandomInt(10, 50);
    } else if (difficulty === Difficulty.ADVANCED) {
      // Advanced: Double digits
      n1 = getRandomInt(10, 99);
      n2 = getRandomInt(10, 99);
    } else {
      // Beginner: Single digits
      n1 = getRandomInt(1, 9);
      n2 = getRandomInt(1, 9);
    }
    return [n1, n2];
  };

  const attemptGeneration = (): Question => {
    let [n1, n2] = getDifficultyNums();

    switch (operation) {
      case Operation.ADDITION:
        return { num1: n1, num2: n2, operation, answer: n1 + n2 };
      case Operation.SUBTRACTION:
        // Ensure non-negative result
        if (n1 < n2) [n1, n2] = [n2, n1];
        return { num1: n1, num2: n2, operation, answer: n1 - n2 };
      case Operation.MULTIPLICATION:
        if (difficulty === Difficulty.ADVANCED) {
          n1 = getRandomInt(10, 30);
          n2 = getRandomInt(2, 12);
        } else if (difficulty === Difficulty.INTERMEDIATE) {
          n1 = getRandomInt(10, 50);
          n2 = getRandomInt(2, 9);
          if (Math.random() > 0.5) [n1, n2] = [n2, n1];
        } else {
          n1 = getRandomInt(1, 9);
          n2 = getRandomInt(1, 9);
        }
        return { num1: n1, num2: n2, operation, answer: n1 * n2 };
      case Operation.DIVISION:
        const q = difficulty === Difficulty.ADVANCED ? getRandomInt(5, 20) :
                  difficulty === Difficulty.INTERMEDIATE ? getRandomInt(2, 12) : getRandomInt(2, 10);
        const d = difficulty === Difficulty.ADVANCED ? getRandomInt(2, 15) :
                  difficulty === Difficulty.INTERMEDIATE ? getRandomInt(2, 10) : getRandomInt(2, 5);
        return { num1: q * d, num2: d, operation, answer: q };
      case Operation.SQUARE_ROOT:
        const sqBase = difficulty === Difficulty.BEGINNER ? getRandomInt(1, 10) :
                       difficulty === Difficulty.INTERMEDIATE ? getRandomInt(4, 25) : getRandomInt(10, 40);
        return { num1: sqBase * sqBase, operation, answer: sqBase };
      case Operation.CUBE_ROOT:
        const cbBase = difficulty === Difficulty.BEGINNER ? getRandomInt(1, 4) :
                       difficulty === Difficulty.INTERMEDIATE ? getRandomInt(2, 8) : getRandomInt(4, 12);
        return { num1: cbBase * cbBase * cbBase, operation, answer: cbBase };
      case Operation.PRIME:
        const pNum = difficulty === Difficulty.BEGINNER ? getRandomInt(2, 25) :
                     difficulty === Difficulty.INTERMEDIATE ? getRandomInt(11, 70) : getRandomInt(30, 120);
        return { num1: pNum, operation, answer: isPrime(pNum) ? 1 : 0 };
      case Operation.PERCENTAGE:
        let perc, base;
        if (difficulty === Difficulty.BEGINNER) {
          perc = [10, 25, 50, 100][getRandomInt(0, 3)];
          base = getRandomInt(1, 10) * 10;
        } else if (difficulty === Difficulty.INTERMEDIATE) {
          perc = [5, 15, 20, 30, 40, 60, 75, 80, 90][getRandomInt(0, 8)];
          base = getRandomInt(1, 20) * 10;
        } else {
          perc = getRandomInt(1, 99);
          base = getRandomInt(10, 100) * 10;
        }
        return { num1: perc, num2: base, operation, answer: (perc * base) / 100 };
    }
    return { num1: 0, operation, answer: 0 };
  };

  let newQuestion = attemptGeneration();

  if (lastQuestion && 
      newQuestion.num1 === lastQuestion.num1 && 
      (newQuestion.num2 === lastQuestion.num2) && 
      newQuestion.operation === lastQuestion.operation) {
    return generateQuestion(operations, difficulty, lastQuestion);
  }

  return newQuestion;
};

export const getOperationSymbol = (op: Operation): string => {
  switch (op) {
    case Operation.ADDITION: return '+';
    case Operation.SUBTRACTION: return '−';
    case Operation.MULTIPLICATION: return '×';
    case Operation.DIVISION: return '÷';
    case Operation.SQUARE_ROOT: return '√';
    case Operation.CUBE_ROOT: return '∛';
    case Operation.PRIME: return '?P';
    case Operation.PERCENTAGE: return '%';
    default: return '?';
  }
};

export const generateHint = (q: Question): string => {
  const { num1, num2, operation } = q;
  switch (operation) {
    case Operation.ADDITION:
      if (num2) {
        const tens1 = Math.floor(num1 / 10) * 10;
        const tens2 = Math.floor(num2 / 10) * 10;
        const units1 = num1 % 10;
        const units2 = num2 % 10;
        if (num1 < 10 && num2 < 10) return `Basic fact: ${num1} + ${num2} = ${num1 + num2}`;
        return `Add tens: ${tens1} + ${tens2} = ${tens1 + tens2}. Add units: ${units1} + ${units2} = ${units1 + units2}. Then combine.`;
      }
      break;
    case Operation.SUBTRACTION:
      if (num2) {
        if (num1 < 20 && num2 < 10) return `Basic subtraction: Take away ${num2} from ${num1}.`;
        const nearestTen = Math.ceil(num2 / 10) * 10;
        const diffToTen = nearestTen - num2;
        return `Compensate: Subtract ${nearestTen} (${num1} - ${nearestTen} = ${num1 - nearestTen}), then add back ${diffToTen}.`;
      }
      break;
    case Operation.MULTIPLICATION:
      if (num2) {
        if (num1 > 10) {
          return `Split: ${Math.floor(num1 / 10) * 10} × ${num2} = ${Math.floor(num1 / 10) * 10 * num2}, plus ${num1 % 10} × ${num2} = ${num1 % 10 * num2}.`;
        }
        return `Groups: Think of ${num1} groups of ${num2}.`;
      }
      break;
    case Operation.DIVISION:
      if (num2) {
        return `Inverse: What times ${num2} equals ${num1}? Try estimating: ${num2} × 10 = ${num2 * 10}.`;
      }
      break;
    case Operation.SQUARE_ROOT:
      return `Square check: What number times itself is ${num1}? Hint: 10²=100, 20²=400.`;
    case Operation.CUBE_ROOT:
      return `Cube check: What number times itself three times is ${num1}? Hint: 2³=8, 5³=125.`;
    case Operation.PRIME:
      return `Divisibility: Is it even? Does the sum of digits (${Array.from(num1.toString()).reduce((a, b) => a + parseInt(b), 0)}) divide by 3?`;
    case Operation.PERCENTAGE:
      if (num2) {
        if (num1 === 10) return `10% shortcut: Move the decimal left one place. ${num2} becomes ${num2 / 10}.`;
        if (num1 === 25) return `25% shortcut: Divide by 4. Half of half.`;
        if (num1 === 50) return `50% shortcut: Just take half.`;
        if (num1 % 10 === 0) return `Find 10% (${num2 / 10}) and multiply by ${num1 / 10}.`;
        return `Split: ${num1}% is ${Math.floor(num1 / 10) * 10}% + ${num1 % 10}%. Find each and sum.`;
      }
      break;
  }
  return "Break the problem into smaller steps.";
};
