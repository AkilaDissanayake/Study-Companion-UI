// src/services/api.js
/**
 * @file api.js
 * @description Centralized hub for all backend API communication.
 * Handles fetching, posting, and error formatting for the application.
 */

// Grab the backend URL from the environment, defaulting to localhost if missing
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';


/**
 * Standardizes API responses. Throws an error if the response is not OK.
 * @param {Response} res - The raw fetch response object.
 * @returns {Promise<Object>} The parsed JSON data.
 * @throws {Error} If the network request fails or returns an error status.
 */
// Helper function to handle JSON responses and errors uniformly
async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// ==========================================
// 1. AUTHENTICATION APIs
// ==========================================
/**
 * Checks if the user has an active, valid session cookie.
 * @returns {Promise<{user_id: string}>} The current user's ID.
 */
export async function checkAuthSession() {
  const res = await fetch(`${API_BASE_URL}/auth/check`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(res);
}

/**
 * Sends the Google OAuth token to the backend for verification.
 * @param {string} googleToken - The JWT provided by Google Login.
 * @returns {Promise<{user_id: string, config: Object}>} User ID and their saved preferences.
 *   Note: The backend returns { status, data }, we unwrap to data here for consistency.
 */
export async function loginWithGoogle(googleToken) {
  const res = await fetch(`${API_BASE_URL}/login/google?token=${googleToken}`, {
    method: 'POST',
    credentials: 'include'
  });
  const json = await handleResponse(res);
  // The /login/google endpoint returns { status: 'success', data: { user_id, config } }
  return json.data ?? json;
}

/**
 * Instructs the backend to destroy the user's session cookie.
 * @returns {Promise<boolean>} True if logout was successful.
 */
export async function logoutUser() {
  const res = await fetch(`${API_BASE_URL}/login/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  // Logout might not return JSON, so we just check if it succeeded
  if (!res.ok) throw new Error('Logout failed');
  return true; 
}

// ==========================================
// 2. CONFIGURATION APIs
// ==========================================

export async function getUserConfig() {
  const res = await fetch(`${API_BASE_URL}/config/get`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(res);
}

export async function getSubjects() {
  const res = await fetch(`${API_BASE_URL}/config/subjects`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(res);
}

export async function saveUserConfig(payload, isNew = false) {
  const endpoint = isNew ? '/config/create' : '/config/edit';
  const method = isNew ? 'POST' : 'PATCH';
  
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  
  // Return the original response object so the component can check res.ok
  return res;
}

// ==========================================
// 3. FILE MANAGEMENT APIs
// ==========================================
/**
 * Uploads an array of files to a specific subject folder.
 * Note: Browser automatically sets 'multipart/form-data' headers.
 * @param {FormData} formData - The files and target folder payload.
 * @returns {Promise<Response>} The raw fetch response.
 */
export async function uploadFiles(formData) {
  // Note: We do NOT set 'Content-Type' here. The browser automatically 
  // sets it to 'multipart/form-data' when we pass a FormData object.
  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return res;
}

export async function getUserFiles() {
  const res = await fetch(`${API_BASE_URL}/files/names`, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(res);
}

/**
 * Downloads a specific file as a raw binary Blob.
 * @param {string} filename - The name of the file to download.
 * @param {string} subject - The folder/subject where the file is located.
 * @returns {Promise<Blob>} The raw file data.
 */
export async function downloadFileBlob(filename, subject) {
  const url = `${API_BASE_URL}/files/download?filename=${encodeURIComponent(filename)}&subject=${encodeURIComponent(subject)}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });

  if (!res.ok) throw new Error("Failed to download file.");
  
  // We return the raw Blob here, not JSON! 
  // The component will use this Blob to trigger the browser download.
  return res.blob();
}

export async function deleteFile(filename, subject) {
  const url = `${API_BASE_URL}/files/delete`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, subject })
  })
  return handleResponse(res)};

export async function deleteSubject(subject) {
    const url = `${API_BASE_URL}/files/deletesubject`;
    const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject })
    });
    return handleResponse(res);
}


// ==========================================
// CHAT API
// ==========================================
/**
 * Sends a raw question to the backend and retrieves the AI's response.
 * @param {string} raw_question - The student's question.
 * @param {string|null} session_id - The active chat session ID. Null creates a new chat.
 */
export async function sendChatMessage(raw_question, session_id = null) {
  const url = `${API_BASE_URL}/chat`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    // Send session_id instead of chat_history!
    body: JSON.stringify({ raw_question, session_id }) 
  });
  return handleResponse(res);
}

// Fetch the list of chats for the sidebar
export async function getSidebarChats() {
  const url = `${API_BASE_URL}/chats`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(res);
}

// Fetch the full history when a chat is clicked
export async function getChatHistory(sessionId) {
  const url = `${API_BASE_URL}/chats/${sessionId}`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });
  return handleResponse(res);
}

// Delete a chat session by ID
export async function deleteChatSession(sessionId) {
  const url = `${API_BASE_URL}/chats/${sessionId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(res);
}

/**
 * Triggers the backend LangGraph agent to generate a quiz from chat history.
 * @param {string} sessionId - The ID of the chat session
 */
export async function generateChatQuiz(sessionId) {
  const url = `${API_BASE_URL}/chats/${sessionId}/quiz`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include' 
  });
  return handleResponse(res);
}

/**
 * Sends the user's selected answers to the backend for secure grading.
 * @param {string} quizId - The unique ID of the generated quiz
 * @param {object} answersData - A dictionary of answers, e.g., {"0": "A", "1": "C"}
 */
export async function submitQuizAnswers(quizId, answersData) {
  const url = `${API_BASE_URL}/quizzes/${quizId}/grade`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    credentials: 'include',
    body: JSON.stringify({ answers: answersData })
  });
  return handleResponse(res);
}


// Fetch all quizzes for the list view
export async function getMyQuizzes() {
  const url = `${API_BASE_URL}/quizzes`;
  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  return handleResponse(res);
}

// Fetch a single sanitized quiz to take it
export async function getQuizById(quizId) {
  const url = `${API_BASE_URL}/quizzes/${quizId}`;
  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  return handleResponse(res);
}