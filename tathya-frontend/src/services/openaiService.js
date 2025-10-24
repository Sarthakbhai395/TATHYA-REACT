// src/services/openaiService.js
// This service handles communication with the OpenAI API

import { API_BASE, getAuthHeaders } from '../utils/api';

// Use backend for chat requests
export async function getOpenAIResponse(messages) {
  try {
    const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
    const response = await fetch(`${API_BASE.replace(/\/api$/, '')}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Chat request failed');
    return data;
  } catch (error) {
    return { reply: { role: 'assistant', content: 'Our AI is currently unavailable. Please try again soon.' } };
  }
}
