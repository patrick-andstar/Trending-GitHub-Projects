import { useState, useCallback, useEffect } from 'react';
import type { TrendingProject } from '@/types';

const STORAGE_KEY = 'github-trending-bookmarks';

function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage full or unavailable
  }
}

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(loadBookmarks);

  const isBookmarked = useCallback(
    (fullName: string) => bookmarkedIds.includes(fullName),
    [bookmarkedIds]
  );

  const toggleBookmark = useCallback(
    (fullName: string) => {
      setBookmarkedIds((prev) => {
        const next = prev.includes(fullName)
          ? prev.filter((id) => id !== fullName)
          : [...prev, fullName];
        saveBookmarks(next);
        return next;
      });
    },
    []
  );

  const getBookmarkedProjects = useCallback(
    (projects: TrendingProject[]) =>
      projects.filter((p) => bookmarkedIds.includes(p.fullName)),
    [bookmarkedIds]
  );

  return { bookmarkedIds, isBookmarked, toggleBookmark, getBookmarkedProjects };
}
