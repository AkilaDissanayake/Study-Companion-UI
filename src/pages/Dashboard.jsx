/**
 * @file Dashboard.jsx
 * @description The main authenticated layout. Owns all dashboard-level UI state
 * (active tab, sidebar collapse, chat/quiz session IDs, profile menu) and composes
 * child tabs using custom hooks — no prop relay from App.jsx.
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FileManagerTab from '../components/FileManagerTab';
import SettingsTab from '../components/SettingsTab';
import ConfirmDialog from '../components/ConfirmDialog';
import ChatTab from '../components/ChatTab';
import QuizzesTab from '../components/QuizzesTab';
import OverviewTab from '../components/OverviewTab';
import { useFileManager } from '../hooks/useFileManager';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const TAB_TITLES = {
  overview: 'Overview',
  quizzes: 'My Quizzes',
  chat: 'AI Tutor',
  files: 'My Files',
  settings: 'Settings',
};

export default function Dashboard() {
  const { userId } = useAuth();
  const location = useLocation();

  // ── Layout / navigation state ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Briefly shows the "Login Successful" overlay when arriving here right
  // after login (see Login.jsx's navigate(..., { state: { showPopup: true } })).
  const [showPopup, setShowPopup] = useState(!!location.state?.showPopup);
  useEffect(() => {
    if (!showPopup) return;
    const timer = setTimeout(() => setShowPopup(false), 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chat / quiz session state ──────────────────────────────────────────
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeQuizId, setActiveQuizId] = useState(null);

  // ── Domain hooks ───────────────────────────────────────────────────────
  const fileManager = useFileManager();
  const settings = useSettings();

  // Load initial config (theme + language + subjects) once the user is known
  useEffect(() => {
    if (!userId) return;

    const loadConfig = async () => {
      try {
        // getUserConfig() resolves the full {status, message, data} envelope —
        // the actual config fields live under .data, not on the response itself.
        const res = await api.getUserConfig();
        const configData = res.data || {};
        if (configData.theme) {
          settings.setTheme(configData.theme);
          settings.applyTheme(configData.theme);
        }
        if (configData.language) settings.setLanguage(configData.language);
      } catch (err) {
        console.error('Failed to fetch initial config:', err);
      }
    };

    loadConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Refresh file list and subjects when navigating to the files tab
  useEffect(() => {
    if (userId && activeTab === 'files') {
      fileManager.fetchSubjects();
      fileManager.fetchUserFiles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab]);

  return (
    <div className="dashboard-layout">
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card">✓ Login Successful!</div>
        </div>
      )}

      {/* Global delete confirmation dialog (for file manager) */}
      <ConfirmDialog
        isOpen={fileManager.isConfirmOpen}
        onClose={() => fileManager.setIsConfirmOpen(false)}
        onConfirm={fileManager.confirmDelete}
        message={`Are you sure you want to delete "${
          fileManager.fileToDelete?.filename ?? fileManager.subjectToDelete
        }"? This action cannot be undone.`}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        setActiveQuizId={setActiveQuizId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="main-content">
        <Topbar
          title={TAB_TITLES[activeTab]}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <div className={`content-area ${activeTab === 'chat' ? 'chat-active' : ''}`}>

          {activeTab === 'overview' && (
            <OverviewTab
              onResumeChat={(sessionId) => {
                setActiveSessionId(sessionId);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizzesTab
              activeQuizId={activeQuizId}
              setActiveQuizId={setActiveQuizId}
            />
          )}

          {activeTab === 'chat' && (
            <ChatTab
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
          )}

          {activeTab === 'files' && (
            <FileManagerTab
              // Upload
              isAddingSubject={fileManager.isAddingSubject}
              selectedSubject={fileManager.selectedSubject}
              handleSubjectChange={fileManager.handleSubjectChange}
              subjects={fileManager.subjects}
              newSubject={fileManager.newSubject}
              setNewSubject={fileManager.setNewSubject}
              selectedFiles={fileManager.selectedFiles}
              setSelectedFiles={fileManager.setSelectedFiles}
              resetUploadState={fileManager.resetUploadState}
              handleFileUpload={fileManager.handleFileUpload}
              uploadState={fileManager.uploadState}
              uploadProgress={fileManager.uploadProgress}
              uploadError={fileManager.uploadError}
              uploadedFolder={fileManager.uploadedFolder}
              // File listing
              searchQuery={fileManager.searchQuery}
              setSearchQuery={fileManager.setSearchQuery}
              isLoadingFiles={fileManager.isLoadingFiles}
              uploadedFiles={fileManager.uploadedFiles}
              expandedFolders={fileManager.expandedFolders}
              setExpandedFolders={fileManager.setExpandedFolders}
              // Actions
              handleDownload={fileManager.handleDownload}
              fetchUserFiles={fileManager.fetchUserFiles}
              initiateDelete={fileManager.initiateDelete}
              handleGetFileUrl={fileManager.handleGetFileUrl}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              theme={settings.theme}
              setTheme={settings.setTheme}
              language={settings.language}
              setLanguage={settings.setLanguage}
              handleSavePreferences={settings.handleSavePreferences}
            />
          )}
        </div>
      </div>
    </div>
  );
}