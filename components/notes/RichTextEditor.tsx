import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { FormatAction } from '../../lib/noteContent';
import { formatCommand } from '../../lib/noteContent';

export type RichTextEditorRef = {
  applyFormat: (action: FormatAction) => void;
  focus: () => void;
  setHtml: (html: string) => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  textColor: string;
  bgColor: string;
  accentColor: string;
  mutedColor: string;
  minHeight?: number;
};

function buildShellHtml(opts: {
  placeholder: string;
  textColor: string;
  bgColor: string;
  accentColor: string;
  mutedColor: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${opts.bgColor}; height: 100%; }
  #editor {
    min-height: 280px;
    padding: 4px 2px 24px;
    outline: none;
    font-size: 17px;
    line-height: 1.55;
    color: ${opts.textColor};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    word-wrap: break-word;
    -webkit-user-select: text;
    user-select: text;
  }
  #editor:empty:before {
    content: attr(data-placeholder);
    color: ${opts.mutedColor};
    pointer-events: none;
  }
  b, strong { font-weight: 700; }
  i, em { font-style: italic; }
  h1 { font-size: 1.5em; font-weight: 800; margin: 0.4em 0; }
  h2 { font-size: 1.25em; font-weight: 700; margin: 0.35em 0; }
  h3 { font-size: 1.1em; font-weight: 700; margin: 0.3em 0; }
  blockquote {
    border-left: 3px solid ${opts.accentColor};
    margin: 8px 0;
    padding: 4px 12px;
    opacity: 0.9;
  }
  ul, ol { padding-left: 1.4em; margin: 6px 0; }
  li { margin: 4px 0; }
  pre, code {
    font-family: monospace;
    background: rgba(128,128,128,0.15);
    border-radius: 4px;
  }
  pre { padding: 10px; overflow-x: auto; white-space: pre-wrap; }
  code { padding: 2px 5px; font-size: 0.92em; }
  hr { border: none; border-top: 1px solid ${opts.mutedColor}; margin: 16px 0; }
  a { color: ${opts.accentColor}; }
  .check { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; }
  .check input { margin-top: 4px; width: 16px; height: 16px; }
</style>
</head>
<body>
<div id="editor" contenteditable="true" data-placeholder="${opts.placeholder.replace(/"/g, '&quot;')}"></div>
<script>
  const editor = document.getElementById('editor');
  let debounceTimer = null;

  function postContent() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'change', html: editor.innerHTML }));
  }

  function debouncedPost() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(postContent, 100);
  }

  editor.addEventListener('input', debouncedPost);
  editor.addEventListener('blur', postContent);

  window.setContent = function(html) {
    const next = html || '';
    if (editor.innerHTML !== next) editor.innerHTML = next;
  };

  window.applyFormat = function(command, value) {
    editor.focus();
    if (command === 'createLink') {
      const url = prompt('Enter URL', value || 'https://');
      if (url) document.execCommand('createLink', false, url);
    } else if (command === 'insertHTML') {
      document.execCommand('insertHTML', false, value || '');
    } else if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, null);
    }
    postContent();
  };

  window.focusEditor = function() { editor.focus(); };

  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</body>
</html>`;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      onChange,
      placeholder = 'Start writing...',
      textColor,
      bgColor,
      accentColor,
      mutedColor,
      minHeight = 300,
    },
    ref
  ) {
    const webRef = useRef<WebView>(null);
    const ready = useRef(false);
    const skipNextSync = useRef(false);
    const lastEmitted = useRef(value);

    const shellHtml = useMemo(
      () =>
        buildShellHtml({
          placeholder,
          textColor,
          bgColor,
          accentColor,
          mutedColor,
        }),
      [placeholder, textColor, bgColor, accentColor, mutedColor]
    );

    const inject = useCallback((js: string) => {
      webRef.current?.injectJavaScript(`${js}; true;`);
    }, []);

    const setHtmlInWeb = useCallback(
      (html: string) => {
        inject(`window.setContent(${JSON.stringify(html)})`);
      },
      [inject]
    );

    useImperativeHandle(ref, () => ({
      applyFormat: (action: FormatAction) => {
        const { command, value: cmdValue } = formatCommand(action);
        const v = cmdValue ? JSON.stringify(cmdValue) : 'null';
        inject(`window.applyFormat(${JSON.stringify(command)}, ${v === 'null' ? 'null' : v})`);
      },
      focus: () => inject('window.focusEditor()'),
      setHtml: (html: string) => {
        skipNextSync.current = true;
        lastEmitted.current = html;
        setHtmlInWeb(html);
      },
    }));

    // Sync external value changes (AI insert, load) without remounting WebView
    useEffect(() => {
      if (!ready.current) return;
      if (value === lastEmitted.current) return;
      if (skipNextSync.current) {
        skipNextSync.current = false;
        return;
      }
      setHtmlInWeb(value);
      lastEmitted.current = value;
    }, [value, setHtmlInWeb]);

    const onMessage = useCallback(
      (e: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(e.nativeEvent.data) as { type: string; html?: string };
          if (data.type === 'ready') {
            ready.current = true;
            setHtmlInWeb(value);
            lastEmitted.current = value;
            return;
          }
          if (data.type === 'change' && typeof data.html === 'string') {
            lastEmitted.current = data.html;
            onChange(data.html);
          }
        } catch {
          /* ignore */
        }
      },
      [onChange, value, setHtmlInWeb]
    );

    return (
      <View style={[styles.wrap, { minHeight, backgroundColor: bgColor, borderColor: 'transparent' }]}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: shellHtml }}
          onMessage={onMessage}
          style={[styles.web, { minHeight, backgroundColor: bgColor }]}
          scrollEnabled
          nestedScrollEnabled
          keyboardDisplayRequiresUserAction={false}
          hideKeyboardAccessoryView={false}
          javaScriptEnabled
          domStorageEnabled
          showsVerticalScrollIndicator={false}
          {...(Platform.OS === 'android' ? { mixedContentMode: 'always' as const } : {})}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  web: {
    flex: 1,
    opacity: 0.99,
  },
});
