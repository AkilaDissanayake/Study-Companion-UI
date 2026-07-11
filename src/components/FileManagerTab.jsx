/**
 * @file FileManagerTab.jsx
 * @description Unified tab for uploading files, creating subjects, and viewing documents.
 */
import React from 'react';

export default function FileManagerTab({
  // Upload Props
  isAddingSubject, selectedSubject, handleSubjectChange, subjects,
  newSubject, setNewSubject, setSelectedFiles, setUploadStatus,
  handleFileUpload, uploadStatus,
  // File List Props
  searchQuery, setSearchQuery, isLoadingFiles, uploadedFiles,
  expandedFolders, setExpandedFolders, handleDownload, initiateDelete, fetchUserFiles
}) {

  // Group files: Ensure 'Root' always exists, and all known subjects are represented
  const getGroupedFiles = () => {
    const groups = { 'Root': [] };
    if (subjects) {
        subjects.forEach(sub => { groups[sub] = []; });
    }

    uploadedFiles.forEach(file => {
      const sub = file.subject || 'Root';
      if (!groups[sub]) groups[sub] = [];
      
      // Filter logically if a search query is active
      if (file.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
        groups[sub].push(file);
      }
    });
    return groups;
  };

  const groupedFiles = getGroupedFiles();

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2>File Manager</h2>
      <p style={{ color: '#666' }}>Upload, organize, and manage your documents.</p>
      
      {/* --- UPLOAD SECTION --- */}
      <div style={{ backgroundColor: 'var(--container-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Upload New Document</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Target Folder:</label>
                <select 
                  value={isAddingSubject ? 'ADD_NEW' : selectedSubject}
                  onChange={handleSubjectChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                  <option value="">Root (No Subject)</option>
                  {subjects.map((sub, index) => (
                    <option key={index} value={sub}>{sub}</option>
                  ))}
                  <option value="ADD_NEW">+ Add new subject...</option>
                </select>

                {isAddingSubject && (
                  <input 
                    type="text" 
                    placeholder="Type new subject name..." 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginTop: '10px', border: '1px solid var(--primary)', borderRadius: '4px' }}
                  />
                )}
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Files:</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => { setSelectedFiles(e.target.files); setUploadStatus(''); }} 
                  style={{ width: '100%', padding: '5px' }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '28px' }}>
                <button onClick={handleFileUpload} style={{ padding: '8px 20px', cursor: 'pointer' }}>Upload</button>
            </div>
        </div>
        
        {uploadStatus && (
            <p style={{ marginTop: '15px', fontWeight: 'bold', color: uploadStatus.includes('Success') ? '#28a745' : '#dc3545' }}>
                {uploadStatus}
            </p>
        )}
      </div>

      {/* --- FILES VIEWER SECTION --- */}
      <div style={{ backgroundColor: 'var(--container-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>My Files</h3>
            <button onClick={fetchUserFiles} style={{ backgroundColor: '#6c757d', padding: '6px 12px', fontSize: '0.9em', cursor: 'pointer' }}>
                Refresh List
            </button>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', padding: '0 12px' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#888', marginRight: '8px', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search for any file by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--text-color)', fontSize: '1em' }}
          />
        </div>

        {isLoadingFiles ? (
          <p>Loading your files...</p>
        ) : (
          <div>
            {Object.entries(groupedFiles).map(([subject, files]) => {
              // Hide empty folders if the user is actively searching
              if (searchQuery && files.length === 0) return null;

              return (
                <div key={subject} style={{ marginBottom: '10px' }}>
                  <div 
                      onClick={() => setExpandedFolders(prev => ({...prev, [subject]: !prev[subject]}))}
                      style={{ 
                          backgroundColor: 'var(--border-color)', 
                          padding: '12px', 
                          borderRadius: '4px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          fontWeight: 'bold' 
                      }}
                  >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#007bff', marginRight: '8px', flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span>{subject === 'Root' ? 'Root (No Subject)' : subject}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {subject !== 'Root' && (
                              <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    initiateDelete(null, subject); 
                                }} 
                                style={{ 
                                    padding: '4px 12px', 
                                    fontSize: '0.8em', 
                                    backgroundColor: '#dc3545', 
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer' 
                                }}
                              >
                                Delete Subject
                              </button>
                          )}
                          <span>{files.length} file{files.length !== 1 && 's'} {expandedFolders[subject] ? '▼' : '▶'}</span>
                      </div>
                  </div>

                  {expandedFolders[subject] && (
                    <ul style={{ listStyleType: 'none', padding: '10px', margin: 0, border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
                      {files.length === 0 ? (
                          <li style={{ padding: '8px 0', color: '#888', fontStyle: 'italic' }}>No files in this folder.</li>
                      ) : (
                          files.map((file, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: index < files.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', marginRight: '15px' }}>
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6c757d', marginRight: '8px', flexShrink: 0 }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filename}</span>
                              </div>
                              <div style={{display:'flex',gap:'8px'}}>
                                  <button onClick={() => handleDownload(file.filename, file.subject)} style={{ padding: '4px 12px', fontSize: '0.8em', width: 'auto', flex: 'none', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                                      Download
                                  </button>
                                  <button onClick={() => initiateDelete(file.filename, file.subject)} style={{ padding: '4px 12px', fontSize: '0.8em', backgroundColor: '#dc3545', width:'auto',flex:'none',whiteSpace: 'nowrap',cursor: 'pointer'  }} >
                                      Delete
                                  </button>
                              </div>
                            </li>
                          ))
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}