const fs = require('fs');
const Babel = require('@babel/standalone');

const code = fs.readFileSync('app.jsx', 'utf8');
try {
  Babel.transform(code, { presets: ['react', 'env'] });
  console.log("No syntax errors found!");
} catch (e) {
  console.error("Syntax Error:", e.message);
}
