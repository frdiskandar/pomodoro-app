import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { AppState as NativeAppState, Vibration } from 'react-native';

import { durationForMode, remainingForTimer } from '@/lib/timer';
import { loadState, saveState } from '@/lib/storage';
import { syncTimerNotification } from '@/lib/notifications';
import type {
  PersistedState,
  Session,
  Settings,
  TimerMode,
  TimerState,
  Todo,
} from '@/lib/types';

import { createInitialState, reducer } from './reducer';

type Actions = {
  setSettings: (patch: Partial<Settings>) => void;
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  selectTask: (id: string | null) => void;
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  resetData: () => void;
};

type DataValue = {
  ready: boolean;
  settings: Settings;
  todos: Todo[];
  sessions: Session[];
  activeTask: Todo | null;
  actions: Actions;
};

type TimerValue = {
  timer: TimerState;
  remainingSec: number;
  totalSec: number;
  progress: number;
};

const DataContext = createContext<DataValue | null>(null);
const TimerContext = createContext<TimerValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    loadState()
      .then((saved) => {
        if (active) dispatch({ type: 'hydrate', payload: saved, now: Date.now() });
      })
      .catch(() => {
        if (active) dispatch({ type: 'hydrate', payload: null, now: Date.now() });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', (next) => {
      if (next === 'active') setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  const running = state.timer.status === 'running';

  useEffect(() => {
    if (!state.hydrated || !running || state.timer.endsAt === null) return;
    const endsAt = state.timer.endsAt;
    const shouldVibrate = state.settings.vibrate;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) {
        if (shouldVibrate) Vibration.vibrate(400);
        dispatch({ type: 'complete', now: current });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [state.hydrated, running, state.timer.endsAt, state.settings.vibrate]);

  useEffect(() => {
    if (!state.hydrated) return;
    const snapshot: PersistedState = {
      version: 1,
      settings: state.settings,
      todos: state.todos,
      sessions: state.sessions,
      timer: state.timer,
    };
    const timeout = setTimeout(() => {
      void saveState(snapshot);
    }, 300);
    return () => clearTimeout(timeout);
  }, [state.hydrated, state.settings, state.todos, state.sessions, state.timer]);

  useEffect(() => {
    if (!state.hydrated) return;
    void syncTimerNotification({
      enabled: state.settings.notifications,
      running: state.timer.status === 'running',
      endsAt: state.timer.endsAt,
      mode: state.timer.mode,
    });
  }, [
    state.hydrated,
    state.settings.notifications,
    state.timer.status,
    state.timer.endsAt,
    state.timer.mode,
  ]);

  const actions = useMemo<Actions>(
    () => ({
      setSettings: (patch) => dispatch({ type: 'setSettings', patch }),
      addTodo: (title) => dispatch({ type: 'addTodo', title, now: Date.now() }),
      toggleTodo: (id) => dispatch({ type: 'toggleTodo', id }),
      removeTodo: (id) => dispatch({ type: 'removeTodo', id }),
      selectTask: (id) => dispatch({ type: 'selectTask', id }),
      setMode: (mode) => dispatch({ type: 'setMode', mode }),
      start: () => dispatch({ type: 'start', now: Date.now() }),
      pause: () => dispatch({ type: 'pause', now: Date.now() }),
      reset: () => dispatch({ type: 'reset' }),
      skip: () => dispatch({ type: 'skip' }),
      resetData: () => dispatch({ type: 'resetData' }),
    }),
    []
  );

  const activeTask = state.todos.find((todo) => todo.id === state.timer.taskId) ?? null;

  const dataValue = useMemo<DataValue>(
    () => ({
      ready: state.hydrated,
      settings: state.settings,
      todos: state.todos,
      sessions: state.sessions,
      activeTask,
      actions,
    }),
    [state.hydrated, state.settings, state.todos, state.sessions, activeTask, actions]
  );

  const totalSec = durationForMode(state.timer.mode, state.settings);
  const remainingSec = remainingForTimer(state.timer, now);
  const progress = totalSec > 0 ? Math.min(1, Math.max(0, 1 - remainingSec / totalSec)) : 0;

  const timerValue = useMemo<TimerValue>(
    () => ({ timer: state.timer, remainingSec, totalSec, progress }),
    [state.timer, remainingSec, totalSec, progress]
  );

  return (
    <DataContext.Provider value={dataValue}>
      <TimerContext.Provider value={timerValue}>{children}</TimerContext.Provider>
    </DataContext.Provider>
  );
}

export function useAppData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useAppData must be used inside AppProvider');
  return value;
}

export function useTimer(): TimerValue {
  const value = useContext(TimerContext);
  if (!value) throw new Error('useTimer must be used inside AppProvider');
  return value;
}

export function useActions(): Actions {
  return useAppData().actions;
}
