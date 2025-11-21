import { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";

const MonacoEditor = ({
  value,
  onChange,
  language,
  theme,
  participants,
  onCursorChange,
  readOnly = false,
}) => {
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsReady(true);

    // Define custom themes
    monaco.editor.defineTheme("communiatec-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "identifier", foreground: "9CDCFE" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
      ],
      colors: {
        "editor.background": "#0D1117",
        "editor.foreground": "#F0F6FC",
        "editorLineNumber.foreground": "#6E7681",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
      },
    });

    // Set custom theme
    monaco.editor.setTheme("communiatec-dark");

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    // Handle content changes
    editor.onDidChangeModelContent((e) => {
      if (onChange) {
        onChange(editor.getValue(), e);
      }
    });
  };

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      editor.setValue(value);
      if (position) {
        editor.setPosition(position);
      }
    }
  }, [value]);

  // Render participant cursors
  useEffect(() => {
    if (isReady && editorRef.current && participants) {
      const editor = editorRef.current;
      const model = editor.getModel();

      // Clear existing decorations
      const existingDecorations = editor.getModel()?._decorations || [];

      // Add participant cursors
      const decorations = participants
        .filter((p) => p.cursor && p.userId !== "current-user") // Filter out current user
        .map((participant) => ({
          range: new monaco.Range(
            participant.cursor.line,
            participant.cursor.column,
            participant.cursor.line,
            participant.cursor.column + 1
          ),
          options: {
            className: "participant-cursor",
            beforeContentClassName: "participant-cursor-before",
            afterContentClassName: "participant-cursor-after",
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            hoverMessage: { value: participant.username },
          },
        }));

      editor.deltaDecorations([], decorations);
    }
  }, [participants, isReady]);

  return (
    <div className="h-full relative">
      <Editor
        height="100%"
        language={language}
        value={value}
        onMount={handleEditorDidMount}
        theme="communiatec-dark"
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          lineHeight: 20,
          readOnly,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: true,
          smoothScrolling: true,
          multiCursorModifier: "ctrlCmd",
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          folding: true,
          foldingHighlight: true,
          showFoldingControls: "mouseover",
          matchBrackets: "always",
          renderWhitespace: "selection",
          renderControlCharacters: true,
          renderIndentGuides: true,
          colorDecorators: true,
          contextmenu: true,
          mouseWheelZoom: true,
        }}
      />

      {/* Custom CSS for participant cursors */}
      <style>{`
        .participant-cursor-before {
          content: '';
          position: absolute;
          width: 2px;
          height: 20px;
          background-color: var(--participant-color, #007acc);
          animation: cursor-blink 1s infinite;
        }
        
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MonacoEditor;
