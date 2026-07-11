/**
 * @file Dashboard.jsx
 * @description The main authenticated layout wrapper. 
 * It acts as the container for the Sidebar, Topbar, and the active content Tab.
 */
import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FileManagerTab from '../components/FileManagerTab'; // Import the new component
import SettingsTab from '../components/SettingsTab';
import ConfirmDialog from '../components/ConfirmDialog';

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

      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} isCollapsed={props.isCollapsed} setIsCollapsed={props.setIsCollapsed} />

      <div className="main-content">
        <Topbar 
          showProfileMenu={props.showProfileMenu} 
          setShowProfileMenu={props.setShowProfileMenu} 
        />

        <div className="content-area">
          {/* Render the combined File Manager Tab */}
          {props.activeTab === 'files' && (
            <FileManagerTab 
              // Upload Props
              isAddingSubject={props.isAddingSubject} selectedSubject={props.selectedSubject} 
              handleSubjectChange={props.handleSubjectChange} subjects={props.subjects}
              newSubject={props.newSubject} setNewSubject={props.setNewSubject} 
              setSelectedFiles={props.setSelectedFiles} setUploadStatus={props.setUploadStatus}
              handleFileUpload={props.handleFileUpload} uploadStatus={props.uploadStatus} 
              // File Viewer Props
              searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} 
              isLoadingFiles={props.isLoadingFiles} uploadedFiles={props.uploadedFiles}
              expandedFolders={props.expandedFolders} setExpandedFolders={props.setExpandedFolders} 
              handleDownload={props.handleDownload} fetchUserFiles={props.fetchUserFiles}
              initiateDelete={props.initiateDelete} isConfirmOpen={props.isConfirmOpen}     
              setIsConfirmOpen={props.setIsConfirmOpen} fileToDelete={props.fileToDelete}           
              confirmDelete={props.confirmDelete} subjectToDelete={props.subjectToDelete}
            />
          )}
          
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