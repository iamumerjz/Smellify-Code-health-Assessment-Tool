# 🚀 Quick Start Guide - React Hook Analyzer

## Step 1: Install Dependencies

```bash
cd c:\Users\HF\Desktop\my_Smellify_18_oct\my_Smellify\backend
npm install
```

This will install the new Babel dependencies (@babel/parser, @babel/traverse, @babel/types).

## Step 2: Test the Analyzer

Run the standalone test to verify everything works:

```bash
node analyzers/test-analyzer.js
```

**Expected Output:**
```
🧪 Testing Hook Analyzer
🔍 Starting project analysis...
📁 Scanning project files...
✓ Found X files to analyze
🔧 Parsing files to AST...
✓ Successfully parsed X/X files
🔗 Building dependency graph...
✓ Dependency graph built
🔍 Running analyzers...
  → Running HookDetector...
  ✓ HookDetector: 10+ violations found
✓ Analysis complete

📊 ANALYSIS RESULTS:
============================================================
Total Files Analyzed: 1
Total Violations: 10+

Violations by Severity:
  Critical: X
  High: X
  Medium: X
  Low: X
...
```

## Step 3: Integration with Your App

The analyzer is now integrated into your backend! Here's how to use it:

### Via API (Recommended for Production)

1. **Upload a project** (you already have this working)

2. **Trigger analysis:**
```bash
POST http://localhost:5000/api/analysis/:projectId/analyze
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

3. **Get results:**
```bash
GET http://localhost:5000/api/analysis/:projectId
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### Programmatically (For Testing)

```javascript
const MainAnalyzer = require('./analyzers');

async function analyzeProject(projectPath) {
  const analyzer = new MainAnalyzer(projectPath);
  const results = await analyzer.analyze();
  
  console.log(`Found ${results.summary.totalViolations} violations`);
  console.log(results.violations);
}

// Example
analyzeProject('./uploads/projects/extracted-projects/project-123');
```

## Step 4: Test with Real Project

1. **Upload a React project via your frontend**

2. **Find the extracted path** in the database:
```javascript
// In MongoDB or via your API
Project.findById('projectId').then(project => {
  console.log('Extracted path:', project.extractedPath);
});
```

3. **Run analysis via Postman/Curl:**
```bash
curl -X POST http://localhost:5000/api/analysis/YOUR_PROJECT_ID/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Step 5: View Results

Results are saved in the `Project` model under `analysisReport`:

```javascript
{
  summary: {
    totalViolations: 12,
    violationsBySeverity: { critical: 8, high: 2, ... }
  },
  violations: [
    {
      type: 'HOOK_IN_CONDITION',
      severity: 'critical',
      file: 'src/components/UserProfile.js',
      line: 45,
      hookName: 'useState',
      explanation: '...',
      recommendation: '...'
    }
  ]
}
```

## 🎨 Next Steps for Frontend Integration

Create a new page to display analysis results:

```javascript
// pages/analysis.js or pages/project-analysis.js
import { useEffect, useState } from 'react';
import api from '../services/api';

function AnalysisPage({ projectId }) {
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    // Fetch analysis results
    api.get(`/analysis/${projectId}`)
      .then(res => setAnalysis(res.data.analysis))
      .catch(err => console.error(err));
  }, [projectId]);
  
  if (!analysis) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Analysis Results</h1>
      <p>Total Violations: {analysis.summary.totalViolations}</p>
      
      {analysis.violations.map(violation => (
        <div key={violation.id} className="violation-card">
          <h3>{violation.type} - {violation.severity}</h3>
          <p>File: {violation.file}:{violation.line}</p>
          <p>Hook: {violation.hookName}</p>
          <pre>{violation.codeSnippet}</pre>
          <p>{violation.explanation}</p>
          <p><strong>Fix:</strong> {violation.recommendation}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Issue: "Cannot find module '@babel/parser'"

**Solution:** Run `npm install` in the backend directory.

### Issue: "Analysis failed"

**Checklist:**
- ✅ Project has been uploaded and extracted
- ✅ `extractedPath` exists in database
- ✅ Files are valid JavaScript/JSX
- ✅ Check server logs for specific errors

### Issue: No violations found

**Possible reasons:**
- Project doesn't use React hooks
- Hooks are used correctly (good!)
- Files are being skipped (check excluded patterns)

## 📊 Understanding Severity Levels

- **Critical** 🔴: Violates Rules of Hooks, will cause bugs
- **High** 🟠: Likely to cause issues, should fix ASAP
- **Medium** 🟡: Code smell, recommended to fix
- **Low** 🟢: Minor issue, nice to fix

## 🎯 Common Violations & Fixes

### 1. Hook in Condition

❌ **Wrong:**
```javascript
if (condition) {
  const [state, setState] = useState(0);
}
```

✅ **Right:**
```javascript
const [state, setState] = useState(condition ? 0 : null);
```

### 2. Hook in Loop

❌ **Wrong:**
```javascript
items.map(item => {
  const [selected, setSelected] = useState(false);
});
```

✅ **Right:**
```javascript
// Create separate component
function Item({ item }) {
  const [selected, setSelected] = useState(false);
  return <div>{item.name}</div>;
}

// In parent:
items.map(item => <Item key={item.id} item={item} />)
```

### 3. Hook in Nested Function

❌ **Wrong:**
```javascript
const handleClick = () => {
  const [value, setValue] = useState(0);
};
```

✅ **Right:**
```javascript
const [value, setValue] = useState(0);
const handleClick = () => {
  setValue(prev => prev + 1);
};
```

## 🚀 What's Next?

1. **Install dependencies** ✅
2. **Run test** ✅
3. **Test with API** → You are here
4. **Build frontend UI** → Next step
5. **Deploy to production** → Coming soon

## 📞 Need Help?

Check the full README in `analyzers/README.md` for detailed documentation.

Happy coding! 🎉
