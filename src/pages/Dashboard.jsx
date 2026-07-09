/**
 * @file Dashboard.jsx
 * @description The main authenticated layout wrapper. 
 * It acts as the container for the Sidebar, Topbar, and the active content Tab.
 */
import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import UploadTab from '../components/UploadTab';
import MyFilesTab from '../components/MyFilesTab';
import SettingsTab from '../components/SettingsTab';

export default function Dashboard(props) {
  return (
    <div className="dashboard-layout">
      {props.showPopup && <div className="popup-overlay"><div className="popup-card">✓ Login Successful!</div></div>}

      <Sidebar activeTab={props.activeTab} setActiveTab={props.setActiveTab} />

      <div className="main-content">
        {/* Look how clean this is now! No more userName or handleLogout props */}
        <Topbar 
          showProfileMenu={props.showProfileMenu} 
          setShowProfileMenu={props.setShowProfileMenu} 
        />

        <div className="content-area">
          {props.activeTab === 'upload' && (
            <UploadTab 
              isAddingSubject={props.isAddingSubject} selectedSubject={props.selectedSubject} 
              handleSubjectChange={props.handleSubjectChange} subjects={props.subjects}
              newSubject={props.newSubject} setNewSubject={props.setNewSubject} 
              setSelectedFiles={props.setSelectedFiles} setUploadStatus={props.setUploadStatus}
              handleFileUpload={props.handleFileUpload} uploadStatus={props.uploadStatus} 
            />
          )}

          {props.activeTab === 'files' && (
            <MyFilesTab 
              searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} 
              isLoadingFiles={props.isLoadingFiles} uploadedFiles={props.uploadedFiles}
              expandedFolders={props.expandedFolders} setExpandedFolders={props.setExpandedFolders} 
              handleDownload={props.handleDownload} fetchUserFiles={props.fetchUserFiles}
            />
          )}
          {/* No more userName, userId, or handleLogout props here either! */}
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