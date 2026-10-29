import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { Task, TasksResponse, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  LogOut,
  Sparkles,
} from 'lucide-react';

const CATEGORY_TAGS = ['Writing', 'Ritual', 'Editorial', 'Mindful', 'Focus'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const { showToast } = useUiStore();

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 15;

  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newTags, setNewTags] = useState<string[]>(['Mindful']);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Completed Archive collapsed state
  const [isArchiveOpen, setIsArchiveOpen] = useState(true);

  // Modals state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Fetch tasks using TanStack Query
  const { data, isLoading, isError, error } = useQuery<TasksResponse>({
    queryKey: ['tasks', page, limit, searchTerm, selectedPriority],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sort', '-createdAt');
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedPriority) params.append('priority', selectedPriority);

      const res = await apiClient.get<TasksResponse>(`/tasks?${params.toString()}`);
      return res.data;
    },
  });

  const tasks = data?.tasks || [];
  const pagination = data?.pagination;

  // Split active and completed tasks
  const activeTasks = useMemo(
    () => tasks.filter((t) => !t.completed && t.status !== 'completed'),
    [tasks]
  );
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.completed || t.status === 'completed'),
    [tasks]
  );

  // Total commitments calculation for pacing widget
  const totalCount = tasks.length;
  const completedCount = completedTasks.length;
  const percentageCleared = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (payload: CreateTaskInput) => {
      const res = await apiClient.post('/tasks', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTitle('');
      setNewDescription('');
      setIsFormExpanded(false);
      showToast('Task added to journal.', 'success');
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err), 'error');
    },
  });

  // Toggle Completion Mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const res = await apiClient.put(`/tasks/${id}`, {
        completed,
        status: completed ? 'completed' : 'pending',
      });
      return res.data;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousData = queryClient.getQueryData<TasksResponse>(['tasks', page, limit, searchTerm, selectedPriority]);

      if (previousData) {
        queryClient.setQueryData<TasksResponse>(['tasks', page, limit, searchTerm, selectedPriority], {
          ...previousData,
          tasks: previousData.tasks.map((task) =>
            task._id === id
              ? { ...task, completed, status: completed ? 'completed' : 'pending' }
              : task
          ),
        });
      }
      return { previousData };
    },
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['tasks', page, limit, searchTerm, selectedPriority], context.previousData);
      }
      showToast(getApiErrorMessage(err), 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTaskInput }) => {
      const res = await apiClient.put(`/tasks/${id}`, updates);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
      showToast('Changes saved to journal.', 'success');
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err), 'error');
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/tasks/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDeletingTaskId(null);
      showToast('Task quietly removed.', 'info');
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err), 'error');
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTaskMutation.mutate({
      title: newTitle.trim(),
      description: newDescription.trim() || 'No additional notes',
      priority: newPriority,
      tags: newTags,
      completed: false,
    });
  };

  const handleLogout = () => {
    logout();
    showToast('Signed out peacefully.', 'info');
  };

  // Journal Edition string (e.g. "JOURNAL • THURSDAY EDITION")
  const editionDate = useMemo(() => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return `JOURNAL • ${dayName} EDITION`;
  }, []);

  return (
    <div className="workspace-container">
      {/* Editorial Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-terracotta)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            ✦
          </div>
          <div>
            <h1
              className="font-serif"
              style={{
                fontSize: '21px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              TaskTrackr
            </h1>
            <p
              style={{
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              {editionDate}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>
            Hi, <strong>{user?.name || 'Friend'}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--transition-fast)',
            }}
            title="Log out peacefully"
          >
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Module 1: Persistent Quick Add Form */}
      <section style={{ marginBottom: '36px' }}>
        <Card elevated style={{ padding: '20px 24px' }}>
          <form onSubmit={handleCreateTask}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="text"
                placeholder="What needs your attention?"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!isFormExpanded && e.target.value.length > 0) setIsFormExpanded(true);
                }}
                onFocus={() => setIsFormExpanded(true)}
                className="input-tranquil"
                style={{
                  border: 'none',
                  fontSize: '16px',
                  padding: '8px 0',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              />
              <Button
                type="submit"
                variant="terracotta"
                disabled={!newTitle.trim() || createTaskMutation.isPending}
                isLoading={createTaskMutation.isPending}
              >
                <Plus size={16} />
                <span>Add task</span>
              </Button>
            </div>

            {/* Expanded Contextual Fields */}
            {isFormExpanded && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <textarea
                  placeholder="Add gentle context or notes (Cmd/Ctrl + Enter to submit)..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      handleCreateTask(e);
                    }
                  }}
                  rows={2}
                  className="input-tranquil"
                  style={{
                    resize: 'vertical',
                    fontSize: '13.5px',
                    fontFamily: 'var(--font-sans)',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Category Pill Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Tag:</span>
                    {CATEGORY_TAGS.map((tag) => {
                      const isSelected = newTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewTags(newTags.filter((t) => t !== tag));
                            } else {
                              setNewTags([...newTags, tag]);
                            }
                          }}
                          style={{
                            border: `1px solid ${isSelected ? 'var(--color-terracotta)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-terracotta-tint)' : '#FFFFFF',
                            color: isSelected ? 'var(--color-terracotta)' : 'var(--color-text-muted)',
                            borderRadius: 'var(--radius-full)',
                            padding: '3px 10px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Priority Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Priority:</span>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                      className="input-tranquil"
                      style={{
                        padding: '4px 10px',
                        fontSize: '12.5px',
                        width: 'auto',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Card>
      </section>

      {/* Module 2: Pacing & Progress Widget */}
      <section style={{ marginBottom: '32px' }}>
        <div
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--color-terracotta)" />
              <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>
                {totalCount === 0
                  ? 'No commitments scheduled yet'
                  : `${activeTasks.length} focus commitment${activeTasks.length === 1 ? '' : 's'} remaining`}
              </span>
            </div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
              {totalCount > 0 ? `${percentageCleared}% cleared` : 'Peaceful morning'}
            </span>
          </div>

          {/* Minimalist wave progress bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentageCleared}%`,
                height: '100%',
                backgroundColor: 'var(--color-sage)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>
      </section>

      {/* Module 3: Search & Filter Toolbar */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-faint)',
            }}
          />
          <input
            type="text"
            placeholder="Search your journal..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="input-tranquil"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '13.5px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setPage(1);
            }}
            className="input-tranquil"
            style={{ height: '38px', width: 'auto', fontSize: '13px', backgroundColor: '#FFFFFF' }}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Module 4: Active Task List ("Today's Focus") */}
      <section style={{ marginBottom: '36px' }}>
        <h2
          className="font-serif"
          style={{
            fontSize: '19px',
            fontWeight: 500,
            marginBottom: '14px',
            color: 'var(--color-text-main)',
          }}
        >
          Today's Focus
        </h2>

        {/* Loading State: 3 soft skeleton pulse cards */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton height="76px" borderRadius="var(--radius-lg)" />
            <Skeleton height="76px" borderRadius="var(--radius-lg)" />
            <Skeleton height="76px" borderRadius="var(--radius-lg)" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--color-error)', fontSize: '14px' }}>
              {getApiErrorMessage(error)}
            </p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && activeTasks.length === 0 && (
          <Card
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              backgroundColor: 'var(--color-card)',
            }}
          >
            <h3
              className="font-serif"
              style={{
                fontSize: '22px',
                fontWeight: 400,
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
              }}
            >
              Nothing here yet. Add your first task
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-faint)' }}>
              Take a breath and write down what requires deliberate thought today.
            </p>
          </Card>
        )}

        {/* Active Task Cards */}
        {!isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTasks.map((task) => (
              <div
                key={task._id}
                className="card-tranquil"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '14px',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div style={{ paddingTop: '2px' }}>
                    <Checkbox
                      checked={false}
                      onChange={() => toggleTaskMutation.mutate({ id: task._id, completed: true })}
                      aria-label={`Mark "${task.title}" as completed`}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: 'var(--color-text-main)',
                        }}
                      >
                        {task.title}
                      </span>
                      {task.priority && (
                        <Badge variant="priority" priority={task.priority}>
                          {task.priority}
                        </Badge>
                      )}
                      {task.tags?.map((t) => (
                        <Badge key={t} variant="tag">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    {task.description && task.description !== 'No additional notes' && (
                      <p
                        style={{
                          fontSize: '13.5px',
                          color: 'var(--color-text-muted)',
                          marginTop: '4px',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contextual Edit & Delete actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setEditingTask(task)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    title="Edit task"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => setDeletingTaskId(task._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-faint)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Module 5: Completed Task Archive */}
      {completedTasks.length > 0 && (
        <section style={{ marginTop: '24px' }}>
          <button
            onClick={() => setIsArchiveOpen(!isArchiveOpen)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '12px',
              padding: '4px 0',
            }}
          >
            {isArchiveOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            <span>Completed ({completedTasks.length})</span>
          </button>

          {isArchiveOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="card-tranquil"
                  style={{
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    backgroundColor: 'rgba(255, 253, 248, 0.6)',
                    opacity: 0.72,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <Checkbox
                      checked={true}
                      onChange={() => toggleTaskMutation.mutate({ id: task._id, completed: false })}
                      aria-label={`Unmark "${task.title}"`}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        textDecoration: 'line-through',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {task.title}
                    </span>
                  </div>

                  <button
                    onClick={() => setDeletingTaskId(task._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-faint)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Remove from archive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '36px',
          }}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Task Modal */}
      <Modal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        title="Edit intention"
      >
        {editingTask && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateTaskMutation.mutate({
                id: editingTask._id,
                updates: {
                  title: editingTask.title,
                  description: editingTask.description,
                  priority: editingTask.priority,
                  tags: editingTask.tags,
                },
              });
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Title
              </label>
              <input
                type="text"
                className="input-tranquil"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Notes / Context
              </label>
              <textarea
                rows={3}
                className="input-tranquil"
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                className="input-tranquil"
                value={editingTask.priority}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button type="button" variant="ghost" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="terracotta"
                isLoading={updateTaskMutation.isPending}
              >
                Save changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingTaskId)}
        onClose={() => setDeletingTaskId(null)}
        title="Remove task"
      >
        <p style={{ fontSize: '14.5px', color: 'var(--color-text-main)', marginBottom: '24px' }}>
          Are you sure you want to remove this commitment from your journal?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button type="button" variant="ghost" onClick={() => setDeletingTaskId(null)}>
            Keep task
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              if (deletingTaskId) deleteTaskMutation.mutate(deletingTaskId);
            }}
            isLoading={deleteTaskMutation.isPending}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
};
