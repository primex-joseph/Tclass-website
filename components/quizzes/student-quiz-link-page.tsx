"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Clock3, GraduationCap, Loader2, Mail, PlayCircle, Send } from "lucide-react";

import {
  startStudentQuizAttempt,
  submitStudentQuizAttempt,
  validateStudentQuizLink,
  type AttemptSubmitResponse,
  type QuizPlayable,
  type QuizQuestion,
} from "@/lib/quiz-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePortalSessionUser } from "@/lib/portal-session-user";

type LinkState = "loading" | "active" | "expired" | "unavailable";

function formatTimer(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatReadableTimer(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function asToken(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}

function deriveLocalExpiry(quiz: QuizPlayable): number | null {
  if (!quiz.publishedAt || !quiz.durationMinutes) return null;
  const publishedMs = new Date(quiz.publishedAt).getTime();
  if (Number.isNaN(publishedMs)) return null;
  return publishedMs + quiz.durationMinutes * 60 * 1000;
}

/* ────────────────────────────────────────────
 * Minimal Navbar for Entrance Exam (logo + timer)
 * ──────────────────────────────────────────── */
function EntranceExamNavbar({ remainingSeconds, started }: { remainingSeconds: number; started: boolean }) {
  const urgent = remainingSeconds <= 60;
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-white/12 dark:bg-slate-950/95">
      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 p-1.5 shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">TClass</span>
            <span className="hidden sm:inline-flex text-[10px] rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-blue-700 dark:border-blue-300/30 dark:bg-blue-500/20 dark:text-blue-200">
              Entrance Exam
            </span>
          </div>
          {/* Timer */}
          {started && (
            <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold tracking-wider transition-colors ${
              urgent
                ? "animate-pulse border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-300"
                : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300"
            }`}>
              <Clock3 className="h-4 w-4" />
              {formatReadableTimer(remainingSeconds)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function StudentQuizLinkPage() {
  const params = useParams();
  const token = asToken(params.token);
  const { sessionUser, sessionResolved } = usePortalSessionUser();
  const [linkState, setLinkState] = useState<LinkState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizPlayable | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptSubmitResponse | null>(null);
  const [finalRemainingSeconds, setFinalRemainingSeconds] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [clockTick, setClockTick] = useState(Date.now());
  const autoSubmitRef = useRef(false);
  const sessionRole = (sessionUser?.role ?? "").trim().toLowerCase();
  const hasStudentSession = Boolean(sessionUser && sessionRole === "student");
  const loginHref = `/login?redirect=${encodeURIComponent(`/student/quizzes/${token}`)}`;
  const isEntrance = quiz?.quizType === "entrance";

  const remainingSeconds = useMemo(() => {
    if (!started || !endsAt) return quiz?.durationMinutes ? quiz.durationMinutes * 60 : 0;
    const delta = Math.floor((new Date(endsAt).getTime() - clockTick) / 1000);
    return Math.max(0, delta);
  }, [clockTick, endsAt, quiz?.durationMinutes, started]);

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[String(question.id)]?.trim())).length,
    [answers, questions]
  );

  const loadLinkState = useCallback(async () => {
    setLinkState("loading");
    try {
      const payload = await validateStudentQuizLink(token);
      const localExpiry = payload.quiz ? deriveLocalExpiry(payload.quiz) : null;
      const locallyExpired = localExpiry != null && Date.now() >= localExpiry;
      setMessage(payload.message);
      setQuiz(payload.quiz);
      setQuestions(payload.questions);
      setAttemptId(payload.attemptId);
      setEndsAt(payload.endsAt);
      setStarted(Boolean(payload.attemptId && payload.endsAt));
      setResult(null);
      setLinkState(locallyExpired ? "expired" : payload.status);
      if (locallyExpired) {
        setMessage("This quiz link has expired and can no longer be accessed.");
      }
    } catch (error) {
      setLinkState("unavailable");
      setQuiz(null);
      setQuestions([]);
      setMessage(error instanceof Error ? error.message : "Unable to validate quiz link.");
    }
  }, [token]);

  useEffect(() => {
    if (!sessionResolved) return;
    if (!hasStudentSession) {
      setLinkState("unavailable");
      setMessage("Please sign in with your student credentials to access this entrance quiz.");
      return;
    }
    if (!token) {
      setLinkState("unavailable");
      setMessage("Invalid quiz link token.");
      return;
    }
    void loadLinkState();
  }, [hasStudentSession, loadLinkState, sessionResolved, token]);

  useEffect(() => {
    if (!started || !endsAt || result) return;
    const timerId = window.setInterval(() => setClockTick(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [endsAt, result, started]);

  const submitAttempt = useCallback(
    async (autoSubmitted = false) => {
      if (!attemptId || submitting || result) return;
      setSubmitting(true);
      const currentRemaining = remainingSeconds;
      try {
        const payload = await submitStudentQuizAttempt(attemptId, {
          answers,
          auto_submitted: autoSubmitted,
        });
        setResult(payload);
        setFinalRemainingSeconds(currentRemaining);
        setStarted(false);
        toast.success(payload.message ?? (autoSubmitted ? "Time is up. Quiz auto-submitted." : "Quiz submitted."));
      } catch (error) {
        const text = error instanceof Error ? error.message : "Failed to submit quiz.";
        setResult({
          code: autoSubmitted ? "ATTEMPT_TIMEOUT" : null,
          message: text,
          score: null,
          total: null,
          passed: null,
        });
        setStarted(false);
        toast.error(text);
      } finally {
        setSubmitting(false);
      }
    },
    [answers, attemptId, result, submitting]
  );

  useEffect(() => {
    if (!started || !endsAt || result || submitting) return;
    if (remainingSeconds > 0) return;
    if (autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    void submitAttempt(true);
  }, [endsAt, remainingSeconds, result, started, submitAttempt, submitting]);

  const handleStart = async () => {
    setSubmitting(true);
    try {
      const payload = await startStudentQuizAttempt(token);
      setAttemptId(payload.attemptId);
      setEndsAt(payload.endsAt);
      if (payload.questions && payload.questions.length > 0) {
        setQuestions(payload.questions);
      }
      setStarted(true);
      setClockTick(Date.now());
      setResult(null);
      setFinalRemainingSeconds(null);
      autoSubmitRef.current = false;
      await loadLinkState();
      toast.success("Quiz started.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Unable to start quiz.";
      toast.error(text);
      if (text.toUpperCase().includes("EXPIRED")) {
        setLinkState("expired");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ────────── ENTRANCE QUIZ: hide results ────────── */
  const isEntranceResult = isEntrance && result;
  const showScoreResult = result && !isEntrance;

  if (!sessionResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Verifying student session...
      </div>
    );
  }

  if (!hasStudentSession) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-12">
        <Card className="w-full border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-300">Student Login Required</CardTitle>
            <CardDescription className="text-amber-700/90 dark:text-amber-300/90">
              Sign in with your existing student credentials before opening this entrance quiz link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={loginHref}>Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (linkState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Validating quiz link...
      </div>
    );
  }

  if (linkState === "expired") {
    return (
      <>
        {isEntrance && <EntranceExamNavbar remainingSeconds={0} started={false} />}
        <div className={`mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-12 ${isEntrance ? "pt-20" : ""}`}>
          <Card className="w-full border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
                Link Expired
              </CardTitle>
              <CardDescription className="text-rose-700/90 dark:text-rose-300/90">
                {message ?? "This quiz link is no longer accessible because the time window has ended."}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-rose-700 dark:text-rose-300">
              Contact your instructor or admin if you need a new quiz link.
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (linkState === "unavailable" || !quiz) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Quiz Unavailable</CardTitle>
            <CardDescription>{message ?? "This quiz link cannot be accessed right now."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* For entrance quizzes: render minimal navbar instead of the full student nav */}
      {isEntrance && <EntranceExamNavbar remainingSeconds={remainingSeconds} started={started} />}

      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${isEntrance ? "pt-14" : ""}`}>
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">{quiz.title}</h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {quiz.instructions || "Follow the instructions and submit before timer reaches 00:00."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{quiz.passRate}% passing</Badge>
                <Badge variant="outline">{quiz.durationMinutes} minutes</Badge>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attempt Status</CardTitle>
              <CardDescription>{message ?? "Your quiz session is tracked in real-time."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/60 dark:bg-blue-900/25">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Time Remaining</p>
                <p className="mt-1 text-4xl font-black tracking-wide text-blue-900 dark:text-blue-100 sm:text-5xl">{formatReadableTimer(remainingSeconds)}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatTimer(remainingSeconds)}
                </Badge>
                <Badge variant="outline">{answeredCount} answered</Badge>
                </div>
                {!started && !result ? (
                  <Button type="button" onClick={() => void handleStart()} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                    Start Quiz
                  </Button>
                ) : null}
                {started && !result && answeredCount === questions.length ? (
                  <Button type="button" onClick={() => void submitAttempt(false)} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit Quiz
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* ────── Entrance Exam: "Results will be emailed" ────── */}
          {isEntranceResult ? (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/80 to-cyan-50/60 dark:border-blue-900/60 dark:from-blue-900/20 dark:to-cyan-900/15">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <CheckCircle2 className="h-5 w-5" />
                  Exam Submitted Successfully
                </CardTitle>
                <CardDescription className="text-blue-700/90 dark:text-blue-300/90">
                  {result.message ?? "Your entrance exam has been submitted."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {finalRemainingSeconds !== null && quiz && (
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-blue-200 bg-white/50 p-4 dark:border-blue-800/40 dark:bg-slate-900/40">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Time Taken</p>
                      <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {formatReadableTimer(quiz.durationMinutes * 60 - finalRemainingSeconds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Remaining</p>
                      <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {formatReadableTimer(finalRemainingSeconds)}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-white/70 p-4 dark:border-blue-800/50 dark:bg-slate-900/50">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-300" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Results will be sent to your email
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      You will receive an email notification with the results of your entrance examination. Please check your inbox (and spam folder) regularly.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You may now close this page. Thank you for taking the entrance exam!
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* ────── Regular Quiz: show score result ────── */}
          {showScoreResult ? (
            <Card className="border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">Submission Result</CardTitle>
                <CardDescription className="text-blue-700/90 dark:text-blue-300/90">
                  {result.message ?? "Quiz submission processed."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">Score: {result.score ?? "-"}</Badge>
                <Badge variant="outline">Total: {result.total ?? "-"}</Badge>
                <Badge
                  variant="outline"
                  className={
                    result.passed == null
                      ? ""
                      : result.passed
                      ? "border-emerald-300 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
                      : "border-rose-300 text-rose-700 dark:border-rose-900/60 dark:text-rose-300"
                  }
                >
                  {result.passed == null ? "Result Pending" : result.passed ? "Passed" : "Failed"}
                </Badge>
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-4">
            {started && !result && questions.length > 0 ? (
              (() => {
                const currentQuestion = questions[currentQuestionIndex];
                if (!currentQuestion) return null;
                const answerKey = String(currentQuestion.id);
                const currentAnswer = answers[answerKey] ?? "";
                const hasAnsweredCurrent = currentAnswer.trim() !== "";
                const isLastQuestion = currentQuestionIndex === questions.length - 1;

                return (
                  <Card key={currentQuestion.id}>
                    <CardHeader>
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">
                        {currentQuestionIndex + 1}. {currentQuestion.prompt}
                      </CardTitle>
                      <CardDescription>{currentQuestion.points} point(s)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentQuestion.choices.length > 0 ? (
                        <div className="space-y-3">
                          {currentQuestion.choices.map((choice) => (
                            <label
                              key={`${currentQuestion.id}-${choice.id}`}
                              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-800/50"
                            >
                              <input
                                type="radio"
                                className="h-4 w-4"
                                name={`question-${currentQuestion.id}`}
                                value={choice.id}
                                checked={answers[answerKey] === choice.id}
                                disabled={submitting}
                                onChange={(event) =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [answerKey]: event.target.value,
                                  }))
                                }
                              />
                              <span className="text-base">{choice.text}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <Textarea
                          className="min-h-[120px] text-base"
                          value={currentAnswer}
                          disabled={submitting}
                          onChange={(event) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [answerKey]: event.target.value,
                            }))
                          }
                          placeholder="Type your answer here..."
                        />
                      )}
                    </CardContent>
                    <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/20">
                      <div>
                        {currentQuestionIndex > 0 ? (
                          <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex((p) => p - 1)}
                            disabled={submitting}
                          >
                            Previous
                          </Button>
                        ) : (
                          <div />
                        )}
                      </div>
                      <div>
                        {!isLastQuestion ? (
                          <Button
                            onClick={() => setCurrentQuestionIndex((p) => p + 1)}
                            disabled={!hasAnsweredCurrent}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            onClick={() => void submitAttempt(false)}
                            disabled={!hasAnsweredCurrent || submitting}
                          >
                            {submitting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })()
            ) : (
              <>
                {result &&
                  !isEntranceResult &&
                  questions.map((question, index) => {
                    const answerKey = String(question.id);
                    return (
                      <Card key={question.id || index}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {index + 1}. {question.prompt}
                          </CardTitle>
                          <CardDescription>{question.points} point(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {question.choices.length > 0 ? (
                            <div className="space-y-2">
                              {question.choices.map((choice) => (
                                <label
                                  key={`${question.id}-${choice.id}`}
                                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/15"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={choice.id}
                                    checked={answers[answerKey] === choice.id}
                                    disabled
                                  />
                                  <span>{choice.text}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <Textarea
                              value={answers[answerKey] ?? ""}
                              disabled
                              placeholder="Type your answer..."
                            />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
