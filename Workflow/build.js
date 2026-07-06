const fs = require('fs');
const path = require('path');

const components = [
  'Login.jsx',
  'Dashboard.jsx',
  'AdminViews.jsx',
  'HeadViews.jsx',
  'App.jsx'
];

let finalCode = '';

components.forEach(file => {
  const filePath = path.join(__dirname, 'components', file);
  const code = fs.readFileSync(filePath, 'utf8');
  finalCode += `\n// --- ${file} ---\n` + code;
});

// Append rendering logic
finalCode += `\n
// Start Application
window.addEventListener('load', () => {
  setTimeout(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  }, 1000);
});
`;

fs.writeFileSync(path.join(__dirname, 'app.jsx'), finalCode);
console.log('Build complete: app.jsx created.');
