import { beforeEach, describe, expect, it } from 'vitest';
import { useBoardUiStore } from './board-ui.store';

describe('board UI store', () => {
  beforeEach(() => useBoardUiStore.getState().reset());

  it('updates individual filters independently', () => {
    const store = useBoardUiStore.getState();
    store.setQuery('login');
    store.setAssignee('user-2');
    store.setPriority('high');

    const { filters } = useBoardUiStore.getState();
    expect(filters).toEqual({
      query: 'login',
      assigneeId: 'user-2',
      priority: 'high',
    });
  });

  it('resets all filters', () => {
    useBoardUiStore.getState().setQuery('x');
    useBoardUiStore.getState().reset();
    expect(useBoardUiStore.getState().filters).toEqual({
      query: '',
      assigneeId: null,
      priority: null,
    });
  });
});
