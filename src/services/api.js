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
 */
export async function loginWithGoogle(googleToken) {
  const res = await fetch(`${API_BASE_URL}/login/google?token=${googleToken}`, {
    method: 'POST',
    credentials: 'include'
  });
  return handleResponse(res);
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