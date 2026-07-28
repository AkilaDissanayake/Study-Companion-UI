import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import * as api from './services/api';
import { useAuth } from './context/AuthContext'; // Import the Context!

function decodeJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } 
  catch (e) { return { name: "User" }; }
}

function App() {
  // 1. Grab auth tools from Context
  const { userId, userName, isLoading, login } = useAuth();
  
  
  // Application State
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('files'); 
  const [showPopup, setShowPopup] = useState(false);
  const [config, setConfig] = useState({});
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeQuizId, setActiveQuizId] = useState(null);
  // UI States
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('english');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  

  // 2. Watch for userId from Context. If it exists, user is logged in!
  useEffect(() => {
    if (userId) {
      fetchInitialData();
      setView('dashboard');
    } else {
      setView('login');
    }
  }, [userId]);

  const fetchInitialData = async () => {
    try {
      const configData = await api.getUserConfig();
      setConfig(configData);
      if (configData.theme) {
        setTheme(configData.theme);
        applyTheme(configData.theme);
      }
      if (configData.language) setLanguage(configData.language);
      if (configData.subjects) setSubjects(configData.subjects);
    } catch (err) {
      console.error("Failed to fetch initial config:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      if (data.subjects) setSubjects(data.subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
      if (userId && activeTab === 'files') {
        fetchSubjects();
        fetchUserFiles();
      }
    }, [userId, activeTab]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    const decodedName = decodeJwt(googleToken).name || "User";

    try {
      const response = await api.loginWithGoogle(googleToken);
      
      // CHANGE 1: We must extract the payload from response.data!
      const payload = response.data; 
      
      // CHANGE 2: Use the payload variable below instead of data
      login(payload.user_id, decodedName);
      
      setConfig(payload.config);
      if (payload.config) {
          setTheme(payload.config.theme || 'light');
          setLanguage(payload.config.language || 'english');
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000); 

      if (!payload.config.language) {
        setView('setup');
      } else {
        applyTheme(payload.config.theme || 'light');
        setView('dashboard');
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to log in.");
    }
  };

  const handleSavePreferences = async (isSkip = false) => {
    const finalTheme = isSkip ? 'light' : theme;
    const finalLanguage = isSkip ? 'english' : language;
    const payload = {
      filename: `${userId}.json`,
      data: { theme: finalTheme, language: finalLanguage, subjects: subjects }
    };

    try {
      const res = await api.saveUserConfig(payload, isSkip);
      if (res.ok) {
        setConfig(payload.data);
        applyTheme(finalTheme);
        setView('dashboard');
      } else {
        alert("Failed to save configuration.");
      }
    } catch (error) {
      console.error("Config Error:", error);
    }
  };

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
      setUploadStatus("Please select a file.");
      return;
    }
    setUploadStatus("Uploading...");
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }
    
    const finalFolder = isAddingSubject ? newSubject.trim() : selectedSubject;
    if (finalFolder) formData.append("folder", finalFolder); 

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
            api.saveUserConfig({ filename: `${userId}.json`, data: { subjects: updatedSubjects } });
        }
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (error) {
      setUploadStatus("An error occurred.");
    }
  };

  const fetchUserFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const data = await api.getUserFiles();
      setUploadedFiles(data.files || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
    setIsLoadingFiles(false);
  };
  
  useEffect(() => {
    if (userId && activeTab === 'files') fetchUserFiles();
  }, [userId, activeTab]);

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
      console.error("Download Error:", error);
      alert("Error downloading the file.");
    }
  };

  const handleGetFileUrl = async (filename, subject) => {
    try {
      const blob = await api.downloadFileBlob(filename, subject);
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error("View Error:", error);
      alert("Error loading the file for preview.");
      return null;
    }
  };
  const initiateDelete = (filename, subject) => {
    if (filename){  
      setFileToDelete({ filename, subject });
      setIsConfirmOpen(true);}
    else {
      setSubjectToDelete(subject);
      setIsConfirmOpen(true);
    }
};
  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    if (fileToDelete) {
    await handleRemove(fileToDelete.filename, fileToDelete.subject);
    setFileToDelete(null);
  }
    else if (subjectToDelete) {
      await handleRemoveSubject(subjectToDelete);
      setSubjectToDelete(null);
    }
};
  const handleRemove = async (filename, subject) => {

    try {
      await api.deleteFile(filename, subject);
      // Refresh the list to remove the file from UI
      await fetchUserFiles(); 
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Error deleting the file. Please try again.");
    }
  };

  const handleRemoveSubject = async (subject) => {
    try {
      await api.deleteSubject(subject);
      // Refresh the subjects list
      await fetchUserFiles(); // Refresh the files list to remove files under the deleted subject do first for user experience
      await fetchSubjects();
      
      
    } catch (error) {
      console.error("Delete Subject Error:", error);
      alert("Error deleting the subject. Please try again.");
    }
  };
  const applyTheme = (t) => document.documentElement.setAttribute('data-theme', t);

  // 4. Prevent the app from flashing the login screen while checking session
  if (isLoading) return <div className="center-wrapper">Loading...</div>;

  if (view === 'login') {
    return <Login onLoginSuccess={handleGoogleSuccess} />;
  }

  if (view === 'setup') {
    return (
      <Setup 
        theme={theme} setTheme={setTheme} 
        language={language} setLanguage={setLanguage} 
        onSave={handleSavePreferences} showPopup={showPopup} 
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <Dashboard 
        userName={userName}
        showPopup={showPopup} activeTab={activeTab} setActiveTab={setActiveTab}
        showProfileMenu={showProfileMenu} setShowProfileMenu={setShowProfileMenu}
        theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage}
        handleSavePreferences={handleSavePreferences} isAddingSubject={isAddingSubject}
        selectedSubject={selectedSubject} handleSubjectChange={handleSubjectChange}
        subjects={subjects} newSubject={newSubject} setNewSubject={setNewSubject}
        selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}
        uploadStatus={uploadStatus} setUploadStatus={setUploadStatus}
        handleFileUpload={handleFileUpload} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} isLoadingFiles={isLoadingFiles}
        uploadedFiles={uploadedFiles} expandedFolders={expandedFolders}
        setExpandedFolders={setExpandedFolders} handleDownload={handleDownload}
        fetchUserFiles={fetchUserFiles}
        initiateDelete={initiateDelete} isConfirmOpen={isConfirmOpen}     
        setIsConfirmOpen={setIsConfirmOpen}  fileToDelete={fileToDelete}           
        confirmDelete={confirmDelete}   
        subjectToDelete={subjectToDelete}
        isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}
        handleGetFileUrl={handleGetFileUrl}
        activeSessionId={activeSessionId} 
        setActiveSessionId={setActiveSessionId}
        activeQuizId={activeQuizId}
        setActiveQuizId={setActiveQuizId}
      />
    );
  }
}


export default App;