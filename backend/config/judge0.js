// ✅ DONE — Axios instance pre-configured for Judge0 API
const axios = require('axios');

const judge0 = axios.create({
  baseURL: process.env.JUDGE0_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.JUDGE0_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  },
});

module.exports = judge0;
