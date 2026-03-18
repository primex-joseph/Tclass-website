"use client";

import { usePathname } from "next/navigation";
import { StudentTopNav } from "@/components/student/top-nav";

/**
 * Conditionally renders the full StudentTopNav.
 * On entrance‐quiz pages (/student/quizzes/[token]) the quiz component
 * renders its own minimal navbar, so we hide the full nav to avoid duplicates.
 */
export function StudentTopNavWrapper() {
  const pathname = usePathname();

  // Match /student/quizzes/<token> — the quiz-taking page
  const isQuizPage = /^\/student\/quizzes\/[^/]+/.test(pathname);

  if (isQuizPage) return null;

  return <StudentTopNav />;
}
