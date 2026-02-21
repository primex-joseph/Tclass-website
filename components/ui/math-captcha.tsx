"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MathCaptchaProps {
  onVerify: (isValid: boolean) => void;
  isVerified: boolean;
}

interface CaptchaChallenge {
  num1: number;
  num2: number;
  operator: "+" | "-";
  answer: number;
}

function generateChallenge(): CaptchaChallenge {
  const operators: ("+" | "-")[] = ["+", "-"];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  // Ensure positive results for subtraction
  let num1 = Math.floor(Math.random() * 20) + 1;
  let num2 = Math.floor(Math.random() * 20) + 1;
  
  if (operator === "-" && num2 > num1) {
    [num1, num2] = [num2, num1]; // Swap to keep result positive
  }
  
  const answer = operator === "+" ? num1 + num2 : num1 - num2;
  
  return { num1, num2, operator, answer };
}

export function MathCaptcha({ onVerify, isVerified }: MathCaptchaProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate challenge on mount
  useEffect(() => {
    setChallenge(generateChallenge());
  }, []);

  // Reset when verified state changes from outside
  useEffect(() => {
    if (!isVerified) {
      setUserAnswer("");
      setError(false);
      setSuccess(false);
      setAttempts(0);
      setChallenge(generateChallenge());
    }
  }, [isVerified]);

  const handleVerify = useCallback(() => {
    if (!challenge || !userAnswer.trim()) return;

    const answer = parseInt(userAnswer, 10);
    
    if (answer === challenge.answer) {
      setSuccess(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setSuccess(false);
      setAttempts((prev) => prev + 1);
      setUserAnswer("");
      
      // Generate new challenge after wrong answer
      setTimeout(() => {
        setChallenge(generateChallenge());
        setError(false);
      }, 1000);
    }
  }, [challenge, userAnswer, onVerify]);

  const handleRefresh = () => {
    setChallenge(generateChallenge());
    setUserAnswer("");
    setError(false);
    setSuccess(false);
  };

  if (!challenge) return null;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all duration-300",
      success 
        ? "border-emerald-500/50 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/20" 
        : error
        ? "border-red-500/50 bg-red-50/50 dark:border-red-500/30 dark:bg-red-950/20"
        : "border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50"
    )}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Security Verification
        </p>
        {!success && (
          <button
            type="button"
            onClick={handleRefresh}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Get new question"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {success ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Verification complete!</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {challenge.num1}
            </span>
            <span className="text-xl font-medium text-slate-600 dark:text-slate-300">
              {challenge.operator}
            </span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {challenge.num2}
            </span>
            <span className="text-xl font-medium text-slate-600 dark:text-slate-300">=</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setUserAnswer(value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleVerify();
                }
              }}
              placeholder="?"
              className={cn(
                "w-16 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all",
                error
                  ? "border-red-500 bg-red-50 text-red-600 dark:border-red-500 dark:bg-red-950/30 dark:text-red-400"
                  : "border-slate-300 bg-white text-slate-800 focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
              )}
              maxLength={2}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-red-600 dark:text-red-400 text-xs mb-2">
              <XCircle className="h-3.5 w-3.5" />
              <span>Wrong answer. Try the new question!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={!userAnswer.trim()}
            className={cn(
              "w-full py-2 px-4 rounded-lg text-sm font-medium transition-all",
              userAnswer.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
            )}
          >
            Verify
          </button>

          {attempts > 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
              Attempt {attempts}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Utility to generate a token (simple hash for server validation)
export function generateCaptchaToken(challenge: { num1: number; num2: number; operator: string; answer: number }): string {
  const data = `${challenge.num1}${challenge.operator}${challenge.num2}=${challenge.answer}`;
  // Simple base64 encoding (in production, use proper server-side validation)
  return btoa(data);
}

// Utility to verify token
export function verifyCaptchaToken(token: string, expectedAnswer: number): boolean {
  try {
    const decoded = atob(token);
    const match = decoded.match(/(\d+)([+-])(\d+)=(\d+)/);
    if (!match) return false;
    return parseInt(match[4], 10) === expectedAnswer;
  } catch {
    return false;
  }
}
