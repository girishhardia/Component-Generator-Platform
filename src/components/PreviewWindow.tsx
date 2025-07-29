'use client';

import { useSessionStore } from '@/store/useSessionStore';

export default function PreviewWindow() {
  const { tsx, css } = useSessionStore((state) => state.generatedCode);

  // This HTML document will be rendered inside the iframe.
  // It includes React, Babel for JSX transpilation, and our generated code.
  const srcDoc = `
    <html>
      <head>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          body { 
            font-family: sans-serif; 
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            box-sizing: border-box;
          }
          ${css}
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          // Ensure we handle cases where the code might not be a valid component yet
          try {
            const App = () => {
              ${tsx.includes('export default') ? `const Component = (() => { ${tsx.replace('export default', 'return')} })();` : 'const Component = () => <div>Invalid Component Code</div>;'}
              return <Component />;
            };
            const container = document.getElementById('root');
            const root = ReactDOM.createRoot(container);
            root.render(<App />);
          } catch (err) {
            const container = document.getElementById('root');
            container.innerHTML = \`<div style="color: red; font-family: monospace;"><h3>Render Error:</h3><pre>\${err.message}</pre></div>\`;
            console.error(err);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full bg-white">
      <iframe
        title="Component Preview"
        className="w-full h-full border-0"
        srcDoc={srcDoc}
        sandbox="allow-scripts" // Security sandbox
      />
    </div>
  );
}