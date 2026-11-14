import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

import { PixelIcon } from '@/components/pixel/pixel-icon';
import { PixelButton, PixelCheckbox, PixelCard } from '@/components/pixel/pixel-surfaces';
import { PixelText } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import { useAppData } from '@/state/app-context';
import type { Todo } from '@/lib/types';
import { Border, Spacing } from '@/theme/tokens';

export function TodoList() {
  const theme = useTheme();
  const { todos, activeTask, actions } = useAppData();
  const [draft, setDraft] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);

  const doneCount = todos.filter((todo) => todo.done).length;

  const submit = () => {
    if (!draft.trim()) return;
    actions.addTodo(draft);
    setDraft('');
  };

  const confirmRemove = (todo: Todo) => {
    setPendingDelete(todo);
  };

  const removeConfirmed = () => {
    if (!pendingDelete) return;
    actions.removeTodo(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <PixelCard padded={false}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
        }}>
        <PixelText variant="label">Tugas</PixelText>
        <PixelText variant="caption" tone="muted">
          {doneCount}/{todos.length} selesai
        </PixelText>
      </View>

      <View style={{ height: Border.width, backgroundColor: theme.line }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.xs,
        }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder="Tambah tugas…"
          placeholderTextColor={theme.inkMuted}
          returnKeyType="done"
          maxLength={120}
          accessibilityLabel="Tugas baru"
          style={{
            flex: 1,
            color: theme.ink,
            fontSize: 15,
            paddingVertical: Spacing.md,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah tugas"
          onPress={submit}
          disabled={!draft.trim()}
          style={{
            width: 36,
            height: 36,
            borderWidth: Border.width,
            borderColor: theme.line,
            backgroundColor: draft.trim() ? theme.focus : theme.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: draft.trim() ? 1 : 0.6,
          }}>
          <PixelIcon name="plus" size={12} color={draft.trim() ? theme.onAccent : theme.ink} />
        </Pressable>
      </View>

      <View style={{ height: Border.width, backgroundColor: theme.line }} />

      {todos.length === 0 ? (
        <View style={{ padding: Spacing.lg, gap: Spacing.xs }}>
          <PixelText variant="bodyBold">Belum ada tugas</PixelText>
          <PixelText variant="small" tone="muted">
            Tambahkan satu tugas supaya sesi fokus bisa dicatat ke aktivitasnya.
          </PixelText>
        </View>
      ) : (
        <View>
          {todos.map((todo, index) => {
            const active = activeTask?.id === todo.id;
            return (
              <View key={todo.id}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: active ? theme.focusSoft : 'transparent',
                    borderLeftWidth: 4,
                    borderLeftColor: active ? theme.focus : 'transparent',
                  }}>
                  <View style={{ paddingLeft: Spacing.lg, paddingRight: Spacing.md }}>
                    <PixelCheckbox
                      checked={todo.done}
                      onPress={() => actions.toggleTodo(todo.id)}
                      accessibilityLabel={`Tandai ${todo.title}`}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => actions.selectTask(active ? null : todo.id)}
                    onLongPress={() => confirmRemove(todo)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: Spacing.md,
                      paddingVertical: Spacing.md,
                      paddingRight: Spacing.sm,
                    }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <PixelText
                        variant="bodyBold"
                        tone={todo.done ? 'muted' : 'ink'}
                        numberOfLines={2}
                        style={todo.done ? { textDecorationLine: 'line-through' } : undefined}>
                        {todo.title}
                      </PixelText>
                      <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                        {active ? (
                          <PixelText variant="caption" tone="focus">
                            Aktif
                          </PixelText>
                        ) : null}
                        {todo.pomodoros > 0 ? (
                          <PixelText variant="caption" tone="muted">
                            {todo.pomodoros} sesi
                          </PixelText>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus ${todo.title}`}
                    hitSlop={Spacing.sm}
                    onPress={() => confirmRemove(todo)}
                    style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
                    <PixelIcon name="trash" size={14} color={theme.inkMuted} />
                  </Pressable>
                </View>
                {index < todos.length - 1 ? (
                  <View style={{ height: Border.width, backgroundColor: theme.line }} />
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: Border.width, backgroundColor: theme.line }} />
      <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }}>
        <PixelText variant="caption" tone="muted">
          Ketuk untuk memilih tugas aktif · tahan untuk menghapus
        </PixelText>
      </View>

      <DeleteTodoDialog
        todo={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={removeConfirmed}
      />
    </PixelCard>
  );
}

function DeleteTodoDialog({
  todo,
  onCancel,
  onConfirm,
}: {
  todo: Todo | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal
      visible={todo !== null}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: Spacing.xl,
        }}>
        <View style={{ width: '100%', maxWidth: 360 }}>
          <PixelCard>
            <PixelText variant="label" tone="focus">
              Hapus tugas
            </PixelText>
            <PixelText variant="subtitle" style={{ marginTop: Spacing.sm }}>
              {todo?.title ?? ''}
            </PixelText>
            <PixelText variant="small" tone="muted" style={{ marginTop: Spacing.xs }}>
              Riwayat sesi tetap tersimpan di statistik.
            </PixelText>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
              <PixelButton label="Batal" onPress={onCancel} style={{ flex: 1 }} />
              <PixelButton
                label="Hapus"
                variant="primary"
                onPress={onConfirm}
                style={{ flex: 1 }}
                icon={<PixelIcon name="trash" size={14} color={theme.onAccent} />}
              />
            </View>
          </PixelCard>
        </View>
      </View>
    </Modal>
  );
}
