/**
 * @file Dashboard.jsx
 * @description The main authenticated layout wrapper. 
 * It acts as the container for the Sidebar, Topbar, and the active content Tab.
 */
import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FileManagerTab from '../components/FileManagerTab'; 
import SettingsTab from '../components/SettingsTab';
import ConfirmDialog from '../components/ConfirmDialog';
import ChatTab from '../components/ChatTab';
import QuizzesTab from '../components/QuizzesTab'; // Ensure this is imported!

export default function Dashboard(props) {
  return (
    <div className="dashboard-layout">
      {props.showPopup && <div className="popup-overlay"><div className="popup-card">✓ Login Successful!</div></div>}
      
      <ConfirmDialog 
        isOpen={props.isConfirmOpen} 
        onClose={() => props.setIsConfirmOpen(false)} 
        onConfirm={props.confirmDelete}
        message={`Are you sure you want to delete ${props.fileToDelete?.filename || props.subjectToDelete}? This action cannot be undone.`}
      />

      <Sidebar 
        activeTab={props.activeTab} 
        setActiveTab={props.setActiveTab} 
        isCollapsed={props.isCollapsed} 
        setIsCollapsed={props.setIsCollapsed}
        activeSessionId={props.activeSessionId}    
        setActiveSessionId={props.setActiveSessionId} 
        setActiveQuizId={props.setActiveQuizId} /* FIX 1: Added props. here */
      />

      <div className="main-content">
        <Topbar 
          showProfileMenu={props.showProfileMenu} 
          setShowProfileMenu={props.setShowProfileMenu} 
        />

        <div className={`content-area ${props.activeTab === 'chat' ? 'chat-active' : ''}`}>

          {/* Render the Quizzes Tab */}
          {props.activeTab === 'quizzes' && (
            <QuizzesTab 
              activeQuizId={props.activeQuizId} /* FIX 2: Added props. here */
              setActiveQuizId={props.setActiveQuizId} /* FIX 3: Added props. here */
            />
          )}

          {/* Render the Chat Tab */}
          {props.activeTab === 'chat' && (
            <ChatTab 
              userName={props.userName} 
              activeSessionId={props.activeSessionId} 
              setActiveSessionId={props.setActiveSessionId}  
            />
          )}
          
          {/* Render the combined File Manager Tab */}
          {props.activeTab === 'files' && (
            <FileManagerTab 
              isAddingSubject={props.isAddingSubject} selectedSubject={props.selectedSubject} 
              handleSubjectChange={props.handleSubjectChange} subjects={props.subjects}
              newSubject={props.newSubject} setNewSubject={props.setNewSubject} 
              setSelectedFiles={props.setSelectedFiles} setUploadStatus={props.setUploadStatus}
              handleFileUpload={props.handleFileUpload} uploadStatus={props.uploadStatus} 
              searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} 
              isLoadingFiles={props.isLoadingFiles} uploadedFiles={props.uploadedFiles}
              expandedFolders={props.expandedFolders} setExpandedFolders={props.setExpandedFolders} 
              handleDownload={props.handleDownload} fetchUserFiles={props.fetchUserFiles}
              initiateDelete={props.initiateDelete} isConfirmOpen={props.isConfirmOpen}     
              setIsConfirmOpen={props.setIsConfirmOpen} fileToDelete={props.fileToDelete}           
              confirmDelete={props.confirmDelete} subjectToDelete={props.subjectToDelete}
              handleGetFileUrl={props.handleGetFileUrl}
            />
          )}
          
          {/* Render the Settings Tab */}
          {props.activeTab === 'settings' && (
            <SettingsTab 
              theme={props.theme} setTheme={props.setTheme} 
              language={props.language} setLanguage={props.setLanguage} 
              handleSavePreferences={props.handleSavePreferences} 
            />
          )}
        </div>
      </div>
    </div>
  );
}