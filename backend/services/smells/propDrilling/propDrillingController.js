// services/propDrilling/propDrillingController.js
const path = require('path');
const glob = require('fast-glob');
const { parseReactFile } = require('./astParser');
const { buildComponentMap, printComponentMapSummary } = require('./componentMapper');
const { buildAllPropChains, getChainStats } = require('./chainBuilder');
const { detectPropDrilling, generateSummary, formatDrillingReport, printDrillingIssues } = require('./drillingDetector');
const Project = require('../../../models/repository');

/**
 * Main function to analyze prop drilling - Modified to work as a service
 */
async function analyzePropDrilling(extractedPath) {
  try {
    console.log('Starting prop drilling analysis...');
    console.log('Project path:', extractedPath);

    // Find all React files
    const reactFiles = await findReactFiles(extractedPath);
    console.log(`Found ${reactFiles.length} React files`);

    if (reactFiles.length === 0) {
      return {
        stats: { 
          totalFiles: 0, 
          totalComponents: 0,
          filesWithErrors: 0
        },
        propDrillingIssues: [],
        summary: { 
          totalIssues: 0,
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0,
          affectedProps: 0,
          affectedFiles: 0,
          deepestChain: 0,
          totalDrillingPoints: 0
        }
      };
    }

    // Parse all React files
    console.log('Parsing React files...');
    const parsedFiles = reactFiles.map(file => parseReactFile(file));

    // Build component map
    console.log('Building component map...');
    const { componentMap, stats } = buildComponentMap(parsedFiles);
    
    console.log(`\n📊 Component Map Stats:`);
    console.log(`   - Total components: ${stats.totalComponents}`);
    console.log(`   - Total files: ${stats.totalFiles}`);
    console.log(`   - Files with errors: ${stats.filesWithErrors}`);

    // Build prop flow chains
    console.log('\nBuilding prop flow chains...');
    const chains = buildAllPropChains(componentMap);
    const chainStats = getChainStats(chains);
    console.log(`Built ${chains.length} prop chains`);

    // Detect prop drilling
    console.log('Detecting prop drilling patterns...');
    const drillingIssues = detectPropDrilling(chains);
    
    // Generate summary
    const summary = generateSummary(drillingIssues);
    
    // Print results to console
    printDrillingIssues(drillingIssues);

    // Format the report - THIS is what should be saved
    const report = formatDrillingReport(drillingIssues, summary);

    console.log('✅ Prop drilling analysis completed');

    // Return the FORMATTED report data for database storage
    return {
      stats: {
        totalFiles: stats.totalFiles,
        totalComponents: stats.totalComponents,
        filesWithErrors: stats.filesWithErrors
      },
      propDrillingIssues: report.issues, // Use formatted issues, not raw drillingIssues
      summary: report.summary,            // Use formatted summary
      // Optional: Keep raw data for debugging if needed
      _debug: {
        chains: chains,
        chainStats: chainStats
      }
    };

  } catch (error) {
    console.error('Error in prop drilling analysis:', error);
    throw error;
  }
}

/**
 * Find all React files in the project
 */
async function findReactFiles(projectPath) {
  const patterns = [
    '**/*.{js,jsx,tsx}',
    '!**/node_modules/**',
    '!**/build/**',
    '!**/dist/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.test.{js,jsx,tsx}',
    '!**/*.spec.{js,jsx,tsx}'
  ];

  const files = await glob(patterns, {
    cwd: projectPath,
    absolute: true
  });

  return files;
}

/**
 * Get analysis history for a user
 */
async function getAnalysisHistory(req, res) {
  try {
    const userId = req.user?._id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = userId ? { userId } : {};

    const analyses = await Project.find(query)
      .sort({ 'propDrillingAnalysis.completedAt': -1 })
      .skip(skip)
      .limit(limit)
      .select('projectName propDrillingAnalysis.status propDrillingAnalysis.results.summary propDrillingAnalysis.completedAt');

    const total = await Project.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: analyses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
}

/**
 * Get a specific analysis by ID
 */
async function getAnalysisById(req, res) {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .select('projectName propDrillingAnalysis');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.propDrillingAnalysis || project.propDrillingAnalysis.status !== 'completed') {
      return res.status(404).json({
        success: false,
        message: 'Prop drilling analysis not available for this project'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        projectName: project.projectName,
        analysis: project.propDrillingAnalysis
      }
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching analysis',
      error: error.message
    });
  }
}

/**
 * Delete an analysis by ID
 */
async function deleteAnalysis(req, res) {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Clear prop drilling analysis data
    project.propDrillingAnalysis = {
      status: 'pending',
      results: {}
    };

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Prop drilling analysis deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting analysis',
      error: error.message
    });
  }
}

module.exports = {
  analyzePropDrilling,
  getAnalysisHistory,
  getAnalysisById,
  deleteAnalysis
};