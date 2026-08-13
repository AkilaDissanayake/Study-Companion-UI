/**
 * @file useFileManager.js
 * @description Custom hook that owns all file and subject management state and logic.
 * Extracted from App.jsx to eliminate prop-drilling and the god-component anti-pattern.
 *
 * Exposes:
 *  - State: subjects, uploadedFiles, selectedFiles, uploadStatus, searchQuery,
 *            expandedFolders, isLoadingFiles, isConfirmOpen, fileToDelete,
 *            subjectToDelete, isAddingSubject, selectedSubject, newSubject
 *  - Actions: fetchSubjects, fetchUserFiles, handleSubjectChange, setNewSubject,
 *              setSelectedFiles, setUploadStatus, setSearchQuery, setExpandedFolders,
 *              handleFileUpload, handleDownload, handleGetFileUrl,
 *              initiateDelete, confirmDelete, setIsConfirmOpen
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export function useFileManager() {
  const { userId } = useAuth();

  // --- File listing state ---
  const [subjects, setSubjects] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // --- Upload state ---
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  // --- Delete confirmation state ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // ==========================================
  // FETCH
  // ==========================================

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await api.getSubjects();
      if (data.subjects) setSubjects(data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, []);

  const fetchUserFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const data = await api.getUserFiles();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch files', error);
    } finally {
      setIsLoadingFiles(false);
    }
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

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadStatus('Please select a file.');
      return;
    }
    setUploadStatus('Uploading...');

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    const finalFolder = isAddingSubject ? newSubject.trim() : selectedSubject;
    if (finalFolder) formData.append('folder', finalFolder);

    try {
      const res = await api.uploadFiles(formData);
      if (res.ok) {
        setUploadStatus(`Success! Files saved to ${finalFolder || 'Root'}.`);
        setSelectedFiles(null);

        if (isAddingSubject && newSubject.trim() !== '') {
          const updatedSubjects = [...subjects, newSubject.trim()];
          setSubjects(updatedSubjects);
          setSelectedSubject(newSubject.trim());
          setIsAddingSubject(false);
          setNewSubject('');
          api.saveUserConfig({
            filename: `${userId}.json`,
            data: { subjects: updatedSubjects },
          });
        }
      } else {
        setUploadStatus('Upload failed.');
      }
    } catch (error) {
      setUploadStatus('An error occurred.');
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
      console.error('Download Error:', error);
      alert('Error downloading the file.');
    }
  };

  const handleGetFileUrl = async (filename, subject) => {
    try {
      const blob = await api.downloadFileBlob(filename, subject);
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('View Error:', error);
      alert('Error loading the file for preview.');
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
      console.error('Delete Error:', error);
      alert('Error deleting the file. Please try again.');
    }
  };

  const handleRemoveSubject = async (subject) => {
    try {
      await api.deleteSubject(subject);
      // Refresh files first for better perceived UX
      await fetchUserFiles();
      await fetchSubjects();
    } catch (error) {
      console.error('Delete Subject Error:', error);
      alert('Error deleting the subject. Please try again.');
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
    uploadStatus,
    setUploadStatus,
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
