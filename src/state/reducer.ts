import { durationForMode, nextModeAfterComplete, nextModeAfterSkip } from '@/lib/timer';
import type {
  PersistedState,
  Session,
  Settings,
  TimerMode,
  TimerState,
  Todo,
} from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';

export type AppState = PersistedState & { hydrated: boolean };

export type Action =
  | { type: 'hydrate'; payload: PersistedState | null; now: number }
  | { type: 'setSettings'; patch: Partial<Settings> }
  | { type: 'addTodo'; title: string; now: number }
  | { type: 'toggleTodo'; id: string }
  | { type: 'removeTodo'; id: string }
  | { type: 'selectTask'; id: string | null }
  | { type: 'setMode'; mode: TimerMode }
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'reset' }
  | { type: 'skip' }
  | { type: 'complete'; now: number }
  | { type: 'resetData' };

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function idleTimer(mode: TimerMode, settings: Settings, taskId: string | null, cycle = 0): TimerState {
  return {
    mode,
    status: 'idle',
    endsAt: null,
    remainingSec: durationForMode(mode, settings),
    startedAt: null,
    cycle,
    taskId,
  };
}

export function createInitialState(settings: Settings = DEFAULT_SETTINGS): AppState {
  return {
    hydrated: false,
    version: 1,
    settings,
    todos: [],
    sessions: [],
    timer: idleTimer('focus', settings, null),
  };
}

function completeTimer(state: AppState, now: number): AppState {
  const timer = state.timer;
  if (timer.status !== 'running' || timer.endsAt === null) return state;

  const plannedSec = durationForMode(timer.mode, state.settings);
  const endedAt = timer.endsAt;
  const finishedEarly = now < endedAt;
  const task =
    timer.mode === 'focus' && timer.taskId
      ? state.todos.find((todo) => todo.id === timer.taskId) ?? null
      : null;

  const session: Session = {
    id: uid(),
    mode: timer.mode,
    startedAt: timer.startedAt ?? endedAt - plannedSec * 1000,
    endedAt: finishedEarly ? now : endedAt,
    plannedSec,
    taskId: task?.id ?? null,
    taskTitle: task?.title ?? null,
  };

  const todos: Todo[] =
    timer.mode === 'focus' && task
      ? state.todos.map((todo) =>
          todo.id === task.id ? { ...todo, pomodoros: todo.pomodoros + 1 } : todo
        )
      : state.todos;

  const next = nextModeAfterComplete(timer.mode, timer.cycle, state.settings.longEvery);
  const autoStart = timer.mode === 'focus' ? state.settings.autoStartBreak : state.settings.autoStartFocus;
  const total = durationForMode(next.mode, state.settings);

  return {
    ...state,
    sessions: [...state.sessions, session].slice(-5000),
    todos,
    timer: {
      mode: next.mode,
      status: autoStart ? 'running' : 'idle',
      endsAt: autoStart ? now + total * 1000 : null,
      remainingSec: total,
      startedAt: autoStart ? now : null,
      cycle: next.cycle,
      taskId: timer.taskId,
    },
  };
}

function hydrate(payload: PersistedState | null, now: number): AppState {
  if (!payload) return { ...createInitialState(), hydrated: true };
  const base: AppState = {
    ...payload,
    hydrated: true,
  };
  if (base.timer.status === 'running' && base.timer.endsAt !== null && base.timer.endsAt <= now) {
    return completeTimer(base, now);
  }
  return base;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return hydrate(action.payload, action.now);

    case 'setSettings': {
      const settings = { ...state.settings, ...action.patch };
      let timer = state.timer;
      if (timer.status === 'idle') {
        const total = durationForMode(timer.mode, settings);
        timer = { ...timer, remainingSec: total };
      }
      return { ...state, settings, timer };
    }

    case 'addTodo': {
      const title = action.title.trim();
      if (!title) return state;
      const todo: Todo = {
        id: uid(),
        title: title.slice(0, 120),
        done: false,
        createdAt: action.now,
        pomodoros: 0,
      };
      return {
        ...state,
        todos: [...state.todos, todo],
        timer: state.timer.taskId ? state.timer : { ...state.timer, taskId: todo.id },
      };
    }

    case 'toggleTodo': {
      const target = state.todos.find((todo) => todo.id === action.id);
      if (!target) return state;
      const nextDone = !target.done;
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, done: nextDone } : todo
        ),
        timer:
          nextDone && state.timer.taskId === action.id
            ? { ...state.timer, taskId: null }
            : state.timer,
      };
    }

    case 'removeTodo': {
      const exists = state.todos.some((todo) => todo.id === action.id);
      if (!exists) return state;
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.id),
        timer:
          state.timer.taskId === action.id ? { ...state.timer, taskId: null } : state.timer,
      };
    }

    case 'selectTask':
      return { ...state, timer: { ...state.timer, taskId: action.id } };

    case 'setMode': {
      if (action.mode === state.timer.mode && state.timer.status === 'idle') return state;
      return {
        ...state,
        timer: idleTimer(action.mode, state.settings, state.timer.taskId, state.timer.cycle),
      };
    }

    case 'start': {
      const remaining =
        state.timer.status === 'paused'
          ? Math.max(0, state.timer.remainingSec)
          : durationForMode(state.timer.mode, state.settings);
      return {
        ...state,
        timer: {
          ...state.timer,
          status: 'running',
          endsAt: action.now + remaining * 1000,
          remainingSec: remaining,
          startedAt: action.now,
        },
      };
    }

    case 'pause': {
      if (state.timer.status !== 'running' || state.timer.endsAt === null) return state;
      const remaining = Math.max(0, Math.ceil((state.timer.endsAt - action.now) / 1000));
      return {
        ...state,
        timer: { ...state.timer, status: 'paused', endsAt: null, remainingSec: remaining },
      };
    }

    case 'reset':
      return {
        ...state,
        timer: idleTimer(
          state.timer.mode,
          state.settings,
          state.timer.taskId,
          state.timer.cycle
        ),
      };

    case 'skip': {
      const nextMode = nextModeAfterSkip(state.timer.mode);
      return {
        ...state,
        timer: idleTimer(nextMode, state.settings, state.timer.taskId, state.timer.cycle),
      };
    }

    case 'complete':
      return completeTimer(state, action.now);

    case 'resetData':
      return {
        ...state,
        todos: [],
        sessions: [],
        timer: idleTimer('focus', state.settings, null),
      };

    default:
      return state;
  }
}
