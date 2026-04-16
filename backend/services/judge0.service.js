// ✅ DONE — Phase 5: Judge0 service
// Handles code submission to Judge0 CE API and result polling
const axios = require('axios');
const langMap = require('../utils/langMap');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || '';

// Headers for Judge0 (RapidAPI hosted)
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (JUDGE0_KEY && JUDGE0_KEY !== 'your_rapidapi_key_here') {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }
  return headers;
};

/**
 * Submit code to Judge0 for a single test case.
 * @param {string} code — source code
 * @param {string} language — c | cpp | java | python
 * @param {string} stdin — input
 * @param {number} timeLimit — seconds
 * @param {number} memoryLimit — KB (Judge0 expects KB)
 * @returns {Promise<{ token: string }>}
 */
const createSubmission = async (code, language, stdin, timeLimit = 2, memoryLimit = 128000) => {
  const languageId = langMap[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  const payload = {
    source_code: Buffer.from(code).toString('base64'),
    language_id: languageId,
    stdin: Buffer.from(stdin || '').toString('base64'),
    cpu_time_limit: timeLimit,
    memory_limit: memoryLimit,
    wall_time_limit: timeLimit * 2,
    enable_network: false,
  };

  const { data } = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
    payload,
    { headers: getHeaders() }
  );

  return data; // { token }
};

/**
 * Poll Judge0 for the result of a submission.
 * @param {string} token — submission token from createSubmission
 * @param {number} maxAttempts — max polling attempts
 * @param {number} delay — ms between attempts
 * @returns {Promise<Object>}
 */
const getSubmissionResult = async (token, maxAttempts = 20, delay = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await axios.get(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=*`,
      { headers: getHeaders() }
    );

    // Status IDs: 1 = In Queue, 2 = Processing
    if (data.status && data.status.id > 2) {
      return {
        statusId: data.status.id,
        statusDesc: data.status.description,
        stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '',
        stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString() : '',
        compileOutput: data.compile_output
          ? Buffer.from(data.compile_output, 'base64').toString()
          : '',
        time: data.time ? parseFloat(data.time) * 1000 : 0, // to ms
        memory: data.memory || 0, // KB
      };
    }

    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error('Judge0 submission timed out');
};

/**
 * Run code against a single test case and return verdict.
 * @returns {Promise<{ passed: boolean, stdout: string, expected: string, time: number, memory: number, error?: string }>}
 */
const runTestCase = async (code, language, testCase, timeLimit, memoryLimit) => {
  try {
    const { token } = await createSubmission(
      code,
      language,
      testCase.input,
      timeLimit,
      memoryLimit * 1024 // MB → KB
    );

    const result = await getSubmissionResult(token);

    // Status IDs: 3 = Accepted, 4 = WA, 5 = TLE, 6 = CE, 7-12 = RE
    if (result.statusId === 6) {
      // Compilation error
      return {
        passed: false,
        stdout: '',
        expected: testCase.expectedOutput,
        time: 0,
        memory: 0,
        error: result.compileOutput || 'Compilation failed',
        verdictType: 'CE',
      };
    }

    if (result.statusId === 5) {
      return {
        passed: false,
        stdout: result.stdout.trim(),
        expected: testCase.expectedOutput.trim(),
        time: result.time,
        memory: result.memory,
        verdictType: 'TLE',
      };
    }

    if (result.statusId >= 7) {
      return {
        passed: false,
        stdout: result.stdout.trim(),
        expected: testCase.expectedOutput.trim(),
        time: result.time,
        memory: result.memory,
        error: result.stderr || 'Runtime error',
        verdictType: 'RE',
      };
    }

    // Status 3 or 4 — compare output
    const actualOutput = result.stdout.trim();
    const expectedOutput = testCase.expectedOutput.trim();
    const passed = actualOutput === expectedOutput;

    return {
      passed,
      stdout: actualOutput,
      expected: expectedOutput,
      time: result.time,
      memory: result.memory,
      verdictType: passed ? 'AC' : 'WA',
    };
  } catch (err) {
    return {
      passed: false,
      stdout: '',
      expected: testCase.expectedOutput,
      time: 0,
      memory: 0,
      error: err.message,
      verdictType: 'RE',
    };
  }
};

/**
 * Evaluate code against ALL test cases for a question.
 * Returns overall verdict, score, and per-case results.
 */
const evaluateCode = async (code, language, testCases, timeLimit, memoryLimit) => {
  const results = [];
  let hasCE = false;
  let hasTLE = false;
  let hasRE = false;
  let totalTime = 0;
  let maxMemory = 0;
  let compileError = '';

  for (const tc of testCases) {
    const result = await runTestCase(code, language, tc, timeLimit, memoryLimit);
    results.push(result);

    totalTime += result.time;
    maxMemory = Math.max(maxMemory, result.memory);

    if (result.verdictType === 'CE') {
      hasCE = true;
      compileError = result.error || 'Compilation failed';
      // CE means all remaining cases fail too
      break;
    }
    if (result.verdictType === 'TLE') hasTLE = true;
    if (result.verdictType === 'RE') hasRE = true;
  }

  // If CE, fill remaining cases as failed
  if (hasCE) {
    while (results.length < testCases.length) {
      results.push({
        passed: false,
        stdout: '',
        expected: testCases[results.length].expectedOutput,
        time: 0,
        memory: 0,
        verdictType: 'CE',
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const score = Math.round((passedCount / testCases.length) * 100);

  // Determine overall verdict
  let verdict;
  if (hasCE) verdict = 'CE';
  else if (passedCount === testCases.length) verdict = 'AC';
  else if (hasTLE) verdict = 'TLE';
  else if (hasRE) verdict = 'RE';
  else verdict = 'WA';

  return {
    verdict,
    score,
    passedCount,
    totalCases: testCases.length,
    executionTime: Math.round(totalTime),
    memoryUsed: maxMemory,
    compileError: hasCE ? compileError : '',
    testResults: results.map((r, i) => ({
      passed: r.passed,
      input: testCases[i].isHidden ? undefined : testCases[i].input,
      expected: testCases[i].isHidden ? undefined : testCases[i].expectedOutput,
      actual: testCases[i].isHidden ? undefined : r.stdout,
      time: r.time,
      memory: r.memory,
    })),
  };
};

module.exports = { createSubmission, getSubmissionResult, runTestCase, evaluateCode };
