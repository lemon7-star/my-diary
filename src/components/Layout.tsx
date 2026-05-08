import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { DiaryEntry, Tag } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { deriveTagsFromDiaries, getDiarySummaries } from '../utils/storage';
import { Sidebar } from './Sidebar';

export interface DiaryIndexOutletContext {
  diaries: DiaryEntry[];
  tags: Tag[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function Layout() {
  const { user } = useAuth();
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setDiaries([]);
      setTags([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const nextDiaries = await getDiarySummaries(user.id);
    setDiaries(nextDiaries);
    setTags(deriveTagsFromDiaries(nextDiaries));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        if (!user?.id) {
          if (cancelled) return;
          setDiaries([]);
          setTags([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const nextDiaries = await getDiarySummaries(user.id);
        if (cancelled) return;
        setDiaries(nextDiaries);
        setTags(deriveTagsFromDiaries(nextDiaries));
        setLoading(false);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [user?.id]);

  return (
    <div className="flex min-h-screen bg-[#faf8ff]">
      <Sidebar diaries={diaries} tags={tags} loading={loading} />
      <main className="ml-[18rem] flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet context={{ diaries, tags, loading, refresh } satisfies DiaryIndexOutletContext} />
        </div>
      </main>
    </div>
  );
}
