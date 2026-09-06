import { renderHook, act } from '@testing-library/react';
import { useEditorHistory } from '@/components/editor/editor-history';

describe('useEditorHistory', () => {
  it('should initialize with provided data', () => {
    const initial = ['a', 'b'];
    const { result } = renderHook(() => useEditorHistory<string>(initial));
    expect(result.current.data).toEqual(['a', 'b']);
  });

  it('should push new state and support undo/redo', () => {
    const { result } = renderHook(() => useEditorHistory<string>(['a']));

    act(() => result.current.setData(['a', 'b']));
    expect(result.current.data).toEqual(['a', 'b']);

    act(() => result.current.undo());
    expect(result.current.data).toEqual(['a']);

    act(() => result.current.redo());
    expect(result.current.data).toEqual(['a', 'b']);
  });

  it('should expose canUndo/canRedo flags', () => {
    const { result } = renderHook(() => useEditorHistory<string>(['a']));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
