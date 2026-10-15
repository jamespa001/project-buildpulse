'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FleetSummaryData, RepoSummaryStatus } from '@/types';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Layers,
  Search,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { BackToTop } from '@/components/BackToTop';
import { RepoCard } from '@/components/RepoCard';

// Extended type definition incorporating the runtime isPinned flag
export type EnrichedRepoStatus = RepoSummaryStatus & { isPinned?: boolean };

export default function SummaryLandingPage() {
  const [data, setData] = useState<FleetSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'all' | 'passed' | 'failed' | 'needs_attention' | 'pinned'
  >('all');

  // Search and Sorting States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'updated'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Pinned state tracked by repository fullName derived from backend fetch
  const [pinnedRepoIds, setPinnedRepoIds] = useState<string[]>([]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy, sortOrder]);

  // Toggle pin handler using fullName (optimistically updates UI state)
  const togglePin = (repoFullName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const updated = pinnedRepoIds.includes(repoFullName)
      ? pinnedRepoIds.filter((name: string) => name !== repoFullName)
      : [...pinnedRepoIds, repoFullName];

    setPinnedRepoIds(updated);

    // Instantly update local repository state so the UI reacts right away
    setData((prev: FleetSummaryData | null) => {
      if (!prev || !prev.repositories) return prev;
      return {
        ...prev,
        repositories: prev.repositories.map((repo: EnrichedRepoStatus) =>
          repo.fullName === repoFullName
            ? { ...repo, isPinned: !repo.isPinned }
            : repo,
        ),
      };
    });

    return updated;
  };

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch summary dashboard data and pinned repos in parallel
      const [summaryRes, pinnedRes] = await Promise.all([
        fetch('/api/github/summary?username=jamespa001'),
        fetch('/api/github/repos?username=jamespa001&type=pinned'),
      ]);

      const summaryJson = await summaryRes.json();
      const pinnedJson = await pinnedRes.json();

      const rawRepos: RepoSummaryStatus[] = summaryJson.repositories || [];
      const rawPinned: RepoSummaryStatus[] =
        pinnedJson.repos || pinnedJson.repositories || pinnedJson || [];

      // 2. Build a Set of pinned fullNames for robust cross-endpoint matching
      const pinnedFullNames = new Set<string>(
        rawPinned.map((r: RepoSummaryStatus) => r.fullName),
      );

      // 3. Enrich repositories with the isPinned property
      const enrichedRepos: EnrichedRepoStatus[] = rawRepos.map(
        (repo: RepoSummaryStatus) => ({
          ...repo,
          isPinned: pinnedFullNames.has(repo.fullName),
        }),
      );

      // 4. Set data using summaryJson so all global metrics stay accurate
      setData({
        ...summaryJson,
        repositories: enrichedRepos,
      });

      // 5. Update local state for pinned names
      const pinnedNamesArray = Array.from(pinnedFullNames);
      setPinnedRepoIds(pinnedNamesArray);
    } catch (err) {
      console.error('Failed to fetch fleet summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Filter and Sort Repositories on the fly
  const filteredAndSortedRepos = useMemo(() => {
    if (!data?.repositories) return [];

    return (
      (data.repositories as EnrichedRepoStatus[])
        // 1. Filter by status tab
        .filter((repo: EnrichedRepoStatus) => {
          if (activeTab === 'passed') return repo.latestStatus === 'success';
          if (activeTab === 'failed') return repo.latestStatus === 'failure';
          if (activeTab === 'needs_attention')
            return (
              repo.latestStatus === 'in_progress' ||
              repo.latestStatus === 'queued'
            );
          if (activeTab === 'pinned') return repo.isPinned;
          return true;
        })
        // 2. Filter by search query
        .filter((repo: EnrichedRepoStatus) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            repo.name.toLowerCase().includes(q) ||
            repo.fullName.toLowerCase().includes(q) ||
            (repo.workflowName && repo.workflowName.toLowerCase().includes(q))
          );
        })
        // 3. Sort by chosen attribute & direction
        .sort((a: EnrichedRepoStatus, b: EnrichedRepoStatus) => {
          let comparison = 0;

          if (sortBy === 'name') {
            comparison = a.name.localeCompare(b.name);
          } else if (sortBy === 'duration') {
            const durationA = a.durationSeconds || 0;
            const durationB = b.durationSeconds || 0;
            comparison = durationA - durationB;
          } else if (sortBy === 'updated') {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            comparison = dateA - dateB;
          }

          return sortOrder === 'asc' ? comparison : -comparison;
        })
    );
  }, [data?.repositories, activeTab, searchQuery, sortBy, sortOrder]);

  // Paginate the filtered/sorted results for the grid view
  const paginatedRepos = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedRepos.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedRepos, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedRepos.length / pageSize) || 1;

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                BuildPulse Fleet Summary
              </h1>
              <p className="text-xs text-slate-400">
                Real-time health & CI overview across all monitored repositories
              </p>
            </div>
          </div>

          <button
            onClick={fetchSummary}
            disabled={isLoading}
            aria-label="Refresh Fleet Data"
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span>Refresh Fleet</span>
          </button>
        </header>

        {/* Top KPI Metrics Banner (Global Fleet Stats) */}
        <section
          aria-label="Fleet KPI Overview"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <h2 className="text-xs font-medium uppercase tracking-wider">
                Monitored Repos
              </h2>
              <Layers aria-hidden="true" className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-50">
              {isLoading ? '...' : (data?.totalRepos ?? 0)}
            </div>
            <p className="text-xs text-slate-400">
              Pass Rate:{' '}
              <span className="text-indigo-400 font-semibold">
                {data?.passRate ?? 0}%
              </span>
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">
                Passing Workflows
              </span>
              <CheckCircle2
                aria-hidden="true"
                className="w-4 h-4 text-emerald-400"
              />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {isLoading ? '...' : (data?.passed ?? 0)}
            </div>
            <p className="text-xs text-slate-400">Healthy pipelines</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">
                Failing Workflows
              </span>
              <XCircle aria-hidden="true" className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400">
              {isLoading ? '...' : (data?.failed ?? 0)}
            </div>
            <p className="text-xs text-slate-400">Needs immediate build fix</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">
                Avg Build Duration
              </span>
              <Clock aria-hidden="true" className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-50">
              {isLoading ? '...' : formatDuration(data?.avgDurationSeconds)}
            </div>
            <p className="text-xs text-slate-400">Fleet average build speed</p>
          </div>
        </section>

        {/* Filter Tabs, Search Bar, Sorter & Page Size Controls */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            {/* Filter Tabs */}
            <div
              role="tablist"
              aria-label="Repository Status Filters"
              className="flex flex-wrap items-center gap-2"
            >
              {[
                {
                  key: 'all',
                  label: 'All Repositories',
                  count: data?.totalRepos,
                },
                {
                  key: 'pinned',
                  label: 'Pinned',
                  count: data?.repositories
                    ? (data.repositories as EnrichedRepoStatus[]).filter(
                        (r) => r.isPinned,
                      ).length
                    : 0,
                  color: 'text-indigo-400',
                },
                {
                  key: 'passed',
                  label: 'Passing',
                  count: data?.passed,
                  color: 'text-emerald-400',
                },
                {
                  key: 'failed',
                  label: 'Failing',
                  count: data?.failed,
                  color: 'text-rose-400',
                },
                {
                  key: 'needs_attention',
                  label: 'Needs Attention',
                  count: data?.needsAttention,
                  color: 'text-amber-400',
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() =>
                    setActiveTab(
                      tab.key as
                        | 'all'
                        | 'passed'
                        | 'failed'
                        | 'needs_attention'
                        | 'pinned',
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      aria-hidden="true"
                      className={`px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] ${tab.color || 'text-slate-300'}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input, Sorter & Page Size Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search repos..."
                  aria-label="Search repositories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 text-slate-200 text-xs rounded-xl pl-8 pr-8 py-2 outline-none transition-all placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X aria-hidden="true" className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Field Selector */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'name' | 'duration' | 'updated')
                }
                aria-label="Sort repositories by field"
                className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="duration">Sort by Duration</option>
                <option value="updated">Sort by Last Updated</option>
              </select>

              {/* Sort Order Toggle (ASC / DESC) */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                aria-label={`Current sort order: ${sortOrder}. Click to toggle.`}
                className="min-w-[80px] flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-indigo-400"
                />
                <span className="uppercase text-[10px] font-bold tracking-wider">
                  {sortOrder}
                </span>
              </button>

              {/* Rows Per Page Selector */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label="Repositories per page"
                className="bg-slate-900/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Repository Fleet Cards Grid */}
          <div className="min-h-[420px]">
            {isLoading ? (
              <div
                aria-live="polite"
                className="flex items-center justify-center py-24 text-slate-400 text-sm"
              >
                <RefreshCw
                  aria-hidden="true"
                  className="w-5 h-5 animate-spin mr-2 text-indigo-400"
                />
                <span>Loading repository status across fleet...</span>
              </div>
            ) : paginatedRepos.length === 0 ? (
              <div className="text-center py-24 text-slate-500 text-sm space-y-1">
                <p>
                  No repositories found matching your search or status filter.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-indigo-400 hover:underline cursor-pointer"
                  >
                    Clear search query
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRepos.map((repo: EnrichedRepoStatus, idx: number) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    index={idx}
                    formatDuration={formatDuration}
                    isPinned={Boolean(repo.isPinned)}
                    onTogglePin={(fullName, e) => togglePin(fullName, e)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer Controls */}
          {!isLoading && filteredAndSortedRepos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 mt-6 gap-4">
              <p className="text-xs text-slate-400">
                Showing{' '}
                <span className="font-medium text-slate-200">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-slate-200">
                  {Math.min(
                    currentPage * pageSize,
                    filteredAndSortedRepos.length,
                  )}
                </span>{' '}
                of{' '}
                <span className="font-medium text-slate-200">
                  {filteredAndSortedRepos.length}
                </span>{' '}
                repositories
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Previous
                </button>
                <span
                  aria-current="page"
                  className="text-xs text-slate-400 px-2"
                >
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <BackToTop />
    </main>
  );
}
