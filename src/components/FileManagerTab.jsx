/**
 * @file FileManagerTab.jsx
 * @description Unified tab for uploading files, creating subjects, and viewing documents.
 */
import React, { useState } from 'react';

export default function FileManagerTab({
  isAddingSubject, selectedSubject, handleSubjectChange, subjects,
  newSubject, setNewSubject, setSelectedFiles, setUploadStatus,
  handleFileUpload, uploadStatus,
  searchQuery, setSearchQuery, isLoadingFiles, uploadedFiles,
  expandedFolders, setExpandedFolders, handleDownload, initiateDelete, fetchUserFiles,
  handleGetFileUrl
}) {

  // --- NEW STATE FOR PREVIEW MODAL ---
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const openPreview = async (filename, subject) => {
    setIsLoadingPreview(true);
    const url = await handleGetFileUrl(filename, subject);
    if (url) {
      setPreviewUrl(url);
      setPreviewName(filename);
    }
    setIsLoadingPreview(false);
  };

  const closePreview = () => {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl); // Prevent memory leaks
    setPreviewUrl(null);
    setPreviewName("");
  };

  const getGroupedFiles = () => {
    const groups = { };
    if (subjects) {
        subjects.forEach(sub => { groups[sub] = []; });
    }
    uploadedFiles.forEach(file => {
      const sub = file.subject || 'Root';
      if (!groups[sub]) groups[sub] = [];
      if (file.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
        groups[sub].push(file);
      }
    });
    return groups;
  };

  const groupedFiles = getGroupedFiles();

  return (
    <div style={{ maxWidth: '800px', position: 'relative' }}>
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
                  <option value="root">General</option>
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
            <button onClick={fetchUserFiles} style={{ backgroundColor: '#6c757d', padding: '6px 12px', fontSize: '0.9em', cursor: 'pointer', color: 'white', border: 'none', borderRadius: '4px' }}>
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
                          <span>{subject === 'root' ? 'General' : subject}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          {subject !== 'Root' && (
                              <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    initiateDelete(null, subject); 
                                }} 
                                style={{ padding: '4px 12px', fontSize: '0.8em', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
                              
                              {/* --- UPDATED: Clickable File Name with Document Icon --- */}
                              <div 
                                onClick={() => openPreview(file.filename, file.subject)}
                                style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', marginRight: '15px', cursor: 'pointer', flex: 1 }}
                                title="Click to view file"
                              >
                                {/* New File SVG Icon */}
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#007bff', marginRight: '8px', flexShrink: 0 }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-color)' }}>
                                  {file.filename}
                                </span>
                              </div>

                              <div style={{display:'flex',gap:'8px'}}>
                                  <button onClick={() => handleDownload(file.filename, file.subject)} style={{ padding: '4px 12px', fontSize: '0.8em', width: 'auto', flex: 'none', whiteSpace: 'nowrap', cursor: 'pointer', color: 'black' }}>
                                      Download
                                  </button>
                                  <button onClick={() => initiateDelete(file.filename, file.subject)} style={{ padding: '4px 12px', fontSize: '0.8em', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', width:'auto',flex:'none',whiteSpace: 'nowrap',cursor: 'pointer'  }} >
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

      {/* --- PREVIEW MODAL --- */}
      {isLoadingPreview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', color: 'black' }}>Loading preview...</div>
        </div>
      )}

      {previewUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--container-bg)', width: '100%', maxWidth: '1000px', height: '90vh', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            
            {/* Modal Header - Fixed Alignment */}
            
            <div style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid var(--border-color)', 
                display: 'grid', 
                gridTemplateColumns: '1fr auto', /* Col 1 takes all leftover space, Col 2 fits the button */
                alignItems: 'center',            /* Vertically centers both */
                gap: '20px',                     /* Guarantees a 20px gap between text and button */
                backgroundColor: 'var(--bg-color)',
                width: '100%',
                boxSizing: 'border-box'
            }}>
            
            <h3 style={{ 
                margin: 0, 
                fontSize: '18px',
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                lineHeight: '1'                /* Prevents invisible vertical padding */
            }}>
                {previewName}
            </h3>
            
            <button 
                onClick={closePreview} 
                aria-label="Close Preview"
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '8px', 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#000000'
                }}
            >
                <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ display: 'block' }}
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            
            </div>
              
              
            
            {/* Modal Body / Iframe */}
            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#e9ecef', position: 'relative' }}>
               <iframe 
                 src={previewUrl} 
                 title="File Preview"
                 style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} 
               />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}