// Wires up every `[data-action="name"]` element inside `el` to the matching
// handler in `actions`, replacing the repeated
// `el.querySelector('[data-action="x"]')?.addEventListener('click', fn)`
// boilerplate each component used to duplicate on its own.
export function bindActions(
  el: Element,
  actions: Record<string, () => void>,
): void {
  for (const [name, handler] of Object.entries(actions)) {
    el.querySelector(`[data-action="${name}"]`)?.addEventListener(
      'click',
      handler,
    );
  }
}
