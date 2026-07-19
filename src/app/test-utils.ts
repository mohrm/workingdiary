let elementId = 0;

class FakeElement {
  tagName: string;
  id: number;
  className: string = '';
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  private _innerHTML: string = '';
  private _textContent: string = '';
  private _attrs: Map<string, string> = new Map();
  private _listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private _value: string = '';

  constructor(tag: string) {
    this.tagName = tag.toUpperCase();
    this.id = ++elementId;
  }

  set innerHTML(html: string) {
    this._innerHTML = html;
    this.children = this._parseHTML(html);
    for (const child of this.children) child.parent = this;
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set textContent(val: string) {
    this._textContent = val;
  }

  get textContent(): string {
    if (this.children.length === 0) return this._textContent;
    return this.children.map(c => c.textContent).join('');
  }

  set value(val: string) { this._value = val; }
  get value(): string { return this._value; }

  get dataset(): Record<string, string> {
    const self = this;
    return new Proxy({} as Record<string, string>, {
      get(_, key: string) {
        const attrName = 'data-' + key.replace(/_/g, '-').toLowerCase();
        return self._attrs.get(attrName) ?? '';
      },
    });
  }

  setAttribute(name: string, value: string): void {
    this._attrs.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this._attrs.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this._attrs.has(name);
  }

  appendChild(child: FakeElement): void {
    this.children.push(child);
    child.parent = this;
  }

  remove(): void {
    if (this.parent) {
      this.parent.children = this.parent.children.filter(c => c !== this);
    }
  }

  addEventListener(event: string, handler: (...args: unknown[]) => void): void {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event)!.add(handler);
  }

  removeEventListener(event: string, handler: (...args: unknown[]) => void): void {
    this._listeners.get(event)?.delete(handler);
  }

  querySelector(selector: string): FakeElement | null {
    const attrMatch = selector.match(/^\[([\w-]+)=["']([^"']*)["']\]$/);
    if (attrMatch) {
      const [, attr, value] = attrMatch;
      for (const child of this.children) {
        if (child.getAttribute(attr) === value) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    }

    const tagMatch = selector.match(/^(\w+)$/);
    if (tagMatch) {
      const tag = tagMatch[1].toUpperCase();
      for (const child of this.children) {
        if (child.tagName === tag) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    }

    const classMatch = selector.match(/^\.([\w-]+)$/);
    if (classMatch) {
      const cls = classMatch[1];
      for (const child of this.children) {
        if (child.className.split(/\s+/).includes(cls)) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    }

    const specificAttr = selector.match(/^\[([\w-]+)\]$/);
    if (specificAttr) {
      const attr = specificAttr[1];
      for (const child of this.children) {
        if (child.hasAttribute(attr)) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    }

    return null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const results: FakeElement[] = [];
    const attrMatch = selector.match(/^\[([\w-]+)=["']([^"']*)["']\]$/);
    if (attrMatch) {
      const [, attr, value] = attrMatch;
      for (const child of this.children) {
        if (child.getAttribute(attr) === value) results.push(child);
        results.push(...child.querySelectorAll(selector));
      }
    }
    return results;
  }

  private _parseHTML(html: string): FakeElement[] {
    const elements: FakeElement[] = [];
    const tagRegex = /<(\w+)([^>]*)>|<\/(\w+)>/g;
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    const stack: FakeElement[] = [];
    let lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(html)) !== null) {
      if (match[1]) {
        const tagName = match[1].toLowerCase();
        const attrsStr = match[2];
        const attrs: Array<[string, string]> = [];
        let attrMatch: RegExpExecArray | null;
        const attrRe = /(\w[\w-]*)(?:=["']([^"']*)["'])?/g;
        while ((attrMatch = attrRe.exec(attrsStr)) !== null) {
          if (attrMatch[1] !== undefined) {
            attrs.push([attrMatch[1], attrMatch[2] ?? '']);
          }
        }

        const isVoid = /^(br|hr|img|input|link|meta|path)$/i.test(tagName);
        const isSelfClosing = attrsStr.trim().endsWith('/');
        const el = new FakeElement(tagName);
        for (const [k, v] of attrs) {
          if (k === 'class') el.className = v;
          else el.setAttribute(k, v);
        }

        if (stack.length > 0) {
          stack[stack.length - 1].appendChild(el);
        } else {
          elements.push(el);
        }

        if (!isVoid && !isSelfClosing) {
          stack.push(el);
        }
      } else if (match[3]) {
        const closeTag = match[3].toLowerCase();
        if (stack.length > 0 && stack[stack.length - 1].tagName === closeTag.toUpperCase()) {
          stack.pop();
        }
      }
      lastIndex = match.index + match[0].length;
    }

    return elements;
  }
}

function fakeCreateElement(tag: string): FakeElement {
  return new FakeElement(tag);
}

export function installFakeDocument(): void {
  (globalThis as Record<string, unknown>).document = {
    createElement: fakeCreateElement,
  } as unknown as Document;
}

export function resetFakeDocument(): void {
  elementId = 0;
  (globalThis as Record<string, unknown>).document = undefined;
}
