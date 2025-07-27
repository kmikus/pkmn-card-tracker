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
      { name: 'base1', url: '/api/cards/set/base1', description: 'Base Set - classic set (OPTIMIZED)' },
      { name: 'base2', url: '/api/cards/set/base2', description: 'Jungle - classic set (OPTIMIZED)' },
      { name: 'base3', url: '/api/cards/set/base3', description: 'Fossil - classic set (OPTIMIZED)' },
      { name: 'swsh1', url: '/api/cards/set/swsh1', description: 'Sword & Shield - modern set (OPTIMIZED)' },
      { name: 'sv1', url: '/api/cards/set/sv1', description: 'Scarlet & Violet - latest set (OPTIMIZED)' },
      { name: 'g1', url: '/api/cards/set/g1', description: 'Gym Heroes - special set (OPTIMIZED)' },
      { name: 'ex1', url: '/api/cards/set/ex1', description: 'Ruby & Sapphire - EX era (OPTIMIZED)' },
      { name: 'xy1', url: '/api/cards/set/xy1', description: 'XY - XY era (OPTIMIZED)' },
      { name: 'sm1', url: '/api/cards/set/sm1', description: 'Sun & Moon - SM era (OPTIMIZED)' },
      { name: 'celebrations', url: '/api/cards/set/celebrations', description: 'Celebrations - special set (OPTIMIZED)' }
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
          'User-Agent': 'API-Optimized-Test/1.0'
        }
      });

      const responseTime = Date.now() - startTime;
      
      // Extract relevant data based on endpoint
      let cardCount: number | undefined;
      let cardNames: string[] | undefined;
      let totalCount: number | undefined;
      let page: number | undefined;
      let pageSize: number | undefined;

      if (response.data.data && Array.isArray(response.data.data)) {
        cardCount = response.data.data.length;
        cardNames = response.data.data.slice(0, 3).map((card: any) => card.name || card.id);
        totalCount = response.data.totalCount;
        page = response.data.page;
        pageSize = response.data.pageSize;
      }

      return {
        endpoint: url.split('?')[0],
        testCase: url.split('?')[0].split('/').pop() || url,
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
      console.log(`    ❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        const responseTime = Date.now() - startTime;
        return {
          endpoint: url.split('?')[0],
          testCase: url.split('?')[0].split('/').pop() || url,
          status: error.code === 'ECONNABORTED' ? 'timeout' : 'error',
          responseTime,
          retries: attempt,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError;
}

async function runTestSuite(suite: TestSuite) {
  console.log(`\n🧪 Testing ${suite.endpoint}...`);
  
  for (const testCase of suite.testCases) {
    console.log(`\n  📋 ${testCase.name}: ${testCase.description}`);
    
    try {
      const result = await makeRequestWithRetry(testCase.url);
      results.push(result);
      
      if (result.status === 'success') {
        console.log(`    ✅ Success: ${result.responseTime}ms (${result.retries} retries)`);
        if (result.cardCount !== undefined) {
          console.log(`    📊 Cards: ${result.cardCount} (total: ${result.totalCount})`);
        }
      } else {
        console.log(`    ❌ Failed: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`    💥 Unexpected error: ${error.message}`);
    }
  }
}

async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    backendUrl: BACKEND_URL,
    totalTests: results.length,
    successfulTests: results.filter(r => r.status === 'success').length,
    failedTests: results.filter(r => r.status !== 'success').length,
    averageResponseTime: results.filter(r => r.status === 'success')
      .reduce((sum, r) => sum + r.responseTime, 0) / results.filter(r => r.status === 'success').length,
    results: results
  };

  const reportPath = path.join(__dirname, '../../api-optimized-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  return report;
}

function generateMarkdownSummary(report: any): string {
  const successfulResults = report.results.filter((r: any) => r.status === 'success');
  const failedResults = report.results.filter((r: any) => r.status !== 'success');
  
  let markdown = `# API Performance Test Results - OPTIMIZED VERSION\n\n`;
  markdown += `**Test Date:** ${new Date(report.timestamp).toLocaleString()}\n`;
  markdown += `**Backend URL:** ${report.backendUrl}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${report.totalTests}\n`;
  markdown += `- **Successful:** ${report.successfulTests}\n`;
  markdown += `- **Failed:** ${report.failedTests}\n`;
  markdown += `- **Average Response Time:** ${report.averageResponseTime.toFixed(2)}ms\n\n`;
  
  markdown += `## Performance by Endpoint\n\n`;
  
  const endpointGroups = successfulResults.reduce((groups: any, result: any) => {
    if (!groups[result.endpoint]) {
      groups[result.endpoint] = [];
    }
    groups[result.endpoint].push(result);
    return groups;
  }, {});
  
  Object.entries(endpointGroups).forEach(([endpoint, results]: [string, any]) => {
    const avgTime = results.reduce((sum: number, r: any) => sum + r.responseTime, 0) / results.length;
    const minTime = Math.min(...results.map((r: any) => r.responseTime));
    const maxTime = Math.max(...results.map((r: any) => r.responseTime));
    
    markdown += `### ${endpoint}\n\n`;
    markdown += `- **Average:** ${avgTime.toFixed(2)}ms\n`;
    markdown += `- **Min:** ${minTime}ms\n`;
    markdown += `- **Max:** ${maxTime}ms\n`;
    markdown += `- **Tests:** ${results.length}\n\n`;
  });
  
  if (failedResults.length > 0) {
    markdown += `## Failed Tests\n\n`;
    failedResults.forEach((result: any) => {
      markdown += `- **${result.testCase}:** ${result.error}\n`;
    });
    markdown += `\n`;
  }
  
  return markdown;
}

async function main() {
  console.log('🚀 Starting API Performance Test - OPTIMIZED VERSION');
  console.log(`📍 Backend URL: ${BACKEND_URL}`);
  console.log(`⏰ Start Time: ${new Date().toLocaleString()}`);
  
  try {
    for (const suite of testSuites) {
      await runTestSuite(suite);
    }
    
    const report = await generateReport();
    const markdown = generateMarkdownSummary(report);
    
    const markdownPath = path.join(__dirname, '../../api-optimized-summary.md');
    fs.writeFileSync(markdownPath, markdown);
    
    console.log(`\n📝 Markdown summary saved to: ${markdownPath}`);
    console.log(`\n🎉 Test completed!`);
    console.log(`✅ Successful: ${report.successfulTests}/${report.totalTests}`);
    console.log(`⏱️  Average response time: ${report.averageResponseTime.toFixed(2)}ms`);
    
  } catch (error: any) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { main as runOptimizedTest }; 