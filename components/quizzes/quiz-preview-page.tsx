"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Clock3, Loader2, PlayCircle, Send } from "lucide-react";

import {
  getRoleQuizPreview,
  submitRoleQuizPreview,
  type AttemptSubmitResponse,
  type QuizQuestion,
  type QuizPlayable,
  type RoleQuizScope,
} from "@/lib/quiz-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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

function deriveExpiry(quiz: QuizPlayable): string | null {
  if (quiz.expiresAt) return quiz.expiresAt;
  if (!quiz.publishedAt || !quiz.durationMinutes) return null;
  const publishedMs = new Date(quiz.publishedAt).getTime();
  if (Number.isNaN(publishedMs)) return null;
  return new Date(publishedMs + quiz.durationMinutes * 60 * 1000).toISOString();
}

function asQuizId(raw: string | string[] | undefined): number {
  if (Array.isArray(raw)) return Number(raw[0]);
  return Number(raw ?? 0);
}

export function QuizPreviewPage({ role }: { role: RoleQuizScope }) {
  const params = useParams();
  const quizId = asQuizId(params.quizId);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizPlayable | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptSubmitResponse | null>(null);
  const [clockTick, setClockTick] = useState(Date.now());
  const autoSubmitRef = useRef(false);

  const managementHref = role === "admin" ? "/admin/quizzes" : "/faculty/quizzes";
  const expiryIso = useMemo(() => (quiz ? deriveExpiry(quiz) : null), [quiz]);
  const isExpired = useMemo(() => {
    if (!expiryIso) return false;
    return new Date(expiryIso).getTime() <= Date.now();
  }, [expiryIso]);

  const remainingSeconds = useMemo(() => {
    if (!started || !endsAt) return quiz?.durationMinutes ? quiz.durationMinutes * 60 : 0;
    const delta = Math.floor((new Date(endsAt).getTime() - clockTick) / 1000);
    return Math.max(0, delta);
  }, [clockTick, endsAt, quiz?.durationMinutes, started]);

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[String(question.id)]?.trim())).length,
    [answers, questions]
  );

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await getRoleQuizPreview(role, quizId);
      setQuiz(payload.quiz);
      setQuestions(payload.questions);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load quiz preview.");
      setQuiz(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [quizId, role]);

  useEffect(() => {
    if (!quizId || Number.isNaN(quizId)) {
      setLoading(false);
      return;
    }
    void loadPreview();
  }, [loadPreview, quizId]);

  const submitPreview = useCallback(
    async (autoSubmitted = false) => {
      if (!quiz || submitting || result) return;
      setSubmitting(true);
      try {
        const payload = await submitRoleQuizPreview(role, quiz.id, {
          answers,
          auto_submitted: autoSubmitted,
        });
        setResult(payload);
        setStarted(false);
        toast.success(payload.message ?? (autoSubmitted ? "Preview auto-submitted." : "Preview submitted."));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to submit preview.";
        if (autoSubmitted) {
          setResult({
            code: "ATTEMPT_TIMEOUT",
            message,
            score: null,
            total: null,
            passed: null,
          });
          setStarted(false);
        }
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [answers, quiz, result, role, submitting]
  );

  useEffect(() => {
    if (!started || !endsAt || result) return;
    const timerId = window.setInterval(() => setClockTick(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [endsAt, result, started]);

  useEffect(() => {
    if (!started || !endsAt || result || submitting) return;
    if (remainingSeconds > 0) return;
    if (autoSubmitRef.current) return;
    autoSubmitRef.current = true;
    void submitPreview(true);
  }, [endsAt, remainingSeconds, result, started, submitPreview, submitting]);

  const startPreview = () => {
    if (!quiz) return;
    if (isExpired) {
      toast.error("This published quiz link has expired.");
      return;
    }
    autoSubmitRef.current = false;
    setResult(null);
    setStarted(true);
    setClockTick(Date.now());
    setEndsAt(new Date(Date.now() + quiz.durationMinutes * 60 * 1000).toISOString());
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading preview...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Preview Unavailable</CardTitle>
            <CardDescription>This quiz preview could not be loaded.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={managementHref}>Back to Quiz Management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href={managementHref}
                className="text-xs font-medium uppercase tracking-[0.12em] text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Back to Quiz Management
              </Link>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">{quiz.title}</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Dry-run preview mode. No real student attempt, grade, or analytics record will be created.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant="outline"
                className={
                  isExpired
                    ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
                }
              >
                {isExpired ? "Link Expired" : "Preview Active"}
              </Badge>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expires: {expiryIso ? new Date(expiryIso).toLocaleString("en-PH") : "Not scheduled"}
              </p>
            </div>
          </div>
        </div>

        {isExpired ? (
          <Card className="border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
                Link Expired
              </CardTitle>
              <CardDescription className="text-rose-700/90 dark:text-rose-300/90">
                This quiz can no longer be accessed because its publish-duration window has ended.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={managementHref}>Return to Management</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Controls</CardTitle>
                <CardDescription>{quiz.instructions || "No instructions were provided for this quiz."}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline">{quiz.passRate}% passing</Badge>
                  <Badge variant="outline">{quiz.durationMinutes} minutes</Badge>
                  <Badge variant="outline">{questions.length} questions</Badge>
                  <Badge variant="outline">{answeredCount} answered</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200"
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatTimer(remainingSeconds)}
                  </Badge>
                  {!started && !result ? (
                    <Button type="button" onClick={startPreview}>
                      <PlayCircle className="h-4 w-4" />
                      Start Preview
                    </Button>
                  ) : null}
                  {started && !result ? (
                    <Button type="button" onClick={() => void submitPreview(false)} disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Submit
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {result ? (
              <Card className="border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200">Preview Result</CardTitle>
                  <CardDescription className="text-blue-700/90 dark:text-blue-300/90">
                    {result.message ?? "Preview submission received."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-sm">
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
              {questions.map((question, index) => {
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
                                disabled={!started || Boolean(result)}
                                onChange={(event) =>
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [answerKey]: event.target.value,
                                  }))
                                }
                              />
                              <span>{choice.text}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <Textarea
                          value={answers[answerKey] ?? ""}
                          disabled={!started || Boolean(result)}
                          onChange={(event) =>
                            setAnswers((prev) => ({
                              ...prev,
                              [answerKey]: event.target.value,
                            }))
                          }
                          placeholder="Type your answer..."
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
