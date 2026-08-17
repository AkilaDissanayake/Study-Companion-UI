/**
 * @file FileManagerTab.jsx
 * @description Unified tab for uploading files, creating subjects, and viewing documents.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Search, Folder, FolderOpen, FileText, X, ChevronDown, ChevronRight, RefreshCw, CheckCircle2, XCircle, Upload, FolderSearch } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';
import { Input, Select } from './ui/Input';

const buttonReset = { all: 'unset', cursor: 'pointer', boxSizing: 'border-box' };

/**
 * Animated disclosure panel for a folder's file list (grid-template-rows
 * 0fr -> 1fr — the one CSS-only way to transition to/from an intrinsic
 * height; see .folder-body in index.css). Sets the native `inert` property
 * imperatively (rather than as a JSX prop, for broad React-version
 * compatibility) so buttons inside a collapsed panel are removed from the
 * tab order and AT tree instead of sitting there as invisible, focusable
 * "phantom" controls — otherwise the CSS-only collapse would silently
 * reopen the exact keyboard trap this app's accessibility pass closed.
 */
function FolderPanel({ isExpanded, children }) {
  const panelRef = useRef(null);
  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !isExpanded;
  }, [isExpanded]);

  return (
    <div ref={panelRef} className={`folder-body${isExpanded ? ' expanded' : ''}`} aria-hidden={!isExpanded}>
      {children}
    </div>
  );
}

export default function FileManagerTab({
  isAddingSubject, selectedSubject, handleSubjectChange, subjects,
  newSubject, setNewSubject, selectedFiles, setSelectedFiles, resetUploadState,
  handleFileUpload, uploadState, uploadProgress, uploadError, uploadedFolder,
  searchQuery, setSearchQuery, isLoadingFiles, uploadedFiles,
  expandedFolders, setExpandedFolders, handleDownload, initiateDelete, fetchUserFiles,
  handleGetFileUrl
}) {

  // --- STATE FOR PREVIEW MODAL ---
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
      <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
        Upload, organize, and manage your documents.
      </p>

      {/* --- UPLOAD SECTION --- */}
      <Card style={{ marginTop: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <h3>Upload New Document</h3>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Target Folder
                </label>
                <Select value={isAddingSubject ? 'ADD_NEW' : selectedSubject} onChange={handleSubjectChange}>
                  <option value="root">General</option>
                  {subjects.map((sub, index) => (
                    <option key={index} value={sub}>{sub}</option>
                  ))}
                  <option value="ADD_NEW">+ Add new subject...</option>
                </Select>

                {isAddingSubject && (
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <Input
                      placeholder="Type new subject name..."
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      style={{ borderColor: 'var(--color-primary-500)' }}
                    />
                  </div>
                )}
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontWeight: 600, fontSize: 'var(--font-size-body-sm)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Select Files
                </label>
                {/* Styled to match the rest of the design system — the native
                    <input type="file"> stays functionally in place (still
                    focusable/keyboard-operable via the wrapping <label>) but
                    is visually hidden via the .visually-hidden clip technique,
                    not display:none, so it keeps its accessibility tree presence. */}
                <label
                  className="file-drop-label"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--color-border-strong)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-body-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    transition: `border-color var(--duration-base) var(--ease-standard), background-color var(--duration-base) var(--ease-standard)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  <Upload size={16} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFiles && selectedFiles.length > 0
                      ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`
                      : 'Choose files…'}
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => { setSelectedFiles(e.target.files); resetUploadState(); }}
                    className="visually-hidden"
                  />
                </label>
            </div>

            <Button onClick={handleFileUpload} disabled={uploadState === 'uploading'} isLoading={uploadState === 'uploading'}>
              Upload
            </Button>
        </div>

        {uploadState === 'uploading' && (
          // Progress bar — same intentional pattern as the quiz-question
          // progress bar (see QuizzesTab.jsx): a visible, shrinking amount of
          // remaining work reduces anxiety during the wait (Zeigarnik effect).
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div
              style={{
                height: 6,
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface-hover)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'var(--color-primary-500)',
                  borderRadius: 'var(--radius-full)',
                  transition: `width var(--duration-slow) var(--ease-standard)`,
                }}
              />
            </div>
            <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)' }}>
              Uploading… {uploadProgress}%
            </p>
          </div>
        )}

        {uploadState === 'success' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-success)' }}>
              Success! Files saved to {uploadedFolder}.
            </p>
          </div>
        )}

        {uploadState === 'error' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <XCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-danger)' }}>
              {uploadError}
            </p>
          </div>
        )}
      </Card>

      {/* --- FILES VIEWER SECTION --- */}
      <Card>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-5)',
            gap: 'var(--space-4)'
        }}>
            <h3 style={{ flexShrink: 0 }}>My Files</h3>
            <Button variant="secondary" size="sm" iconLeft={<RefreshCw size={14} />} onClick={fetchUserFiles}>
              Refresh
            </Button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Input
            iconLeft={<Search size={16} />}
            placeholder="Search for any file by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoadingFiles ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading your files...</p>
        ) : uploadedFiles.length === 0 ? (
          <EmptyState
            icon={<FolderSearch size={22} />}
            title="No files yet"
            description="Upload a document above to get started — the AI tutor can reference it directly in chat."
          />
        ) : (
          <div>
            {Object.entries(groupedFiles).map(([subject, files]) => {
              if (searchQuery && files.length === 0) return null;
              const isExpanded = !!expandedFolders[subject];

              return (
                <div key={subject} style={{ marginBottom: 'var(--space-3)' }}>
                  <div
                      style={{
                          backgroundColor: 'var(--color-surface-hover)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                      }}
                  >
                      <button
                        type="button"
                        onClick={() => setExpandedFolders(prev => ({...prev, [subject]: !prev[subject]}))}
                        aria-expanded={isExpanded}
                        style={{
                            ...buttonReset,
                            flex: 1,
                            minWidth: 0,
                            padding: 'var(--space-3)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)',
                            color: 'var(--color-text-primary)',
                        }}
                      >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                              {isExpanded
                                ? <FolderOpen size={18} color="var(--color-primary-500)" />
                                : <Folder size={18} color="var(--color-primary-500)" />}
                              <span>{subject === 'root' ? 'General' : subject}</span>
                          </span>

                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: 'var(--font-size-body-sm)' }}>
                            {files.length} file{files.length !== 1 && 's'}
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </span>
                      </button>

                      {subject !== 'root' && (
                          <Button
                            variant="danger-secondary"
                            size="sm"
                            onClick={() => initiateDelete(null, subject)}
                            style={{ marginRight: 'var(--space-3)', flexShrink: 0 }}
                          >
                            Delete Subject
                          </Button>
                      )}
                  </div>

                  <FolderPanel isExpanded={isExpanded}>
                    <ul style={{ listStyleType: 'none', padding: 'var(--space-2) var(--space-3)', margin: 0, border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
                      {files.length === 0 ? (
                          <li style={{ padding: 'var(--space-2) 0', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>No files in this folder.</li>
                      ) : (
                          files.map((file, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: index < files.length - 1 ? '1px solid var(--color-border)' : 'none' }}>

                              <button
                                type="button"
                                onClick={() => openPreview(file.filename, file.subject)}
                                style={{
                                  ...buttonReset,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-2)',
                                  overflow: 'hidden',
                                  marginRight: 'var(--space-4)',
                                  flex: 1,
                                  minWidth: 0,
                                  fontFamily: 'var(--font-body)',
                                }}
                                title="Click to view file"
                              >
                                <FileText size={16} color="var(--color-primary-500)" style={{ flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>
                                  {file.filename}
                                </span>
                              </button>

                              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                  <Button variant="secondary" size="sm" onClick={() => handleDownload(file.filename, file.subject)}>
                                      Download
                                  </Button>
                                  <Button variant="danger-secondary" size="sm" onClick={() => initiateDelete(file.filename, file.subject)}>
                                      Delete
                                  </Button>
                              </div>
                            </li>
                          ))
                      )}
                    </ul>
                  </FolderPanel>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* --- PREVIEW MODAL --- */}
      {isLoadingPreview && (
        <Modal isOpen maxWidth={280} onClose={() => {}}>
          <p style={{ margin: 0, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading preview...</p>
        </Modal>
      )}

      <Modal isOpen={!!previewUrl} onClose={closePreview} maxWidth={1000} maxHeight="90vh" padding={0}>
        {previewUrl && (
          <>
            <div style={{
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 'var(--space-5)',
                background: 'var(--color-surface-hover)',
                flexShrink: 0,
            }}>
              <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewName}</h3>
              <IconButton icon={<X size={20} />} onClick={closePreview} aria-label="Close Preview" />
            </div>

            <div style={{ flex: 1, overflow: 'hidden', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
               <iframe
                 src={previewUrl}
                 title="File Preview"
                 style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
               />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
