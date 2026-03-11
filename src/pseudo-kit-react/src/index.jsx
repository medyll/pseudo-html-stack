/**
 * pseudo-kit-react
 * Thin React adapter for pseudo-html-kit components.
 *
 * Usage:
 *   import { useComponent, usePseudoKit, PseudoKitProvider, useRegisterComponent } from 'pseudo-kit-react';
 *
 *   function MyComponent() {
 *     const { ready } = useComponent('/path/to/button-pk.html');
 *     if (!ready) return null;
 *     return <button-pk variant="primary">Click me</button-pk>;
 *   }
 *
 * Or with provider:
 *   <PseudoKitProvider components={['/path/button.html', '/path/card.html']}>
 *     <App />
 *   </PseudoKitProvider>
 */

import { useEffect, useState, createContext, useContext } from 'react';

const PseudoKitContext = createContext(null);

/**
 * Provider to initialize PseudoKit with a list of components.
 * @param {Object} props
 * @param {string[]} props.components - Array of component URLs to register
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.baseUrl - Base URL for component paths
 */
export function PseudoKitProvider({ components = [], baseUrl = '', children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (components.length === 0) {
      setReady(true);
      return;
    }

    const PseudoKit = globalThis.PseudoKit;
    if (!PseudoKit) {
      console.warn('[pseudo-kit-react] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded.');
      return;
    }

    components.forEach((url) => {
      const fullUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}` : url;
      const name = _nameFromUrl(fullUrl);
      PseudoKit.register({ name, src: fullUrl });
    });

    PseudoKit.init().then(() => setReady(true));
  }, [components.join(','), baseUrl]);

  return (
    <PseudoKitContext.Provider value={{ ready }}>
      {children}
    </PseudoKitContext.Provider>
  );
}

/**
 * Hook to check if PseudoKit is ready within a provider context.
 * @returns {{ ready: boolean }}
 */
export function usePseudoKitReady() {
  const context = useContext(PseudoKitContext);
  return context || { ready: true };
}

/**
 * Register a single component programmatically.
 * @param {string} url - Component URL
 * @returns {{ ready: boolean }}
 */
export function useRegisterComponent(url) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url) return;

    const PseudoKit = globalThis.PseudoKit;
    if (!PseudoKit) {
      console.warn('[pseudo-kit-react] PseudoKit not found on globalThis.');
      return;
    }

    const name = _nameFromUrl(url);
    PseudoKit.register({ name, src: url });
    PseudoKit.init().then(() => setReady(true));
  }, [url]);

  return { ready };
}

/**
 * Derive a component name from a URL filename stem.
 * e.g. '/components/button-pk.html' → 'button-pk'
 *
 * @param {string} url
 * @returns {string}
 */
function _nameFromUrl(url) {
  return url.split('/').pop().replace(/\.html$/, '');
}

/**
 * Load and register a single pseudo-html-kit component by URL.
 *
 * @param {string} url - Absolute or relative URL to the component `.html` file.
 * @returns {{ ready: boolean }}
 */
export function useComponent(url) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!url) return;

    const PseudoKit = globalThis.PseudoKit;
    if (!PseudoKit) {
      console.warn('[pseudo-kit-react] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded before using this hook.');
      return;
    }

    const name = _nameFromUrl(url);
    PseudoKit.register({ name, src: url });
    PseudoKit.init().then(() => setReady(true));
  }, [url]);

  return { ready };
}

/**
 * Load and register multiple pseudo-html-kit components at once.
 *
 * @param {string[]} urls - Array of URLs to component `.html` files.
 * @returns {{ ready: boolean }}
 */
export function usePseudoKit(urls) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    const PseudoKit = globalThis.PseudoKit;
    if (!PseudoKit) {
      console.warn('[pseudo-kit-react] PseudoKit not found on globalThis. Make sure pseudo-kit-client.js is loaded before using this hook.');
      return;
    }

    urls.forEach((url) => {
      const name = _nameFromUrl(url);
      PseudoKit.register({ name, src: url });
    });

    PseudoKit.init().then(() => setReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join(',')]);

  return { ready };
}
