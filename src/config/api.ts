/**
 * API Configuration
 * 
 * To securely provide your Alpha Vantage API key, use the Antigravity Secrets panel
 * rather than hardcoding it here. Set the secret name to ALPHA_VANTAGE_API_KEY.
 * For local development without secrets, you can use NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY in .env.local
 */
export const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
export const API_BASE_URL = 'https://www.alphavantage.co/query';
