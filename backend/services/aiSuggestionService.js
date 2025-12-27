const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate AI suggestions from analysis results
async function generateAISuggestions(analysisResults) {
  try {
    console.log(' Starting AI suggestions generation...');
    
    const prompt = formatAnalysisForAI(analysisResults);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    const suggestions = parseAISuggestions(aiText, analysisResults);
    
    console.log(' AI suggestions generated successfully');
    return suggestions;
    
  } catch (error) {
    console.error(' AI suggestion generation failed:', error.message);
    // Return fallback suggestions instead of throwing
    return createFallbackSuggestions(analysisResults);
  }
}

function formatAnalysisForAI(results) {
  const { analyses, summary } = results;
  
  let prompt = `You are a senior code quality expert. Analyze these code analysis results and provide specific, actionable suggestions.

**CRITICAL**: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.

Required JSON format:
{
  "duplicates": [{"issue": "description", "suggestion": "specific fix", "priority": "high|medium|low", "estimatedImpact": "impact"}],
  "hooks": [{"issue": "description", "suggestion": "specific fix", "priority": "high|medium|low", "estimatedImpact": "impact"}],
  "propDrilling": [{"issue": "description", "suggestion": "specific fix", "priority": "high|medium|low", "estimatedImpact": "impact"}],
  "codeQuality": [{"issue": "description", "suggestion": "specific fix", "priority": "high|medium|low", "estimatedImpact": "impact"}]
}

## Analysis Summary:
- Total Files: ${summary.totalFiles || 0}
- Exact Clone Groups: ${summary.exactClones || 0}
- Near Clone Groups: ${summary.nearClones || 0}
- Hooks Violations: ${summary.hooksViolations || 0} (Critical: ${summary.criticalHooks || 0}, High: ${summary.highHooks || 0})
- Prop Drilling Issues: ${summary.propDrillingIssues || 0} (High: ${summary.highPropDrilling || 0})
- Route Issues: ${summary.routeIssues || 0}

`;

  // Add duplication details
  const dup = analyses.duplication;
  if (dup?.stats?.exactCloneGroups > 0 || dup?.stats?.nearCloneGroups > 0) {
    prompt += `\n## Duplication:\n`;
    prompt += `- ${dup.stats.exactCloneGroups} exact clone groups found\n`;
    prompt += `- ${dup.stats.nearCloneGroups} near clone groups (80%+ similar)\n`;
    prompt += `- ${dup.stats.duplicatedUnits || 0} total duplicated code units\n`;
  }

  // Add hooks details
  const hooks = analyses.hooks;
  if (hooks?.violations?.length > 0) {
    prompt += `\n## React Hooks Issues:\n`;
    const critical = hooks.violations.filter(v => v.severity === 'critical').length;
    const high = hooks.violations.filter(v => v.severity === 'high').length;
    prompt += `- ${critical} critical violations (immediate fix required)\n`;
    prompt += `- ${high} high severity issues\n`;
    prompt += `- Common types: ${[...new Set(hooks.violations.slice(0, 5).map(v => v.type))].join(', ')}\n`;
  }

  // Add prop drilling details
  const propDrilling = analyses.propDrilling;
  if (propDrilling?.summary?.totalIssues > 0) {
    prompt += `\n## Prop Drilling:\n`;
    prompt += `- ${propDrilling.summary.highSeverity || 0} severe cases (4+ levels deep)\n`;
    prompt += `- ${propDrilling.summary.mediumSeverity || 0} moderate cases (3 levels)\n`;
    if (propDrilling.summary.deepestChain) {
      prompt += `- Deepest chain: ${propDrilling.summary.deepestChain} levels\n`;
    }
  }

  // Add code quality details
  const quality = analyses.codeQuality;
  if (quality?.results?.apiRouteIssues?.length > 0 || 
      quality?.results?.mongooseQueryIssues?.length > 0) {
    prompt += `\n## Code Quality:\n`;
    prompt += `- ${quality.results.apiRouteIssues?.length || 0} API route issues\n`;
    prompt += `- ${quality.results.mongooseQueryIssues?.length || 0} database query issues\n`;
    prompt += `- ${quality.results.redundantQueryIssues?.length || 0} redundant queries\n`;
  }

  prompt += `\n\nProvide specific, actionable suggestions. Focus on highest priority improvements.`;
  
  return prompt;
}

function parseAISuggestions(aiText, originalResults) {
  try {
    let cleanText = aiText.trim();
    cleanText = cleanText.replace(/```json\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');
    cleanText = cleanText.trim();
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No valid JSON found');
  } catch (e) {
    console.warn('Failed to parse AI response, using fallback');
    return createFallbackSuggestions(originalResults);
  }
}

function createFallbackSuggestions(results) {
  const { analyses, summary } = results;
  const suggestions = {
    duplicates: [],
    hooks: [],
    propDrilling: [],
    codeQuality: []
  };

  // Duplication
  if (summary.exactClones > 0) {
    suggestions.duplicates.push({
      issue: `${summary.exactClones} exact code duplications found`,
      suggestion: "Extract duplicated code into reusable functions or components. Create shared utility modules.",
      priority: "high",
      estimatedImpact: "Reduces codebase size by ~15-20% and improves maintainability"
    });
  }

  if (summary.nearClones > 0) {
    suggestions.duplicates.push({
      issue: `${summary.nearClones} similar code blocks detected`,
      suggestion: "Refactor similar code into parameterized functions. Use design patterns like Strategy or Template Method.",
      priority: "medium",
      estimatedImpact: "Improves code consistency and reduces future duplication"
    });
  }

  // Hooks
  if (summary.criticalHooks > 0) {
    suggestions.hooks.push({
      issue: `${summary.criticalHooks} critical React Hooks violations`,
      suggestion: "Fix immediately: Ensure hooks are called at component top-level, not in loops/conditions. Follow Rules of Hooks strictly.",
      priority: "high",
      estimatedImpact: "Prevents runtime crashes and unpredictable behavior"
    });
  }

  if (summary.highHooks > 0) {
    suggestions.hooks.push({
      issue: `${summary.highHooks} high-severity hooks issues`,
      suggestion: "Review dependency arrays in useEffect/useCallback. Add missing dependencies or wrap functions with useCallback.",
      priority: "high",
      estimatedImpact: "Fixes stale closures and ensures correct component updates"
    });
  }

  // Prop Drilling
  if (summary.highPropDrilling > 0) {
    suggestions.propDrilling.push({
      issue: `${summary.highPropDrilling} severe prop drilling cases (4+ levels)`,
      suggestion: "Implement React Context API or state management (Redux/Zustand) for deeply nested props. Consider compound components.",
      priority: "high",
      estimatedImpact: "Simplifies component tree and reduces prop forwarding by 60-70%"
    });
  }

  if (summary.mediumPropDrilling > 0) {
    suggestions.propDrilling.push({
      issue: `${summary.mediumPropDrilling} moderate prop drilling cases`,
      suggestion: "Evaluate Context API for 3-level drilling. Use component composition or render props pattern.",
      priority: "medium",
      estimatedImpact: "Improves code readability and component reusability"
    });
  }

  // Code Quality
  if (summary.routeIssues > 0) {
    suggestions.codeQuality.push({
      issue: `${summary.routeIssues} API and database issues detected`,
      suggestion: "Add error handling middleware, input validation, and optimize database queries with indexes and lean().",
      priority: "high",
      estimatedImpact: "Improves API reliability, security, and reduces response time by 30-50%"
    });
  }

  return suggestions;
}

module.exports = {
  generateAISuggestions
};