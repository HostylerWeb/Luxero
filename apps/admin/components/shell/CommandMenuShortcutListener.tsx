"use client";

import { useCommandMenuShortcut } from "./CommandMenu";
import { useCommandMenu } from "./CommandMenuContext";

export function CommandMenuShortcutListener() {
  const { toggle } = useCommandMenu();
  useCommandMenuShortcut(toggle);
  return null;
}
