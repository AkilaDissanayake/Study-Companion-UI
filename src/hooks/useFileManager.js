/**
 * @file useFileManager.js
 * @description Custom hook that owns all file and subject management state and logic.
 * Extracted from App.jsx to eliminate prop-drilling and the god-component anti-pattern.
 *
 * Exposes:
 *  - State: subjects, uploadedFiles, selectedFiles, uploadState, uploadProgress,
 *            uploadError, uploadedFolder, searchQuery, expandedFolders, isLoadingFiles,
 *            isConfirmOpen, fileToDelete, subjectToDelete, isAddingSubject,
 *            selectedSubject, newSubject
 *  - Actions: fetchSubjects, fetchUserFiles, handleSubjectChange, setNewSubject,
 *              setSelectedFiles, resetUploadState, setSearchQuery, setExpandedFolders,
 *              handleFileUpload, handleDownload, handleGetFileUrl,
 *              initiateDelete, confirmDelete, setIsConfirmOpen
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import * as api from '../services/api';

const UPLOAD_SUCCESS_RESET_MS = 2500;

export function useFileManager() {
  const { userId } = useAuth();
  const notify = useNotify();

  // --- File listing state ---
  const [subjects, setSubjects] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // --- Upload state ---
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFolder, setUploadedFolder] = useState('');

  // --- Delete confirmation state ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // ==========================================
  // FETCH
  // ==========================================

  const fetchSubjects = useCallback(async () => {
    try {
      // getSubjects() resolves the full {status, message, data} envelope —
      // the subjects array lives under .data.subjects, not .subjects.
      const res = await api.getSubjects();
      if (res.data?.subjects) setSubjects(res.data.subjects);
    } catch (error) {
      notify.error(error.message || 'Could not load your subjects.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      // Same envelope shape as getSubjects() — files live under .data.files.
      const res = await api.getUserFiles();
      setUploadedFiles(res.data?.files || []);
    } catch (error) {
      notify.error(error.message || 'Could not load your files.', { retry: fetchUserFiles });
    } finally {
      setIsLoadingFiles(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // UPLOAD
  // ==========================================

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    if (value === 'ADD_NEW') {
      setIsAddingSubject(true);
      setSelectedSubject('');
    } else {
      setIsAddingSubject(false);
      setSelectedSubject(value);
    }
  };

  const resetUploadState = () => {
    setUploadState('idle');
    setUploadError(null);
    setUploadProgress(0);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadState('error');
      setUploadError('Please select a file.');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    const finalFolder = isAddingSubject ? newSubject.trim() : selectedSubject;
    if (finalFolder) formData.append('folder', finalFolder);

    try {
      await api.uploadFilesWithProgress(formData, setUploadProgress);

      setUploadState('success');
      setUploadedFolder(finalFolder || 'General');
      setSelectedFiles(null);

      if (isAddingSubject && newSubject.trim() !== '') {
        const updatedSubjects = [...subjects, newSubject.trim()];
        setSubjects(updatedSubjects);
        setSelectedSubject(newSubject.trim());
        setIsAddingSubject(false);
        setNewSubject('');
        api
          .saveUserConfig({ filename: `${userId}.json`, data: { subjects: updatedSubjects } })
          .catch(() => notify.error('Files uploaded, but the new subject could not be saved to your profile.'));
      }

      setTimeout(() => setUploadState('idle'), UPLOAD_SUCCESS_RESET_MS);
    } catch (error) {
      setUploadState('error');
      setUploadError(error.message || 'Upload failed.');
    }
  };

  // ==========================================
  // DOWNLOAD / PREVIEW
  // ==========================================

  const handleDownload = async (filename, subject) => {
    try {
      const blob = await api.downloadFileBlob(filename, subject);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      notify.error(error.message || 'Error downloading the file.', {
        retry: () => handleDownload(filename, subject),
      });
    }
  };

  const handleGetFileUrl = async (filename, subject) => {
    try {
      const blob = await api.downloadFileBlob(filename, subject);
      return window.URL.createObjectURL(blob);
    } catch (error) {
      notify.error(error.message || 'Error loading the file for preview.');
      return null;
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const initiateDelete = (filename, subject) => {
    if (filename) {
      setFileToDelete({ filename, subject });
    } else {
      setSubjectToDelete(subject);
    }
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    if (fileToDelete) {
      await handleRemove(fileToDelete.filename, fileToDelete.subject);
      setFileToDelete(null);
    } else if (subjectToDelete) {
      await handleRemoveSubject(subjectToDelete);
      setSubjectToDelete(null);
    }
  };

  const handleRemove = async (filename, subject) => {
    try {
      await api.deleteFile(filename, subject);
      await fetchUserFiles();
    } catch (error) {
      notify.error(error.message || 'Error deleting the file. Please try again.', {
        retry: () => handleRemove(filename, subject),
      });
    }
  };

  const handleRemoveSubject = async (subject) => {
    try {
      await api.deleteSubject(subject);
      // Refresh files first for better perceived UX
      await fetchUserFiles();
      await fetchSubjects();
    } catch (error) {
      notify.error(error.message || 'Error deleting the subject. Please try again.', {
        retry: () => handleRemoveSubject(subject),
      });
    }
  };

  return {
    // State
    subjects,
    uploadedFiles,
    isLoadingFiles,
    expandedFolders,
    setExpandedFolders,
    searchQuery,
    setSearchQuery,
    selectedFiles,
    setSelectedFiles,
    uploadState,
    uploadProgress,
    uploadError,
    uploadedFolder,
    resetUploadState,
    selectedSubject,
    isAddingSubject,
    newSubject,
    setNewSubject,
    isConfirmOpen,
    setIsConfirmOpen,
    fileToDelete,
    subjectToDelete,
    // Actions
    fetchSubjects,
    fetchUserFiles,
    handleSubjectChange,
    handleFileUpload,
    handleDownload,
    handleGetFileUrl,
    initiateDelete,
    confirmDelete,
  };
}
