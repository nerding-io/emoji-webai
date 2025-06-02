#!/usr/bin/env node

/**
 * Health Check Script for Emoji Challenge App
 * Verifies that the deployed app is accessible and functioning
 */

const https = require('https');
const http = require('http');

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://username.github.io/emoji-challenge';
const TIMEOUT = 10000; // 10 seconds

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https:') ? https : http;
        
        const request = lib.get(url, { timeout: TIMEOUT }, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    body: data,
                    headers: response.headers
                });
            });
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function runHealthCheck() {
    console.log('🏥 Running health check for Emoji Challenge App...');
    console.log(`📍 Target URL: ${DEPLOYMENT_URL}`);
    
    try {
        const response = await makeRequest(DEPLOYMENT_URL);
        
        // Check status code
        if (response.statusCode !== 200) {
            throw new Error(`HTTP ${response.statusCode}: Unexpected status code`);
        }
        
        // Check for essential content
        const essentialElements = [
            '<title>Emoji Decode Challenge</title>',
            'multimodal.js',
            'style.css',
            'createMode',
            'generateBtn'
        ];
        
        const missingElements = essentialElements.filter(element => 
            !response.body.includes(element)
        );
        
        if (missingElements.length > 0) {
            throw new Error(`Missing essential elements: ${missingElements.join(', ')}`);
        }
        
        // Check content length
        if (response.body.length < 1000) {
            throw new Error('Response body too short - possible deployment issue');
        }
        
        console.log('✅ Health check passed!');
        console.log(`📊 Response size: ${response.body.length} bytes`);
        console.log(`⏱️  Response time: ${Date.now() - startTime}ms`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Health check failed!');
        console.error('🔍 Error details:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.error('🌐 DNS resolution failed - check if the site is deployed');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🚫 Connection refused - server may be down');
        }
        
        return false;
    }
}

const startTime = Date.now();

// Run the health check
runHealthCheck()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
    }); 