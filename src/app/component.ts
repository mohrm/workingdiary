export interface Component {
  element: HTMLElement;
  destroy?: () => void;
}
