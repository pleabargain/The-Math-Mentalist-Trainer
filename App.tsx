
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  X, 
  Divide, 
  Play, 
  RotateCcw, 
  Trophy, 
  Timer, 
  Zap, 
  CheckCircle2, 
  XCircle,
  Home,
  Box,
  Square,
  Lightbulb,
  Binary,
  History,
  Percent
} from 'lucide-react';
import { GameState, Operation, Difficulty, GameMode, GameStats, Question } from './types';
import { generateQuestion, getOperationSymbol, generateHint } from './utils';

const App: React.FC = () => {
  // Config State
  const [selectedOps, setSelectedOps] = useState<Operation[]>([Operation.ADDITION]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [mode, setMode] = useState<GameMode>(GameMode.PRACTICE);
  const [gameState, setGameState] = useState<GameState>(GameState.CONFIG);

  // Game Play State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    totalAnswered: 0,
    correctCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    timeRemaining: 60,
  });
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  
  // Review Queue for missed questions
  const [reviewQueue, setReviewQueue] = useState<Question[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start Game
  const startGame = () => {
    const firstQuestion = generateQuestion(selectedOps, difficulty);
    setCurrentQuestion(firstQuestion);
    setStats({
      score: 0,
      totalAnswered: 0,
      correctCount: 0,
      currentStreak: 0,
      maxStreak: 0,
      timeRemaining: 60,
    });
    setGameState(GameState.PLAYING);
    setFeedback('none');
    setUserInput('');
    setShowHint(false);
    setReviewQueue([]);
  };

  // Timer Logic
  useEffect(() => {
    if (gameState === GameState.PLAYING && mode === GameMode.TIME_ATTACK) {
      timerRef.current = setInterval(() => {
        setStats(prev => {
          if (prev.timeRemaining <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameState(GameState.RESULTS);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, mode]);

  // Focus input
  useEffect(() => {
    if (gameState === GameState.PLAYING && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentQuestion, feedback]);

  const toggleOp = (op: Operation) => {
    setSelectedOps(prev => {
      if (prev.includes(op)) {
        if (prev.length === 1) return prev;
        return prev.filter(o => o !== op);
      }
      return [...prev, op];
    });
  };

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || feedback !== 'none' || userInput.trim() === '') return;

    const numericAnswer = parseFloat(userInput);
    const isCorrect = Math.abs(numericAnswer - currentQuestion.answer) < 0.01;

    if (isCorrect) {
      setFeedback('correct');
      setStats(prev => {
        const newStreak = prev.currentStreak + 1;
        return {
          ...prev,
          score: prev.score + (10 * newStreak),
          correctCount: prev.correctCount + 1,
          totalAnswered: prev.totalAnswered + 1,
          currentStreak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak)
        };
      });
      
      setTimeout(() => {
        let nextQ: Question;
        if (reviewQueue.length > 0 && Math.random() < 0.3) {
          nextQ = reviewQueue[0];
          setReviewQueue(prev => prev.slice(1));
        } else {
          nextQ = generateQuestion(selectedOps, difficulty, currentQuestion);
        }
        
        setCurrentQuestion(nextQ);
        setUserInput('');
        setFeedback('none');
        setShowHint(false);
      }, 600);
    } else {
      setFeedback('wrong');
      setLastCorrectAnswer(currentQuestion.answer);
      setReviewQueue(prev => [...prev, currentQuestion]);
      
      setStats(prev => ({
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        currentStreak: 0
      }));
      
      setTimeout(() => {
        const nextQ = generateQuestion(selectedOps, difficulty, currentQuestion);
        setCurrentQuestion(nextQ);
        setUserInput('');
        setFeedback('none');
        setLastCorrectAnswer(null);
        setShowHint(false);
      }, 1500);
    }
  };

  const accuracy = stats.totalAnswered > 0 
    ? Math.round((stats.correctCount / stats.totalAnswered) * 100) 
    : 0;

  const navigateToHome = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(GameState.CONFIG);
    setFeedback('none');
    setUserInput('');
  };

  const getExerciseName = (op: Operation) => {
    switch(op) {
      case Operation.ADDITION: return "Addition";
      case Operation.SUBTRACTION: return "Subtraction";
      case Operation.MULTIPLICATION: return "Multiplication";
      case Operation.DIVISION: return "Division";
      case Operation.SQUARE_ROOT: return "Square Root";
      case Operation.CUBE_ROOT: return "Cube Root";
      case Operation.PRIME: return "Prime Number Test";
      case Operation.PERCENTAGE: return "Percentage Trainer";
      default: return "Math Exercise";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-[#f5f8ff]">
      {/* Header */}
      <div className="w-full max-w-2xl mb-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-2xl text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)]">
            <Zap size={22} fill="white" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            MentalMath<span className="text-indigo-600">Pro</span>
          </h1>
        </div>
        
        {gameState !== GameState.CONFIG && (
          <button 
            onClick={navigateToHome}
            className="flex items-center gap-2 bg-white/80 px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:text-indigo-600 font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Home size={18} />
            <span className="text-sm font-bold">Home</span>
          </button>
        )}
      </div>

      <main className="w-full max-w-2xl">
        {gameState === GameState.CONFIG && (
          <div className="glass-card rounded-[3.5rem] p-6 sm:p-10 shadow-2xl shadow-indigo-100 border border-white space-y-10">
            {/* Operations Selection */}
            <div className="relative">
              <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" />
                </div>
                Select Operations
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { op: Operation.ADDITION, icon: Plus, label: 'Add', color: 'text-emerald-500' },
                  { op: Operation.SUBTRACTION, icon: Minus, label: 'Subtract', color: 'text-rose-500' },
                  { op: Operation.MULTIPLICATION, icon: X, label: 'Multiply', color: 'text-amber-500' },
                  { op: Operation.DIVISION, icon: Divide, label: 'Divide', color: 'text-sky-500' },
                  { op: Operation.SQUARE_ROOT, icon: Square, label: 'Square Root', color: 'text-indigo-500' },
                  { op: Operation.CUBE_ROOT, icon: Box, label: 'Cubed Root', color: 'text-violet-500' },
                  { op: Operation.PRIME, icon: Binary, label: 'Prime', color: 'text-teal-500' },
                  { op: Operation.PERCENTAGE, icon: Percent, label: 'Percentage', color: 'text-fuchsia-500' },
                ].map(({ op, icon: Icon, label, color }) => (
                  <button
                    key={op}
                    onClick={() => toggleOp(op)}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 relative group ${
                      selectedOps.includes(op) 
                        ? `border-indigo-600 bg-white shadow-xl scale-[1.03] ring-4 ring-indigo-50` 
                        : 'border-slate-50 bg-white/30 hover:bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-full mb-3 bg-slate-50 ${color} group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-bold text-slate-800 text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty & Mode */}
            <div className="grid sm:grid-cols-2 gap-10">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-amber-500 fill-amber-500" />
                  Difficulty
                </h2>
                <div className="space-y-3">
                  {[
                    { val: Difficulty.BEGINNER, label: 'Beginner', desc: 'Single digits (1-9)' },
                    { val: Difficulty.INTERMEDIATE, label: 'Intermediate', desc: 'Mixed double & single' },
                    { val: Difficulty.ADVANCED, label: 'Advanced', desc: 'Double digits (10-99)' },
                  ].map(({ val, label, desc }) => (
                    <button
                      key={val}
                      onClick={() => setDifficulty(val)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                        difficulty === val
                          ? 'border-indigo-600 bg-white shadow-lg scale-[1.02]'
                          : 'border-white bg-white/40 hover:bg-white'
                      }`}
                    >
                      <p className="font-bold text-slate-800">{label}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <Timer size={20} className="text-indigo-600" />
                  Mode
                </h2>
                <div className="space-y-3">
                  {[
                    { val: GameMode.PRACTICE, label: 'Practice', desc: 'Calm, no timer pressure' },
                    { val: GameMode.TIME_ATTACK, label: 'Time Attack', desc: '60s lightning round' },
                  ].map(({ val, label, desc }) => (
                    <button
                      key={val}
                      onClick={() => setMode(val)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                        mode === val
                          ? 'border-indigo-600 bg-white shadow-lg scale-[1.02]'
                          : 'border-white bg-white/40 hover:bg-white'
                      }`}
                    >
                      <p className="font-bold text-slate-800">{label}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={startGame}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xl py-6 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Play size={24} fill="currentColor" />
                Start Challenge
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && currentQuestion && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Stats Bar - Mockup Style */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'SCORE', value: stats.score, color: 'text-indigo-600' },
                { label: 'STREAK', value: stats.currentStreak, color: 'text-amber-500' },
                { label: 'DONE', value: stats.totalAnswered, color: 'text-slate-800' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative">
                  <span className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-2">{stat.label}</span>
                  <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-slate-50 rounded-full mb-2 opacity-50" />
                </div>
              ))}
            </div>

            {/* Meta Info Section */}
            <div className="text-center space-y-1">
              <h2 className="text-indigo-400 font-black text-sm uppercase tracking-[0.4em]">
                {getExerciseName(currentQuestion.operation).toUpperCase()}
              </h2>
              <p className="text-indigo-300/60 font-black text-[10px] uppercase tracking-[0.2em]">
                {difficulty.toUpperCase()} LEVEL
              </p>
            </div>

            {/* Main Problem Card */}
            <div 
              className={`glass-card rounded-[4rem] p-10 sm:p-20 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 transform relative group flex flex-col items-center justify-center border-4 border-white/80 ${
                feedback === 'correct' ? 'ring-[16px] ring-emerald-500/10' : 
                feedback === 'wrong' ? 'ring-[16px] ring-rose-500/10 animate-shake' : 
                ''
              }`}
            >
              {/* Hint Layer */}
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-help z-10"
                onMouseEnter={() => setShowHint(true)}
                onMouseLeave={() => setShowHint(false)}
              >
                {showHint && feedback === 'none' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-10 w-[320px] bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-2xl text-xs font-bold leading-relaxed animate-in fade-in zoom-in-95 duration-300 pointer-events-none border border-indigo-400">
                    <div className="flex items-center gap-2 mb-3 text-indigo-100 uppercase tracking-[0.2em] font-black text-[10px]">
                      <Lightbulb size={16} className="text-amber-300 fill-amber-300" />
                      Mental Strategy
                    </div>
                    {generateHint(currentQuestion)}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-indigo-600"></div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-14 w-full">
                <div className={`flex flex-col items-center justify-center transition-all duration-500 ${showHint ? 'opacity-10 scale-90 blur-xl' : 'opacity-100 scale-100'}`}>
                  {currentQuestion.operation === Operation.PRIME && (
                    <span className="text-3xl uppercase tracking-[0.5em] text-indigo-400 font-black mb-10">IS PRIME ?</span>
                  )}
                  
                  <div className="text-7xl sm:text-[8rem] font-black text-slate-800 tracking-tighter flex items-center gap-10">
                    {currentQuestion.operation === Operation.PRIME ? (
                      <span>{currentQuestion.num1}</span>
                    ) : currentQuestion.operation === Operation.PERCENTAGE ? (
                      <>
                        <span>{currentQuestion.num1}%</span>
                        <span className="text-indigo-400 text-4xl sm:text-5xl font-extrabold lowercase tracking-tight">of</span>
                        <span>{currentQuestion.num2}</span>
                      </>
                    ) : currentQuestion.num2 !== undefined ? (
                      <>
                        <span>{currentQuestion.num1}</span>
                        <span className="text-indigo-400 text-6xl sm:text-7xl">{getOperationSymbol(currentQuestion.operation)}</span>
                        <span>{currentQuestion.num2}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-indigo-400 mr-4 text-6xl sm:text-7xl">{getOperationSymbol(currentQuestion.operation)}</span>
                        <span>{currentQuestion.num1}</span>
                      </>
                    )}
                  </div>
                </div>

                <form onSubmit={handleAnswer} className="relative max-w-[300px] mx-auto z-20">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="number"
                      step="any"
                      pattern="[0-9]*"
                      inputMode="decimal"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={feedback !== 'none'}
                      className={`w-full text-center bg-[#f0f4ff] rounded-[2.5rem] py-10 text-6xl font-black outline-none border-4 transition-all shadow-inner ${
                        feedback === 'correct' ? 'border-emerald-400 text-emerald-600 bg-white shadow-emerald-100/50' :
                        feedback === 'wrong' ? 'border-rose-400 text-rose-600 bg-white shadow-rose-100/50' :
                        'border-slate-50 focus:border-indigo-100 focus:bg-white focus:shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-slate-800'
                      }`}
                      placeholder="?"
                    />
                    <div className="absolute -right-16 top-1/2 -translate-y-1/2 scale-150">
                      {feedback === 'correct' && <CheckCircle2 className="text-emerald-500 drop-shadow-xl" size={36} />}
                      {feedback === 'wrong' && <XCircle className="text-rose-500 drop-shadow-xl" size={36} />}
                    </div>
                  </div>
                </form>

                <div className="space-y-8">
                  {currentQuestion.operation === Operation.PRIME && feedback === 'none' && (
                    <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em]">
                      1 = YES / 0 = NO
                    </p>
                  )}

                  {feedback === 'wrong' && lastCorrectAnswer !== null && (
                    <div className="text-3xl font-black text-rose-500 flex flex-col items-center gap-1 animate-bounce">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-300">CORRECT ANSWER</span>
                      {lastCorrectAnswer}
                    </div>
                  )}

                  <p className={`text-indigo-300 font-black text-[10px] uppercase tracking-[0.3em] transition-opacity duration-300 ${showHint ? 'opacity-0' : 'opacity-100'}`}>
                    HOVER NUMBERS FOR MENTAL TIP
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Interaction Info */}
            <div className="flex flex-col items-center gap-8 pt-6">
              <p className="text-center text-slate-400 font-bold text-xs flex items-center gap-2 opacity-60">
                Press <span className="bg-slate-200 px-2 py-1 rounded-lg text-slate-600 text-[10px] font-black border border-slate-300">Enter</span> to submit
              </p>
              
              <button 
                onClick={navigateToHome}
                className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-[11px] font-black uppercase tracking-[0.3em] group"
              >
                <X size={16} className="group-hover:rotate-90 transition-transform" />
                Quit Session
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.RESULTS && (
          <div className="glass-card rounded-[4rem] p-10 sm:p-20 shadow-2xl border-white space-y-12 animate-in zoom-in-95 duration-500">
            <div className="text-center">
              <div className="inline-block p-8 bg-amber-50 rounded-full mb-8 shadow-2xl shadow-amber-100">
                <Trophy size={72} className="text-amber-500" />
              </div>
              <h2 className="text-5xl font-black text-slate-800 mb-3">Challenge Over!</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm opacity-80">You're getting faster every day.</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'FINAL SCORE', value: stats.score, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                { label: 'ACCURACY', value: `${accuracy}%`, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                { label: 'MAX STREAK', value: stats.maxStreak, color: 'text-amber-600', bg: 'bg-amber-50/50' },
                { label: 'TOTAL DONE', value: stats.totalAnswered, color: 'text-slate-600', bg: 'bg-slate-100/50' },
              ].map((res, i) => (
                <div key={i} className={`${res.bg} p-10 rounded-[2.5rem] border-2 border-white flex flex-col items-center shadow-sm`}>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">{res.label}</span>
                  <span className={`text-4xl sm:text-6xl font-black ${res.color}`}>{res.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <button
                onClick={startGame}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-8 rounded-[2rem] shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 text-lg"
              >
                <RotateCcw size={26} />
                Try Again
              </button>
              <button
                onClick={navigateToHome}
                className="flex-1 bg-white border-4 border-slate-50 hover:border-slate-100 text-slate-700 font-black py-8 rounded-[2rem] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200/50 text-lg"
              >
                <Home size={26} />
                Home
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 text-slate-300 text-[10px] font-black uppercase tracking-[0.5em] opacity-60 flex items-center gap-6">
        <div className="h-[2px] w-12 bg-slate-200" />
        Mental Math Pro V1.1
        <div className="h-[2px] w-12 bg-slate-200" />
      </footer>
    </div>
  );
};

export default App;
