/**
 * @file MyFilesTab.jsx
 * @description Displays all user files grouped by subject. 
 * Includes real-time search filtering and secure file downloading.
 */
import React from 'react';

export default function MyFilesTab({
  searchQuery, setSearchQuery, isLoadingFiles, uploadedFiles,
  expandedFolders, setExpandedFolders, handleDownload,initiateDelete, fetchUserFiles
}) {
   
  return (
    <div style={{ maxWidth: '800px' }}>
      <h2>My Uploaded Files</h2>
      <p style={{ color: '#666' }}>View, search, and download your documents.</p>
      
      <div style={{ backgroundColor: 'var(--container-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
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
        ) : uploadedFiles.length === 0 ? (
          <p>You haven't uploaded any files yet.</p>
        ) : (
          <div>
            {Object.entries(
              uploadedFiles
                .filter(file => file.filename.toLowerCase().includes(searchQuery.toLowerCase()))
                .reduce((folders, file) => {
                  if (!folders[file.subject]) folders[file.subject] = [];
                  folders[file.subject].push(file);
                  return folders;
                }, {})
            ).map(([subject, files]) => (
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
                    {/* LEFT SIDE: Icon and Subject */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#007bff', marginRight: '8px', flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>{subject}</span>
                    </div>

                    {/* RIGHT SIDE: Delete Button and File Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                        Delete
                        </button>
                        <span>{files.length} file{files.length !== 1 && 's'} {expandedFolders[subject] ? '▼' : '▶'}</span>
                    </div>
                    </div>

                {expandedFolders[subject] && (
                  <ul style={{ listStyleType: 'none', padding: '10px', margin: 0, border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
                    {files.map((file, index) => (
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
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {uploadedFiles.filter(f => f.filename.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>No files match your search.</p>
            )}
          </div>
        )}
        <button onClick={fetchUserFiles} style={{ marginTop: '20px', backgroundColor: '#6c757d' }}>Refresh List</button>
      </div>
    </div>
  );
}