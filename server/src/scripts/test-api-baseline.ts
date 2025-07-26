import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

interface TestResult {
  endpoint: string;
  testCase: string;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  retries: number;
  cardCount?: number;
  cardNames?: string[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  error?: string;
  timestamp: string;
}

interface TestSuite {
  endpoint: string;
  testCases: Array<{
    name: string;
    url: string;
    description: string;
  }>;
}

const testSuites: TestSuite[] = [
  {
    endpoint: '/api/cards/search',
    testCases: [
      { name: 'pikachu', url: '/api/cards/search?name=pikachu', description: 'Base case - common Pokémon' },
      { name: 'charizard', url: '/api/cards/search?name=charizard', description: 'Base case - popular Pokémon' },
      { name: 'ivysaur', url: '/api/cards/search?name=ivysaur', description: 'Edge case - contains dark in some card names' },
      { name: 'nidoran', url: '/api/cards/search?name=nidoran', description: 'Edge case - gender-specific species' },
      { name: 'iron_hands', url: '/api/cards/search?name=iron%20hands', description: 'Edge case - space in name' },
      { name: 'ninetales', url: '/api/cards/search?name=ninetales', description: 'Edge case - regional variants' },
      { name: 'toxtricity', url: '/api/cards/search?name=toxtricity', description: 'Edge case - form differences' }
    ]
  },
  {
    endpoint: '/api/cards/set',
    testCases: [
      { name: 'base1', url: '/api/cards/set/base1', description: 'Base Set - classic set' },
      { name: 'base2', url: '/api/cards/set/base2', description: 'Jungle - classic set' },
      { name: 'base3', url: '/api/cards/set/base3', description: 'Fossil - classic set' },
      { name: 'swsh1', url: '/api/cards/set/swsh1', description: 'Sword & Shield - modern set' },
      { name: 'sv1', url: '/api/cards/set/sv1', description: 'Scarlet & Violet - latest set' },
      { name: 'g1', url: '/api/cards/set/g1', description: 'Gym Heroes - special set' },
      { name: 'ex1', url: '/api/cards/set/ex1', description: 'Ruby & Sapphire - EX era' },
      { name: 'xy1', url: '/api/cards/set/xy1', description: 'XY - XY era' },
      { name: 'sm1', url: '/api/cards/set/sm1', description: 'Sun & Moon - SM era' },
      { name: 'celebrations', url: '/api/cards/set/celebrations', description: 'Celebrations - special set' }
    ]
  },
  {
    endpoint: '/api/sets',
    testCases: [
      { name: 'all_sets', url: '/api/sets', description: 'All sets' },
      { name: 'page1_10', url: '/api/sets?page=1&pageSize=10', description: 'Pagination - first page, 10 items' },
      { name: 'page2_20', url: '/api/sets?page=2&pageSize=20', description: 'Pagination - second page, 20 items' },
      { name: 'page1_1', url: '/api/sets?page=1&pageSize=1', description: 'Pagination - single item' },
      { name: 'page999_10', url: '/api/sets?page=999&pageSize=10', description: 'Pagination - out of bounds' },
      { name: 'page1_250', url: '/api/sets?pageSize=250', description: 'Pagination - large page size' }
    ]
  },
  {
    endpoint: '/api/pokemon/species',
    testCases: [
      { name: 'all_species', url: '/api/pokemon/species?limit=1008', description: 'All species (1008)' },
      { name: 'limited_50', url: '/api/pokemon/species?limit=50', description: 'Limited species list (50)' },
      { name: 'page1_10', url: '/api/pokemon/species?limit=10&offset=0', description: 'Pagination - first page' },
      { name: 'page100_10', url: '/api/pokemon/species?limit=10&offset=100', description: 'Pagination - middle page' },
      { name: 'page1_1', url: '/api/pokemon/species?limit=1&offset=0', description: 'Pagination - single item' },
      { name: 'page9999_10', url: '/api/pokemon/species?limit=10&offset=9999', description: 'Pagination - out of bounds' },
      { name: 'zero_limit', url: '/api/pokemon/species?limit=0', description: 'Edge case - zero limit' },
      { name: 'no_params', url: '/api/pokemon/species', description: 'Edge case - no parameters' }
    ]
  }
];

const results: TestResult[] = [];

async function makeRequestWithRetry(url: string, maxRetries: number = 5, timeout: number = 180000): Promise<TestResult> {
  const startTime = Date.now();
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fullUrl = `${BACKEND_URL}${url}`;
      console.log(`  Attempt ${attempt}/${maxRetries}: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, {
        timeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'API-Baseline-Test/1.0'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      // Extract card names and counts based on endpoint
      let cardCount: number | undefined;
      let cardNames: string[] | undefined;
      let totalCount: number | undefined;
      let page: number | undefined;
      let pageSize: number | undefined;
      
      if (response.data.data && Array.isArray(response.data.data)) {
        cardCount = response.data.data.length;
        
        // Extract card names for card endpoints
        if (url.includes('/cards/')) {
          cardNames = response.data.data.map((card: any) => card.name).filter(Boolean);
        }
        
        // Extract pagination info
        if (response.data.page !== undefined) page = response.data.page;
        if (response.data.pageSize !== undefined) pageSize = response.data.pageSize;
        if (response.data.totalCount !== undefined) totalCount = response.data.totalCount;
      }
      
      // Handle Pokémon species endpoint
      if (url.includes('/pokemon/species')) {
        if (response.data.results && Array.isArray(response.data.results)) {
          cardCount = response.data.results.length;
          cardNames = response.data.results.map((species: any) => species.name).filter(Boolean);
        }
        if (response.data.count !== undefined) totalCount = response.data.count;
      }
      
      return {
        endpoint: url.split('?')[0],
        testCase: url,
        status: 'success',
        responseTime,
        retries: attempt - 1,
        cardCount,
        cardNames,
        totalCount,
        page,
        pageSize,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: any) {
      lastError = error;
      console.log(`    Error on attempt ${attempt}: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`    Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  const responseTime = Date.now() - startTime;
  
  return {
    endpoint: url.split('?')[0],
    testCase: url,
    status: 'error',
    responseTime,
    retries: maxRetries,
    error: lastError?.message || 'Unknown error',
    timestamp: new Date().toISOString()
  };
}

async function runTestSuite(suite: TestSuite) {
  console.log(`\n🧪 Testing ${suite.endpoint}...`);
  console.log('='.repeat(50));
  
  for (const testCase of suite.testCases) {
    console.log(`\n📋 ${testCase.name}: ${testCase.description}`);
    const result = await makeRequestWithRetry(testCase.url);
    results.push(result);
    
    if (result.status === 'success') {
      console.log(`  ✅ Success (${result.responseTime}ms, ${result.retries} retries)`);
      console.log(`  📊 Cards: ${result.cardCount || 0}, Total: ${result.totalCount || 'N/A'}`);
      if (result.cardNames && result.cardNames.length > 0) {
        console.log(`  📝 Sample names: ${result.cardNames.slice(0, 5).join(', ')}${result.cardNames.length > 5 ? '...' : ''}`);
      }
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
    
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function generateReport() {
  const report = {
    summary: {
      totalTests: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      averageResponseTime: results
        .filter(r => r.status === 'success')
        .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.status === 'success').length || 0
    },
    results: results,
    timestamp: new Date().toISOString()
  };
  
  const reportPath = path.join(__dirname, '../../api-baseline-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Test Summary:');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Successful: ${report.summary.successful}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Average Response Time: ${Math.round(report.summary.averageResponseTime)}ms`);
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  // Generate markdown summary
  const markdownPath = path.join(__dirname, '../../api-baseline-summary.md');
  const markdown = generateMarkdownSummary(report);
  fs.writeFileSync(markdownPath, markdown);
  console.log(`📝 Markdown summary saved to: ${markdownPath}`);
}

function generateMarkdownSummary(report: any): string {
  let markdown = `# API Baseline Test Results\n\n`;
  markdown += `**Test Date:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${report.summary.totalTests}\n`;
  markdown += `- **Successful:** ${report.summary.successful}\n`;
  markdown += `- **Failed:** ${report.summary.failed}\n`;
  markdown += `- **Average Response Time:** ${Math.round(report.summary.averageResponseTime)}ms\n\n`;
  
  markdown += `## Results by Endpoint\n\n`;
  
  const endpointGroups = results.reduce((groups: any, result) => {
    const endpoint = result.endpoint;
    if (!groups[endpoint]) groups[endpoint] = [];
    groups[endpoint].push(result);
    return groups;
  }, {});
  
  for (const [endpoint, endpointResults] of Object.entries(endpointGroups)) {
    markdown += `### ${endpoint}\n\n`;
    markdown += `| Test Case | Status | Response Time | Card Count | Total Count | Notes |\n`;
    markdown += `|-----------|--------|---------------|------------|-------------|-------|\n`;
    
    (endpointResults as TestResult[]).forEach(result => {
      const status = result.status === 'success' ? '✅' : '❌';
      const cardCount = result.cardCount || 'N/A';
      const totalCount = result.totalCount || 'N/A';
      const notes = result.error || '';
      
      markdown += `| ${result.testCase} | ${status} | ${result.responseTime}ms | ${cardCount} | ${totalCount} | ${notes} |\n`;
    });
    
    markdown += '\n';
  }
  
  return markdown;
}

async function main() {
  console.log('🚀 Starting API Baseline Tests...');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log(`⏰ Start Time: ${new Date().toISOString()}`);
  
  try {
    for (const suite of testSuites) {
      await runTestSuite(suite);
    }
    
    await generateReport();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}