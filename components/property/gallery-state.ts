type Size = { width: number; height: number };
type State = { displayed: number; target: number; loaded: Record<number, Size>; failed: boolean };
type Action = { type: "navigate"; delta: number; count: number } | { type: "loaded"; index: number; width: number; height: number } | { type: "failed"; index: number };
export const initialGalleryState: State = { displayed: 0, target: 0, loaded: {}, failed: false };
export function adjacentIndices(index: number, count: number) {
  return count > 1 ? [...new Set([(index + 1) % count, (index + count - 1) % count])] : [];
}
export function galleryReducer(state: State, action: Action): State {
  if (action.type === "navigate") {
    const target = (state.target + action.delta + action.count) % action.count;
    return { ...state, target, displayed: state.loaded[target] ? target : state.displayed, failed: false };
  }
  if (action.type === "failed") return action.index === state.target ? { ...state, failed: true } : state;
  const previous = state.loaded[action.index];
  if (previous?.width === action.width && previous.height === action.height) return state;
  return { ...state, loaded: { ...state.loaded, [action.index]: { width: action.width, height: action.height } }, displayed: action.index === state.target ? action.index : state.displayed, failed: action.index === state.target ? false : state.failed };
}
