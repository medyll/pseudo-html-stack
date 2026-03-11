/**
 * @fileoverview pseudo-kit-react — unit tests
 *
 * Tests the exported hooks and provider by rendering them
 * with React 18 createRoot + act (no external test lib).
 *
 * Run: npx vitest run (from src/pseudo-kit-react/)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import {
  useComponent,
  usePseudoKit,
  usePseudoKitReady,
  useRegisterComponent,
  PseudoKitProvider,
} from '../src/index.jsx';

// ── Helpers ──────────────────────────────────────────────────────────────────

let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete globalThis.PseudoKit;
  vi.restoreAllMocks();
});

function makePseudoKitMock() {
  return {
    register: vi.fn(),
    init: vi.fn().mockResolvedValue(undefined),
  };
}

/** Render a hook and capture its last return value. */
function renderHook(hookFn) {
  let result;
  function TestComponent() {
    result = hookFn();
    return null;
  }
  act(() => {
    root.render(h(TestComponent));
  });
  return { get result() { return result; } };
}

// ── _nameFromUrl behaviour (via useComponent side-effect) ───────────────────

describe('useComponent', () => {
  it('returns ready:false before PseudoKit init resolves', () => {
    globalThis.PseudoKit = {
      register: vi.fn(),
      init: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    };
    const { result } = renderHook(() => useComponent('/components/button-pk.html'));
    expect(result.ready).toBe(false);
  });

  it('returns ready:true after PseudoKit.init() resolves', async () => {
    globalThis.PseudoKit = makePseudoKitMock();
    let result;
    function TestComp() { result = useComponent('/components/button-pk.html'); return null; }
    await act(async () => { root.render(h(TestComp)); });
    expect(result.ready).toBe(true);
  });

  it('calls PseudoKit.register with derived name and src url', async () => {
    const mock = makePseudoKitMock();
    globalThis.PseudoKit = mock;
    await act(async () => {
      root.render(h(function T() { useComponent('/components/button-pk.html'); return null; }));
    });
    expect(mock.register).toHaveBeenCalledWith({ name: 'button-pk', src: '/components/button-pk.html' });
  });

  it('does not throw when PseudoKit is absent (warns instead)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await act(async () => {
      root.render(h(function T() { useComponent('/components/button-pk.html'); return null; }));
    });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('skips effect when url is empty', async () => {
    globalThis.PseudoKit = makePseudoKitMock();
    await act(async () => {
      root.render(h(function T() { useComponent(''); return null; }));
    });
    expect(globalThis.PseudoKit.register).not.toHaveBeenCalled();
  });
});

// ── usePseudoKit ─────────────────────────────────────────────────────────────

describe('usePseudoKit', () => {
  it('returns ready:true after init resolves', async () => {
    globalThis.PseudoKit = makePseudoKitMock();
    let result;
    function T() { result = usePseudoKit(['/a/card-pk.html', '/a/badge.html']); return null; }
    await act(async () => { root.render(h(T)); });
    expect(result.ready).toBe(true);
  });

  it('registers all provided URLs', async () => {
    const mock = makePseudoKitMock();
    globalThis.PseudoKit = mock;
    const urls = ['/a/card-pk.html', '/a/badge.html'];
    await act(async () => {
      root.render(h(function T() { usePseudoKit(urls); return null; }));
    });
    expect(mock.register).toHaveBeenCalledTimes(2);
    expect(mock.register).toHaveBeenCalledWith({ name: 'card-pk', src: '/a/card-pk.html' });
    expect(mock.register).toHaveBeenCalledWith({ name: 'badge', src: '/a/badge.html' });
  });

  it('skips effect when urls array is empty', async () => {
    globalThis.PseudoKit = makePseudoKitMock();
    await act(async () => {
      root.render(h(function T() { usePseudoKit([]); return null; }));
    });
    expect(globalThis.PseudoKit.register).not.toHaveBeenCalled();
  });
});

// ── useRegisterComponent ─────────────────────────────────────────────────────

describe('useRegisterComponent', () => {
  it('registers and returns ready:true on init', async () => {
    const mock = makePseudoKitMock();
    globalThis.PseudoKit = mock;
    let result;
    function T() { result = useRegisterComponent('/x/tooltip.html'); return null; }
    await act(async () => { root.render(h(T)); });
    expect(result.ready).toBe(true);
    expect(mock.register).toHaveBeenCalledWith({ name: 'tooltip', src: '/x/tooltip.html' });
  });
});

// ── PseudoKitProvider ────────────────────────────────────────────────────────

describe('PseudoKitProvider', () => {
  it('renders children', async () => {
    globalThis.PseudoKit = makePseudoKitMock();
    await act(async () => {
      root.render(
        h(PseudoKitProvider, { components: [] },
          h('span', { id: 'child' }, 'hello')
        )
      );
    });
    expect(container.querySelector('#child')).toBeTruthy();
  });

  it('sets ready after init resolves', async () => {
    const mock = makePseudoKitMock();
    globalThis.PseudoKit = mock;
    let contextValue;
    function Inner() {
      contextValue = usePseudoKitReady();
      return null;
    }
    await act(async () => {
      root.render(
        h(PseudoKitProvider, { components: ['/x/button-pk.html'] },
          h(Inner)
        )
      );
    });
    expect(contextValue.ready).toBe(true);
  });

  it('with no components — sets ready immediately', async () => {
    let contextValue;
    function Inner() { contextValue = usePseudoKitReady(); return null; }
    await act(async () => {
      root.render(h(PseudoKitProvider, { components: [] }, h(Inner)));
    });
    expect(contextValue.ready).toBe(true);
  });

  it('applies baseUrl prefix to component paths', async () => {
    const mock = makePseudoKitMock();
    globalThis.PseudoKit = mock;
    await act(async () => {
      root.render(
        h(PseudoKitProvider,
          { components: ['button-pk.html'], baseUrl: 'https://cdn.example.com/components' },
          h('span')
        )
      );
    });
    expect(mock.register).toHaveBeenCalledWith({
      name: 'button-pk',
      src: 'https://cdn.example.com/components/button-pk.html',
    });
  });
});

// ── usePseudoKitReady outside provider ───────────────────────────────────────

describe('usePseudoKitReady', () => {
  it('returns ready:true when used outside a provider (default)', async () => {
    let result;
    function T() { result = usePseudoKitReady(); return null; }
    await act(async () => { root.render(h(T)); });
    expect(result.ready).toBe(true);
  });
});
