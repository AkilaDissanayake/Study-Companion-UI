// src/services/api.js
/**
 * @file api.js
 * @description Centralized hub for all backend API communication.
 * Handles fetching, posting, and error formatting for the application.
 */

import { ApiError, parseErrorBody } from './ApiError';

// Grab the backend URL from the environment, defaulting to localhost if missing
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Handlers registered once (from App.jsx, after both AuthProvider and
// NotificationProvider exist) so this plain module can react to auth failures
// without importing React context directly.
let globalHandlers = { onUnauthorized: null };
export function registerApiHandlers(handlers) {
  globalHandlers = { ...globalHandlers, ...handlers };
}

function notifyIfUnauthorized(status) {
  if ((status === 401 || status === 403) && globalHandlers.onUnauthorized) {
    globalHandlers.onUnauthorized(status);
  }
}

/**
 * Standardizes API responses. Throws an ApiError if the response is not OK.
 * @param {Response} res - The raw fetch response object.
 * @returns {Promise<Object>} The parsed JSON data.
 * @throws {ApiError} If the response returns an error status.
 */
async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const { message, fieldErrors } = parseErrorBody(body, res.status);
    throw new ApiError({ status: res.status, message, fieldErrors, rawDetail: body?.detail });
  }
  return res.json();
}

/**
 * Shared fetch wrapper: attaches credentials, catches network failures,
 * surfaces 401/403 to the registered global handler, and normalizes errors
 * via handleResponse/ApiError.
 * @param {boolean} [silent401] - Skip the global "session expired" toast for
 *   a 401/403 on this call. Used for the initial session probe on app load,
 *   where an unauthenticated visitor (e.g. on the public landing page) has
 *   never had a session to "expire" in the first place.
 */
async function request(url, options = {}, silent401 = false) {
  let res;
  try {
    res = await fetch(url, { credentials: 'include', ...options });
  } catch {
    throw new ApiError({ status: 0, message: 'Network error. Please check your connection.', isNetworkError: true });
  }
  if (!silent401) notifyIfUnauthorized(res.status);
  return handleResponse(res);
}

const jsonHeaders = { 'Content-Type': 'application/json' };

// ==========================================
// 1. AUTHENTICATION APIs
// ==========================================
/**
 * Checks if the user has an active, valid session cookie. This is a silent
 * probe (no "session expired" toast on a 401) — an unauthenticated visitor,
 * e.g. on the public landing page, was never logged in, so there's no
 * session to have "expired".
 * @returns {Promise<{user_id: string}>} The current user's ID.
 */
export async function checkAuthSession() {
  return request(`${API_BASE_URL}/auth/check`, { method: 'GET' }, true);
}

/**
 * Sends the Google OAuth token to the backend for verification.
 * @param {string} googleToken - The JWT provided by Google Login.
 * @returns {Promise<{user_id: string, config: Object}>} User ID and their saved preferences.
 *   Note: The backend returns { status, data }, we unwrap to data here for consistency.
 */
export async function loginWithGoogle(googleToken) {
  const json = await request(`${API_BASE_URL}/login/google?token=${googleToken}`, { method: 'POST' });
  // The /login/google endpoint returns { status: 'success', data: { user_id, config } }
  return json.data ?? json;
}

/**
 * Creates a new email/password account. Does not log the user in — the
 * backend requires email verification before the first password login.
 * @param {{name: string, email: string, password: string}} payload
 */
export async function signup(payload) {
  return request(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
}

/**
 * Logs in with email + password and sets the session cookie (same cookie
 * the Google flow sets).
 * @param {{email: string, password: string}} payload
 * @returns {Promise<{user_id: string, email: string, name: string, config: Object}>}
 */
export async function loginWithPassword(payload) {
  const json = await request(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  return json.data ?? json;
}

/**
 * Confirms an email address using the token from the verification email.
 * @param {string} token
 */
export async function verifyEmail(token) {
  return request(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ token }),
  });
}

/**
 * Requests a password reset email. Always resolves the same way regardless
 * of whether the email is registered (the backend never reveals that).
 * @param {string} email
 */
export async function requestPasswordReset(email) {
  return request(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ email }),
  });
}

/**
 * Sets a new password using the token from the reset email.
 * @param {{token: string, newPassword: string}} payload
 */
export async function resetPassword({ token, newPassword }) {
  return request(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

/**
 * Instructs the backend to destroy the user's session cookie.
 * @returns {Promise<boolean>} True if logout was successful.
 */
export async function logoutUser() {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/login/logout`, { method: 'POST', credentials: 'include' });
  } catch {
    throw new ApiError({ status: 0, message: 'Network error. Please check your connection.', isNetworkError: true });
  }
  notifyIfUnauthorized(res.status);
  // Logout might not return JSON, so we just check if it succeeded
  if (!res.ok) throw new ApiError({ status: res.status, message: 'Logout failed' });
  return true;
}

// ==========================================
// PRICING API (public, no auth)
// ==========================================

/**
 * Fetches the hand-edited pricing tiers for the landing page.
 * @returns {Promise<{tiers: Array<{id: string, name: string, price: number, currency: string, billing_period: string, cta_label: string, highlighted: boolean, features: string[]}>}>}
 */
export async function getPricing() {
  const json = await request(`${API_BASE_URL}/pricing`, { method: 'GET' });
  return json.data ?? json;
}

// ==========================================
// 2. CONFIGURATION APIs
// ==========================================

export async function getUserConfig() {
  return request(`${API_BASE_URL}/config/get`, { method: 'GET' });
}

export async function getSubjects() {
  return request(`${API_BASE_URL}/config/subjects`, { method: 'GET' });
}

export async function saveUserConfig(payload, isNew = false) {
  const endpoint = isNew ? '/config/create' : '/config/edit';
  const method = isNew ? 'POST' : 'PATCH';

  return request(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
}

// ==========================================
// 3. FILE MANAGEMENT APIs
// ==========================================

/**
 * Uploads an array of files to a specific subject folder, reporting real
 * upload progress. Uses XMLHttpRequest because fetch() cannot report
 * upload-progress events.
 * @param {FormData} formData - The files and target folder payload.
 * @param {(percent: number) => void} [onProgress] - Called with 0-100 as the upload progresses.
 * @returns {Promise<Object>} The parsed JSON response, same shape as every other api.js function.
 */
export function uploadFilesWithProgress(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/files/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let body = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON body, fall through with body = {}
      }

      notifyIfUnauthorized(xhr.status);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
      } else {
        const { message, fieldErrors } = parseErrorBody(body, xhr.status);
        reject(new ApiError({ status: xhr.status, message, fieldErrors, rawDetail: body?.detail }));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError({ status: 0, message: 'Network error during upload.', isNetworkError: true }));
    };

    xhr.send(formData);
  });
}

export async function getUserFiles() {
  return request(`${API_BASE_URL}/files/names`, { method: 'GET' });
}

/**
 * Downloads a specific file as a raw binary Blob.
 * @param {string} filename - The name of the file to download.
 * @param {string} subject - The folder/subject where the file is located.
 * @returns {Promise<Blob>} The raw file data.
 */
export async function downloadFileBlob(filename, subject) {
  const url = `${API_BASE_URL}/files/download?filename=${encodeURIComponent(filename)}&subject=${encodeURIComponent(subject)}`;
  let res;
  try {
    res = await fetch(url, { method: 'GET', credentials: 'include' });
  } catch {
    throw new ApiError({ status: 0, message: 'Network error. Please check your connection.', isNetworkError: true });
  }

  notifyIfUnauthorized(res.status);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const { message } = parseErrorBody(body, res.status);
    throw new ApiError({ status: res.status, message: message || 'Failed to download file.', rawDetail: body?.detail });
  }

  // We return the raw Blob here, not JSON!
  // The component will use this Blob to trigger the browser download.
  return res.blob();
}

export async function deleteFile(filename, subject) {
  return request(`${API_BASE_URL}/files/delete`, {
    method: 'DELETE',
    headers: jsonHeaders,
    body: JSON.stringify({ filename, subject }),
  });
}

export async function deleteSubject(subject) {
  return request(`${API_BASE_URL}/files/deletesubject`, {
    method: 'DELETE',
    headers: jsonHeaders,
    body: JSON.stringify({ subject }),
  });
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
  return request(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: jsonHeaders,
    // Send session_id instead of chat_history!
    body: JSON.stringify({ raw_question, session_id }),
  });
}

// Fetch the list of chats for the sidebar
export async function getSidebarChats() {
  return request(`${API_BASE_URL}/chats`, { method: 'GET' });
}

// Fetch the full history when a chat is clicked
export async function getChatHistory(sessionId) {
  return request(`${API_BASE_URL}/chats/${sessionId}`, { method: 'GET' });
}

// Delete a chat session by ID
export async function deleteChatSession(sessionId) {
  return request(`${API_BASE_URL}/chats/${sessionId}`, { method: 'DELETE' });
}

/**
 * Triggers the backend LangGraph agent to generate a quiz from chat history.
 * @param {string} sessionId - The ID of the chat session
 */
export async function generateChatQuiz(sessionId) {
  return request(`${API_BASE_URL}/chats/${sessionId}/quiz`, { method: 'POST' });
}

/**
 * Sends the user's selected answers to the backend for secure grading.
 * @param {string} quizId - The unique ID of the generated quiz
 * @param {object} answersData - A dictionary of answers, e.g., {"0": "A", "1": "C"}
 */
export async function submitQuizAnswers(quizId, answersData) {
  return request(`${API_BASE_URL}/quizzes/${quizId}/grade`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ answers: answersData }),
  });
}

// Fetch all quizzes for the list view
export async function getMyQuizzes() {
  return request(`${API_BASE_URL}/quizzes`, { method: 'GET' });
}

// Fetch a single sanitized quiz to take it
export async function getQuizById(quizId) {
  return request(`${API_BASE_URL}/quizzes/${quizId}`, { method: 'GET' });
}

// Delete a quiz by ID
export async function deleteQuiz(quizId) {
  return request(`${API_BASE_URL}/quizzes/${quizId}`, { method: 'DELETE' });
}

// ==========================================
// STATS API (motivational/gamification layer)
// ==========================================

/**
 * Fetches derived streak/quiz/chat/file stats plus any newly-unlocked
 * streak milestones or badges to celebrate.
 * @returns {Promise<{current_streak: number, longest_streak: number, studied_today: boolean, quiz_count: number, chat_count: number, file_count: number, badges: Array, newly_unlocked: {streaks: number[], badges: string[]}}>}
 */
export async function getStatsSummary() {
  const json = await request(`${API_BASE_URL}/stats/summary`, { method: 'GET' });
  return json.data ?? json;
}

/**
 * Marks a streak/badge milestone as seen so it doesn't celebrate again.
 * Call only when the celebration UI actually renders and is dismissed.
 * @param {'streak'|'badge'} type
 * @param {string|number} id
 */
export async function ackMilestone(type, id) {
  return request(`${API_BASE_URL}/stats/ack`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ type, id: String(id) }),
  });
}
