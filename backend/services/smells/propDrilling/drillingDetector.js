// services/drillingDetector.js

/**
 * Detect prop drilling patterns in all chains
 */
// function detectPropDrilling(chains) {
//   const drillingIssues = [];

//   chains.forEach(({ prop, chain }) => {
//     const issue = analyzePropChain(prop, chain);
    
//     if (issue) {
//       drillingIssues.push(issue);
//     }
//   });

//   // Sort by severity (high -> medium -> low) and then by depth
//   drillingIssues.sort((a, b) => {
//     const severityOrder = { high: 3, medium: 2, low: 1 };
//     const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    
//     if (severityDiff !== 0) return severityDiff;
//     return b.depth - a.depth;
//   });

//   return drillingIssues;
// }

// /**
//  * Analyze a single prop chain to determine if it's prop drilling
//  */
// function analyzePropChain(prop, chain) {
//   // Rule 1: Chain must be at least 3 components long
//   if (chain.length < 3) {
//     return null;
//   }

//   // Rule 2: At least one intermediate component must NOT use the prop
//   const intermediateComponents = chain.slice(1, -1);
//   const hasUnusedIntermediate = intermediateComponents.some(node => !node.usedHere);

//   if (!hasUnusedIntermediate) {
//     // All intermediate components use the prop, so it's not drilling
//     return null;
//   }

//   // Calculate depth (number of components in chain)
//   const depth = chain.length;

//   // Determine severity
//   const severity = calculateSeverity(depth, intermediateComponents);

//   return {
//     prop,
//     severity,
//     depth,
//     chain
//   };
// }

// /**
//  * Calculate severity based on depth and usage pattern
//  */
// function calculateSeverity(depth, intermediateComponents) {
//   // Count how many intermediate components DON'T use the prop
//   const unusedCount = intermediateComponents.filter(node => !node.usedHere).length;
//   const unusedRatio = unusedCount / intermediateComponents.length;

//   if (depth >= 4) {
//     return 'high';
//   } else if (depth === 3) {
//     // If most intermediates don't use it, it's medium severity
//     return unusedRatio > 0.5 ? 'medium' : 'low';
//   } else {
//     return 'low';
//   }
// }

// /**
//  * Generate summary statistics for drilling issues
//  */
// function generateSummary(drillingIssues) {
//   const summary = {
//     totalIssues: drillingIssues.length,
//     highSeverity: 0,
//     mediumSeverity: 0,
//     lowSeverity: 0,
//     affectedProps: new Set(),
//     affectedFiles: new Set(),
//     deepestChain: 0
//   };

//   drillingIssues.forEach(issue => {
//     // Count by severity
//     if (issue.severity === 'high') summary.highSeverity++;
//     else if (issue.severity === 'medium') summary.mediumSeverity++;
//     else summary.lowSeverity++;

//     // Track affected props and files
//     summary.affectedProps.add(issue.prop);
//     issue.chain.forEach(node => {
//       summary.affectedFiles.add(node.file);
//     });

//     // Track deepest chain
//     if (issue.depth > summary.deepestChain) {
//       summary.deepestChain = issue.depth;
//     }
//   });

//   // Convert Sets to counts
//   summary.affectedProps = summary.affectedProps.size;
//   summary.affectedFiles = summary.affectedFiles.size;

//   return summary;
// }

// /**
//  * Filter drilling issues by severity
//  */
// function filterBySeverity(drillingIssues, severity) {
//   return drillingIssues.filter(issue => issue.severity === severity);
// }

// /**
//  * Get top N most severe drilling issues
//  */
// function getTopIssues(drillingIssues, limit = 10) {
//   return drillingIssues.slice(0, limit);
// }

// /**
//  * Format drilling issues for JSON output
//  */
// function formatDrillingReport(drillingIssues, summary) {
//   return {
//     summary: {
//       totalIssues: summary.totalIssues,
//       highSeverity: summary.highSeverity,
//       mediumSeverity: summary.mediumSeverity,
//       lowSeverity: summary.lowSeverity,
//       affectedProps: summary.affectedProps,
//       affectedFiles: summary.affectedFiles,
//       deepestChain: summary.deepestChain
//     },
//     issues: drillingIssues.map(issue => ({
//       prop: issue.prop,
//       severity: issue.severity,
//       depth: issue.depth,
//       chain: issue.chain.map(node => ({
//         component: node.component,
//         file: node.file,
//         line: node.line,
//         usedHere: node.usedHere,
//         passedTo: node.passedTo || null
//       }))
//     }))
//   };
// }

// /**
//  * Print drilling issues to console (for debugging)
//  */
// function printDrillingIssues(drillingIssues) {
//   console.log('\n=== Prop Drilling Detection Results ===\n');
  
//   if (drillingIssues.length === 0) {
//     console.log('No prop drilling detected!');
//     return;
//   }

//   drillingIssues.forEach((issue, index) => {
//     const severityEmoji = {
//       high: '',
//       medium: '',
//       low: ''
//     };

//     console.log(`\n${index + 1}. ${severityEmoji[issue.severity]} ${issue.severity.toUpperCase()} - Prop: "${issue.prop}" (Depth: ${issue.depth})`);
//     console.log('   Chain:');
    
//     issue.chain.forEach((node, i) => {
//       const arrow = i < issue.chain.length - 1 ? ' ↓' : ' ✓';
//       const usage = node.usedHere ? '[USED]' : '[FORWARDED]';
//       console.log(`   ${arrow} ${node.component} ${usage}`);
//       console.log(`      ${node.file}:${node.line}`);
//     });
//   });
// }

// module.exports = {
//   detectPropDrilling,
//   analyzePropChain,
//   generateSummary,
//   filterBySeverity,
//   getTopIssues,
//   formatDrillingReport,
//   printDrillingIssues
// };


// services/drillingDetector.js

/**
 * Detect prop drilling patterns in all chains
 */
function detectPropDrilling(chains) {
  const drillingIssues = [];

  chains.forEach(({ prop, chain }) => {
    const issue = analyzePropChain(prop, chain);
    
    if (issue) {
      drillingIssues.push(issue);
    }
  });

  // Sort by severity (high -> medium -> low) and then by depth
  drillingIssues.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    
    if (severityDiff !== 0) return severityDiff;
    return b.depth - a.depth;
  });

  return drillingIssues;
}

/**
 * Analyze a single prop chain to determine if it's prop drilling
 */
function analyzePropChain(prop, chain) {
  // Rule 1: Chain must be at least 3 components long
  if (chain.length < 3) {
    return null;
  }

  // Rule 2: At least one intermediate component must NOT use the prop
  const intermediateComponents = chain.slice(1, -1);
  const hasUnusedIntermediate = intermediateComponents.some(node => !node.usedHere);

  if (!hasUnusedIntermediate) {
    return null;
  }

  const depth = chain.length;
  const severity = calculateSeverity(depth, intermediateComponents);

  // NEW: Extract specific drilling locations
  const drillingLocations = identifyDrillingLocations(chain);

  return {
    prop,
    severity,
    depth,
    chain,
    drillingLocations, // NEW: Precise locations where drilling occurs
    recommendation: generateRecommendation(prop, chain) // NEW: Actionable advice
  };
}

/**
 * NEW: Identify exact locations where prop drilling occurs
 */
function identifyDrillingLocations(chain) {
  const locations = [];

  chain.forEach((node, index) => {
    // Check if this is an intermediate component that just forwards
    if (index > 0 && index < chain.length - 1 && !node.usedHere) {
      locations.push({
        component: node.component,
        file: node.file,
        line: node.line,
        issue: 'FORWARDING_ONLY',
        description: `Component "${node.component}" receives the prop but only forwards it without using it`,
        passedTo: node.passedTo || 'unknown'
      });
    }
  });

  // Also identify the source and destination
  const source = chain[0];
  const destination = chain[chain.length - 1];

  return {
    drillingPoints: locations,
    source: {
      component: source.component,
      file: source.file,
      line: source.line
    },
    finalDestination: {
      component: destination.component,
      file: destination.file,
      line: destination.line,
      usedHere: destination.usedHere
    }
  };
}

/**
 * NEW: Generate actionable recommendations
 */
function generateRecommendation(prop, chain) {
  const intermediateComponents = chain.slice(1, -1);
  const unusedCount = intermediateComponents.filter(node => !node.usedHere).length;

  if (chain.length >= 4) {
    return {
      solution: 'Context API or State Management',
      reason: `Prop "${prop}" passes through ${unusedCount} intermediate component(s). Consider using React Context or a state management library like Redux/Zustand.`,
      steps: [
        `Create a context for "${prop}"`,
        `Provide the context at "${chain[0].component}"`,
        `Consume directly in "${chain[chain.length - 1].component}"`,
        `Remove prop from intermediate components: ${intermediateComponents.map(n => n.component).join(', ')}`
      ]
    };
  } else {
    return {
      solution: 'Component Composition',
      reason: `Short drilling chain. Consider component composition or lifting shared logic.`,
      steps: [
        `Consider if "${chain[chain.length - 1].component}" can be composed differently`,
        `Or create a wrapper component to avoid prop threading`
      ]
    };
  }
}

/**
 * Calculate severity based on depth and usage pattern
 */
function calculateSeverity(depth, intermediateComponents) {
  const unusedCount = intermediateComponents.filter(node => !node.usedHere).length;
  const unusedRatio = unusedCount / intermediateComponents.length;

  if (depth >= 4) {
    return 'high';
  } else if (depth === 3) {
    return unusedRatio > 0.5 ? 'medium' : 'low';
  } else {
    return 'low';
  }
}

/**
 * Generate summary statistics for drilling issues
 */
function generateSummary(drillingIssues) {
  const summary = {
    totalIssues: drillingIssues.length,
    highSeverity: 0,
    mediumSeverity: 0,
    lowSeverity: 0,
    affectedProps: new Set(),
    affectedFiles: new Set(),
    deepestChain: 0,
    totalDrillingPoints: 0 // NEW: Total number of forwarding-only components
  };

  drillingIssues.forEach(issue => {
    if (issue.severity === 'high') summary.highSeverity++;
    else if (issue.severity === 'medium') summary.mediumSeverity++;
    else summary.lowSeverity++;

    summary.affectedProps.add(issue.prop);
    issue.chain.forEach(node => {
      summary.affectedFiles.add(node.file);
    });

    if (issue.depth > summary.deepestChain) {
      summary.deepestChain = issue.depth;
    }

    // NEW: Count drilling points
    summary.totalDrillingPoints += issue.drillingLocations.drillingPoints.length;
  });

  summary.affectedProps = summary.affectedProps.size;
  summary.affectedFiles = summary.affectedFiles.size;

  return summary;
}

/**
 * ENHANCED: Format drilling issues with precise location details
 */
function formatDrillingReport(drillingIssues, summary) {
  return {
    summary: {
      totalIssues: summary.totalIssues,
      highSeverity: summary.highSeverity,
      mediumSeverity: summary.mediumSeverity,
      lowSeverity: summary.lowSeverity,
      affectedProps: summary.affectedProps,
      affectedFiles: summary.affectedFiles,
      deepestChain: summary.deepestChain,
      totalDrillingPoints: summary.totalDrillingPoints
    },
    issues: drillingIssues.map(issue => ({
      prop: issue.prop,
      severity: issue.severity,
      depth: issue.depth,
      
      // NEW: Detailed location information
      locations: {
        source: issue.drillingLocations.source,
        drillingPoints: issue.drillingLocations.drillingPoints,
        finalDestination: issue.drillingLocations.finalDestination
      },
      
      // NEW: Actionable recommendations
      recommendation: issue.recommendation,
      
      // Keep full chain for reference
      fullChain: issue.chain.map(node => ({
        component: node.component,
        file: node.file,
        line: node.line,
        usedHere: node.usedHere,
        passedTo: node.passedTo || null
      }))
    }))
  };
}

/**
 * ENHANCED: Print drilling issues with clear location info
 */
function printDrillingIssues(drillingIssues) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        PROP DRILLING DETECTION RESULTS                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  if (drillingIssues.length === 0) {
    console.log('✅ No prop drilling detected! Your project looks good.\n');
    return;
  }

  console.log(`Found ${drillingIssues.length} prop drilling issue(s):\n`);

  drillingIssues.forEach((issue, index) => {
    const severityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };

    console.log(`\n${'='.repeat(70)}`);
    console.log(`${index + 1}. ${severityEmoji[issue.severity]} ${issue.severity.toUpperCase()} SEVERITY`);
    console.log(`${'='.repeat(70)}`);
    console.log(`📌 Prop: "${issue.prop}"`);
    console.log(`📏 Chain Depth: ${issue.depth} components\n`);

    // Source
    const src = issue.drillingLocations.source;
    console.log(`🏁 SOURCE:`);
    console.log(`   Component: ${src.component}`);
    console.log(`   Location:  ${src.file}:${src.line}\n`);

    // Drilling points (the problem areas)
    if (issue.drillingLocations.drillingPoints.length > 0) {
      console.log(`⚠️  DRILLING POINTS (Components that only forward):`);
      issue.drillingLocations.drillingPoints.forEach((point, i) => {
        console.log(`\n   ${i + 1}. ${point.component}`);
        console.log(`      📄 ${point.file}:${point.line}`);
        console.log(`      ❌ ${point.description}`);
        console.log(`      ➡️  Passes to: ${point.passedTo}`);
      });
      console.log();
    }

    // Final destination
    const dest = issue.drillingLocations.finalDestination;
    console.log(`🎯 FINAL DESTINATION:`);
    console.log(`   Component: ${dest.component}`);
    console.log(`   Location:  ${dest.file}:${dest.line}`);
    console.log(`   Used here: ${dest.usedHere ? '✅ Yes' : '❌ No'}\n`);

    // Recommendation
    console.log(`💡 RECOMMENDATION: ${issue.recommendation.solution}`);
    console.log(`   ${issue.recommendation.reason}\n`);
    console.log(`   Suggested steps:`);
    issue.recommendation.steps.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step}`);
    });
  });

  console.log(`\n${'='.repeat(70)}\n`);
}

/**
 * Filter drilling issues by severity
 */
function filterBySeverity(drillingIssues, severity) {
  return drillingIssues.filter(issue => issue.severity === severity);
}

/**
 * Get top N most severe drilling issues
 */
function getTopIssues(drillingIssues, limit = 10) {
  return drillingIssues.slice(0, limit);
}

module.exports = {
  detectPropDrilling,
  analyzePropChain,
  generateSummary,
  filterBySeverity,
  getTopIssues,
  formatDrillingReport,
  printDrillingIssues
};