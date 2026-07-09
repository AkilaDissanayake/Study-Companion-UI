/**
 * @file UploadTab.jsx
 * @description Provides the interface for users to select files and assign them to a subject folder.
 * Includes dynamic input rendering when a user wants to create a new subject.
 */
import React from 'react';

export default function UploadTab({ 
  isAddingSubject, selectedSubject, handleSubjectChange, subjects,
  newSubject, setNewSubject, setSelectedFiles, setUploadStatus,
  handleFileUpload, uploadStatus 
}) {
  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>Upload Documents</h2>
      <p style={{ color: '#666' }}>Securely upload files to specific subject folders.</p>
      
      <div style={{ backgroundColor: 'var(--container-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        <label style={{ fontWeight: 'bold' }}>Target Subject / Folder:</label>
        <select 
          value={isAddingSubject ? 'ADD_NEW' : selectedSubject}
          onChange={handleSubjectChange}
          style={{ marginBottom: isAddingSubject ? '10px' : '20px' }}
        >
          <option value="">-- Root Folder (No Subject) --</option>
          {subjects.map((sub, index) => (
            <option key={index} value={sub}>{sub}</option>
          ))}
          <option value="ADD_NEW">+ Add new subject...</option>
        </select>

        {isAddingSubject && (
          <input 
            type="text" 
            placeholder="Type your new subject name here..." 
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            style={{ marginBottom: '20px', border: '1px solid var(--primary)' }}
          />
        )}

        <label style={{ fontWeight: 'bold', display: 'block' }}>Select Files:</label>
        <input type="file" multiple onChange={(e) => { setSelectedFiles(e.target.files); setUploadStatus(''); }} />
        
        <button onClick={handleFileUpload} style={{ marginTop: '20px' }}>Upload Files</button>
        
        {uploadStatus && <p style={{ marginTop: '15px', fontWeight: 'bold', color: uploadStatus.includes('Success') ? '#28a745' : '#dc3545' }}>{uploadStatus}</p>}
      </div>
    </div>
  );
}