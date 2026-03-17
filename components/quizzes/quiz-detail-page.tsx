"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Loader2, Plus, Save, Settings2, Trash2, XCircle } from "lucide-react";

import {
  createRoleQuizItem,
  deleteRoleQuizItem,
  getRoleQuizById,
  getRoleQuizResultDetail,
  listRoleQuizItems,
  listRoleQuizResults,
  updateRoleQuiz,
  updateRoleQuizItem,
  type QuizAttemptDetail,
  type QuizAttemptSummary,
  type QuizItem,
  type QuizItemUpsertPayload,
  type QuizSet,
  type RoleQuizScope,
} from "@/lib/quiz-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ItemFormState = {
  prompt: string;
  choices: [string, string, string, string];
  correctChoiceId: "A" | "B" | "C" | "D";
  order: string;
};

const EMPTY_ITEM_FORM: ItemFormState = {
  prompt: "",
  choices: ["", "", "", ""],
  correctChoiceId: "A",
  order: "1",
};

function asQuizId(raw: string | string[] | undefined): number {
  if (Array.isArray(raw)) return Number(raw[0]);
  return Number(raw ?? 0);
}

export function QuizDetailPage({ role }: { role: RoleQuizScope }) {
  const params = useParams();
  const quizId = asQuizId(params.quizId);
  const managementHref = role === "admin" ? "/admin/quizzes" : "/faculty/quizzes";

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [items, setItems] = useState<QuizItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [results, setResults] = useState<QuizAttemptSummary[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuizItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(EMPTY_ITEM_FORM);
  const [itemSaving, setItemSaving] = useState(false);

  const [settingsSaving, setSettingsSaving] = useState(false);
  const [shuffleItems, setShuffleItems] = useState(true);
  const [shuffleChoices, setShuffleChoices] = useState(true);

  const [resultQuery, setResultQuery] = useState("");
  const [resultStatus, setResultStatus] = useState<"all" | "passed" | "failed">("all");
  const [resultDateFrom, setResultDateFrom] = useState("");
  const [resultDateTo, setResultDateTo] = useState("");
  const [resultDetailOpen, setResultDetailOpen] = useState(false);
  const [resultDetailLoading, setResultDetailLoading] = useState(false);
  const [resultDetail, setResultDetail] = useState<QuizAttemptDetail | null>(null);

  const loadQuiz = useCallback(async () => {
    if (!quizId || Number.isNaN(quizId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const payload = await getRoleQuizById(role, quizId);
      setQuiz(payload);
      setShuffleItems(payload.shuffleItems);
      setShuffleChoices(payload.shuffleChoices);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load quiz.");
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [quizId, role]);

  const loadItems = useCallback(async () => {
    if (!quizId || Number.isNaN(quizId)) return;
    setItemsLoading(true);
    try {
      const payload = await listRoleQuizItems(role, quizId);
      setItems(payload);
    } catch (error) {
      setItems([]);
      toast.error(error instanceof Error ? error.message : "Unable to load quiz items.");
    } finally {
      setItemsLoading(false);
    }
  }, [quizId, role]);

  const loadResults = useCallback(async () => {
    if (!quizId || Number.isNaN(quizId)) return;
    setResultsLoading(true);
    try {
      const payload = await listRoleQuizResults(role, quizId, {
        q: resultQuery.trim() || undefined,
        status: resultStatus,
        dateFrom: resultDateFrom || undefined,
        dateTo: resultDateTo || undefined,
      });
      setResults(payload);
    } catch (error) {
      setResults([]);
      toast.error(error instanceof Error ? error.message : "Unable to load results.");
    } finally {
      setResultsLoading(false);
    }
  }, [quizId, resultDateFrom, resultDateTo, resultQuery, resultStatus, role]);

  useEffect(() => {
    void loadQuiz();
    void loadItems();
  }, [loadItems, loadQuiz]);

  useEffect(() => {
    if (activeTab !== "results") return;
    void loadResults();
  }, [activeTab, loadResults]);

  const totalCorrect = useMemo(() => results.reduce((sum, row) => sum + row.correctCount, 0), [results]);
  const totalWrong = useMemo(() => results.reduce((sum, row) => sum + row.wrongCount, 0), [results]);

  const openCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      ...EMPTY_ITEM_FORM,
      order: String(items.length + 1),
    });
    setItemDialogOpen(true);
  };

  const openEditItem = (item: QuizItem) => {
    setEditingItem(item);
    setItemForm({
      prompt: item.prompt,
      choices: [
        item.choices[0]?.text ?? "",
        item.choices[1]?.text ?? "",
        item.choices[2]?.text ?? "",
        item.choices[3]?.text ?? "",
      ],
      correctChoiceId: (item.correctChoiceId as "A" | "B" | "C" | "D") ?? "A",
      order: String(item.order),
    });
    setItemDialogOpen(true);
  };

  const buildItemPayload = (): QuizItemUpsertPayload | null => {
    const prompt = itemForm.prompt.trim();
    if (!prompt) {
      toast.error("Question prompt is required.");
      return null;
    }

    const cleanedChoices = itemForm.choices.map((choice) => choice.trim());
    if (cleanedChoices.some((choice) => !choice)) {
      toast.error("All 4 choices are required.");
      return null;
    }

    const order = Number(itemForm.order);
    if (!Number.isFinite(order) || order < 1) {
      toast.error("Order must be 1 or higher.");
      return null;
    }

    return {
      prompt,
      choices: cleanedChoices.map((text, index) => ({
        id: String.fromCharCode(65 + index),
        text,
      })),
      correct_choice_id: itemForm.correctChoiceId,
      order,
    };
  };

  const saveItem = async () => {
    if (!quiz) return;
    const payload = buildItemPayload();
    if (!payload) return;
    setItemSaving(true);
    try {
      if (editingItem) {
        await updateRoleQuizItem(role, quiz.id, editingItem.id, payload);
        toast.success("Quiz item updated.");
      } else {
        await createRoleQuizItem(role, quiz.id, payload);
        toast.success("Quiz item created.");
      }
      setItemDialogOpen(false);
      await loadItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save quiz item.");
    } finally {
      setItemSaving(false);
    }
  };

  const removeItem = async (item: QuizItem) => {
    const confirmed = window.confirm(`Delete item #${item.order}?`);
    if (!confirmed) return;
    try {
      await deleteRoleQuizItem(role, item.quizId, item.id);
      toast.success("Quiz item deleted.");
      await loadItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete item.");
    }
  };

  const saveSettings = async () => {
    if (!quiz) return;
    setSettingsSaving(true);
    try {
      await updateRoleQuiz(role, quiz.id, {
        title: quiz.title,
        instructions: quiz.instructions,
        pass_rate: quiz.passRate,
        duration_minutes: quiz.durationMinutes,
        status: quiz.status,
        quiz_type: quiz.quizType,
        offering_id: quiz.offeringId,
        course_program_id: quiz.courseProgramId,
        shuffle_items: shuffleItems,
        shuffle_choices: shuffleChoices,
      });
      toast.success("Quiz settings saved.");
      await loadQuiz();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const openResultDetail = async (attempt: QuizAttemptSummary) => {
    setResultDetailOpen(true);
    setResultDetailLoading(true);
    try {
      const payload = await getRoleQuizResultDetail(role, attempt.quizId, attempt.attemptId);
      setResultDetail(payload);
    } catch (error) {
      setResultDetail(null);
      toast.error(error instanceof Error ? error.message : "Unable to load result detail.");
    } finally {
      setResultDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600 dark:text-slate-300">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading quiz detail...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>This quiz no longer exists or cannot be accessed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={managementHref}>Back to Quiz Management</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_40%),linear-gradient(180deg,#f8fafc,#eef2ff_40%,#f8fafc)] dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.24),transparent_44%),linear-gradient(180deg,#020617,#020b16_50%,#020617)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        <Card className="border-slate-200/80 bg-white/92 dark:border-white/10 dark:bg-slate-900/70">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link href={managementHref}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{quiz.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">{quiz.instructions || "No instructions provided."}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">By: {quiz.createdByName}</Badge>
              <Badge variant="outline">{quiz.quizType === "regular" ? "Regular" : "Entrance"}</Badge>
              <Badge variant="outline">{quiz.passRate}% passing</Badge>
              <Badge variant="outline">{quiz.durationMinutes} mins</Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <Card className="border-slate-200/80 bg-white/92 dark:border-white/10 dark:bg-slate-900/70">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Quiz Items</CardTitle>
                  <CardDescription>MCQ only. Exactly 4 choices and one correct answer per item.</CardDescription>
                </div>
                <Button type="button" onClick={openCreateItem}>
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {itemsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading items...
                  </div>
                ) : items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                    No items yet. Add your first question.
                  </p>
                ) : (
                  items
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            #{item.order} {item.prompt}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEditItem(item)}>
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => void removeItem(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {item.choices.map((choice) => (
                            <div
                              key={`${item.id}-${choice.id}`}
                              className={`rounded-lg border px-3 py-2 text-sm ${
                                choice.id.toUpperCase() === item.correctChoiceId.toUpperCase()
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-200"
                                  : "border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200"
                              }`}
                            >
                              <span className="font-semibold">{choice.id}.</span> {choice.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card className="border-slate-200/80 bg-white/92 dark:border-white/10 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle>Student Attempt Results</CardTitle>
                <CardDescription>Review score, mistakes, and correct answers per attempt.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  <Input
                    placeholder="Search student..."
                    value={resultQuery}
                    onChange={(event) => setResultQuery(event.target.value)}
                    className="lg:col-span-2"
                  />
                  <select
                    value={resultStatus}
                    onChange={(event) => setResultStatus(event.target.value as "all" | "passed" | "failed")}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/15 dark:bg-slate-950/40"
                  >
                    <option value="all">All status</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Input type="date" value={resultDateFrom} onChange={(event) => setResultDateFrom(event.target.value)} />
                  <Input type="date" value={resultDateTo} onChange={(event) => setResultDateTo(event.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => void loadResults()}>
                    Apply
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">Attempts: {results.length}</Badge>
                  <Badge variant="outline">Correct: {totalCorrect}</Badge>
                  <Badge variant="outline">Wrong: {totalWrong}</Badge>
                </div>
                {resultsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading results...
                  </div>
                ) : results.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                    No attempt results yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {results.map((attempt) => (
                      <button
                        key={attempt.attemptId}
                        type="button"
                        onClick={() => void openResultDetail(attempt)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-left hover:border-blue-300 hover:bg-blue-50/40 dark:border-white/10 dark:hover:border-blue-500/60 dark:hover:bg-blue-500/10"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{attempt.studentName}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant="outline">
                              {attempt.score}/{attempt.total}
                            </Badge>
                            <Badge variant="outline">Correct {attempt.correctCount}</Badge>
                            <Badge variant="outline">Wrong {attempt.wrongCount}</Badge>
                            <Badge variant="outline" className={attempt.passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
                              {attempt.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "-"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="border-slate-200/80 bg-white/92 dark:border-white/10 dark:bg-slate-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Randomization Settings
                </CardTitle>
                <CardDescription>Control how student attempts are ordered.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10">
                  <input type="checkbox" className="mt-0.5" checked={shuffleItems} onChange={(event) => setShuffleItems(event.target.checked)} />
                  <span>
                    Shuffle question order per student attempt
                    <span className="block text-xs text-slate-500 dark:text-slate-400">Each student sees a unique item ordering.</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-white/10">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={shuffleChoices}
                    onChange={(event) => setShuffleChoices(event.target.checked)}
                  />
                  <span>
                    Shuffle choices per question
                    <span className="block text-xs text-slate-500 dark:text-slate-400">A-D ordering varies per attempt.</span>
                  </span>
                </label>
                <Button type="button" onClick={() => void saveSettings()} disabled={settingsSaving}>
                  {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Create Item"}</DialogTitle>
            <DialogDescription>Use exactly 4 choices and select one correct answer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Prompt</label>
              <Textarea
                value={itemForm.prompt}
                rows={3}
                onChange={(event) => setItemForm((prev) => ({ ...prev, prompt: event.target.value }))}
                placeholder="Type question prompt..."
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {itemForm.choices.map((choice, index) => {
                const choiceId = String.fromCharCode(65 + index) as "A" | "B" | "C" | "D";
                return (
                  <div key={choiceId} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Choice {choiceId}</label>
                    <Input
                      value={choice}
                      onChange={(event) =>
                        setItemForm((prev) => {
                          const nextChoices = [...prev.choices] as [string, string, string, string];
                          nextChoices[index] = event.target.value;
                          return { ...prev, choices: nextChoices };
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Correct Choice</label>
                <select
                  value={itemForm.correctChoiceId}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, correctChoiceId: event.target.value as "A" | "B" | "C" | "D" }))}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-white/15 dark:bg-slate-950/35"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Order</label>
                <Input value={itemForm.order} onChange={(event) => setItemForm((prev) => ({ ...prev, order: event.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)} disabled={itemSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void saveItem()} disabled={itemSaving}>
              {itemSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingItem ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultDetailOpen} onOpenChange={setResultDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attempt Detail</DialogTitle>
            <DialogDescription>Question-level right/wrong breakdown for this submission.</DialogDescription>
          </DialogHeader>
          {resultDetailLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading detail...
            </div>
          ) : resultDetail ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Student: {resultDetail.attempt.studentName}</Badge>
                <Badge variant="outline">
                  Score: {resultDetail.attempt.score}/{resultDetail.attempt.total}
                </Badge>
                <Badge variant="outline">Correct: {resultDetail.attempt.correctCount}</Badge>
                <Badge variant="outline">Wrong: {resultDetail.attempt.wrongCount}</Badge>
              </div>
              <div className="space-y-2">
                {resultDetail.items.map((item, index) => (
                  <div key={`${item.itemId}-${index}`} className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.prompt}</p>
                      <Badge variant="outline" className={item.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}>
                        {item.isCorrect ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <XCircle className="mr-1 h-3.5 w-3.5" />}
                        {item.isCorrect ? "Correct" : "Wrong"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Student: {item.selectedChoiceId ?? "-"} {item.selectedChoiceText ?? ""}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Correct: {item.correctChoiceId} {item.correctChoiceText ?? ""}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
