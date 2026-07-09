import os
import re

components = [
    'Login.jsx',
    'Dashboard.jsx',
    'AdminViews.jsx',
    'HeadViews.jsx',
    'App.jsx'
]

final_code = 'const { useState, useEffect, useRef } = React;\n\n'
final_code += '''
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', margin: '20px', borderRadius: '8px', fontFamily: 'monospace' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>React Component Error</h2>
          <p>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '10px', fontSize: '12px', overflowX: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
'''

for file in components:
    filepath = os.path.join('components', file)
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
        # Remove any const { ... } = React; lines to avoid redeclaration errors
        code = re.sub(r'const\s*\{[^}]+\}\s*=\s*React;', '', code)
        final_code += f'\n// --- {file} ---\n' + code

final_code = final_code.replace('<App />', '<ErrorBoundary><App /></ErrorBoundary>')

final_code += '''
// Start Application immediately
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);
'''

# Escape backticks, dollars, and backslashes for JS template literal
escaped_code = final_code.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')

final_js = f"""
(function() {{
  const appCode = `{escaped_code}`;
  const script = document.createElement('script');
  script.type = 'text/babel';
  script.setAttribute('data-presets', 'react,env');
  script.text = appCode;
  document.head.appendChild(script);
  
  // Trigger Babel if already loaded, else wait
  if (window.Babel) {{
    window.Babel.transformScriptTags();
  }} else {{
    window.addEventListener('DOMContentLoaded', () => {{
      if (window.Babel) window.Babel.transformScriptTags();
    }});
  }}
}})();
"""

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(final_js)

print('Build complete: app.js created for local file:// usage.')
