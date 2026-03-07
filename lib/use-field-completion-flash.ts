"use client";

import { RefObject, useEffect } from "react";

const FLASH_CLASS = "field-complete-flash";
const DONE_CLASS = "field-complete";
const DONE_CONTROL_CLASS = "field-complete-control";
const FLASH_DURATION_MS = 1600;

function isFieldComplete(container: HTMLElement): boolean {
  const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (fileInput) return Boolean(fileInput.files && fileInput.files.length > 0);

  const radioInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  if (radioInputs.length > 0) return radioInputs.some((input) => input.checked);

  const checkboxInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  if (checkboxInputs.length > 0) return checkboxInputs.some((input) => input.checked);

  const select = container.querySelector<HTMLSelectElement>("select");
  if (select) return select.value.trim().length > 0;

  const input = container.querySelector<HTMLInputElement>("input");
  if (input) return input.value.trim().length > 0;

  const textarea = container.querySelector<HTMLTextAreaElement>("textarea");
  if (textarea) return textarea.value.trim().length > 0;

  return false;
}

export function useFieldCompletionFlash(formRef: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const completionState = new WeakMap<HTMLElement, boolean>();
    const timerMap = new WeakMap<HTMLElement, number>();

    const containers = Array.from(form.querySelectorAll<HTMLElement>("[data-field]"));
    const syncDoneClasses = (container: HTMLElement, complete: boolean) => {
      if (complete) {
        container.classList.add(DONE_CLASS);
      } else {
        container.classList.remove(DONE_CLASS);
      }

      const controls = Array.from(
        container.querySelectorAll<HTMLElement>("input, select, textarea, [role='combobox']")
      );
      controls.forEach((control) => {
        if (complete) {
          control.classList.add(DONE_CONTROL_CLASS);
        } else {
          control.classList.remove(DONE_CONTROL_CLASS);
        }
      });
    };

    containers.forEach((container) => {
      const complete = isFieldComplete(container);
      completionState.set(container, complete);
      syncDoneClasses(container, complete);
    });

    const triggerFlash = (container: HTMLElement) => {
      const previousTimer = timerMap.get(container);
      if (previousTimer) {
        window.clearTimeout(previousTimer);
      }

      container.classList.remove(FLASH_CLASS);
      // Force reflow so animation can replay.
      void container.offsetWidth;
      container.classList.add(FLASH_CLASS);

      const timeoutId = window.setTimeout(() => {
        container.classList.remove(FLASH_CLASS);
      }, FLASH_DURATION_MS);
      timerMap.set(container, timeoutId);
    };

    const handleFieldEvent = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const container = target.closest<HTMLElement>("[data-field]");
      if (!container || !form.contains(container)) return;

      const wasComplete = completionState.get(container) ?? false;
      const isComplete = isFieldComplete(container);
      completionState.set(container, isComplete);
      syncDoneClasses(container, isComplete);

      if (isComplete && !wasComplete) {
        triggerFlash(container);
      }
    };

    form.addEventListener("input", handleFieldEvent, true);
    form.addEventListener("change", handleFieldEvent, true);
    form.addEventListener("blur", handleFieldEvent, true);

    return () => {
      form.removeEventListener("input", handleFieldEvent, true);
      form.removeEventListener("change", handleFieldEvent, true);
      form.removeEventListener("blur", handleFieldEvent, true);
      containers.forEach((container) => {
        const timeoutId = timerMap.get(container);
        if (timeoutId) window.clearTimeout(timeoutId);
        container.classList.remove(FLASH_CLASS, DONE_CLASS);
        const controls = container.querySelectorAll<HTMLElement>("input, select, textarea, [role='combobox']");
        controls.forEach((control) => control.classList.remove(DONE_CONTROL_CLASS));
      });
    };
  }, [formRef]);
}
