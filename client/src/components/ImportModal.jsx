import React, { useRef, useState } from 'react';
import { db, newId } from '../db/db';

const SUPPORTED_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/flac', 'audio/x-flac', ''];

function readAudioDuration(file) {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      const cleanup = () => URL.revokeObjectURL(url);
      audio.addEventListener('loadedmetadata', () => {
        resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
        cleanup();
      });
      audio.addEventListener('error', () => {
        resolve(0);
        cleanup();
      });
      audio.src = url;
    } catch {
      resolve(0);
    }
  });
}

function guessTitle(fileName) {
  return fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

export default function ImportModal({ categories, onClose, onImported, onCreateCategory, lockedCategoryId, lockedCategoryName }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState('pick'); // pick | choose-category | importing | done | error
  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPendingFiles(files);
    if (lockedCategoryId) setSelectedCategory(lockedCategoryId);
    setStep('choose-category');
  };

  const startImport = async () => {
    let categoryId = selectedCategory;

    if (showNewCategoryInput) {
      const name = newCategoryName.trim();
      if (!name) return;
      categoryId = await onCreateCategory(name);
    }

    if (!categoryId) return;

    setStep('importing');
    setProgress({ done: 0, total: pendingFiles.length });

    let success = 0;
    let skipped = 0;

    for (let i = 0; i < pendingFiles.length; i += 1) {
      const file = pendingFiles[i];
      try {
        const isAudio = file.type.startsWith('audio/') || SUPPORTED_TYPES.includes(file.type) || /\.(mp3|m4a|aac|wav|ogg|flac)$/i.test(file.name);
        if (!isAudio) {
          skipped += 1;
        } else {
          const duration = await readAudioDuration(file);
          const song = {
            id: newId('song'),
            title: guessTitle(file.name),
            artist: '',
            categoryId,
            fileName: file.name,
            mimeType: file.type || 'audio/mpeg',
            duration,
            fileSize: file.size,
            audioBlob: file, // File is a Blob subclass; stored directly in IndexedDB
            isFavorite: false,
            playCount: 0,
            lastPlayedAt: null,
            createdAt: Date.now()
          };
          await db.songs.add(song);
          success += 1;
        }
      } catch {
        skipped += 1;
      }
      setProgress({ done: i + 1, total: pendingFiles.length });
    }

    setImportedCount(success);
    setSkippedCount(skipped);
    setStep('done');
    onImported();
  };

  return (
    <div className="modal-backdrop" onClick={step === 'importing' ? undefined : onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {step === 'pick' && (
          <>
            <h3>Import Songs</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: -10, fontSize: 14 }}>
              Select the devotional songs from your phone that you want to add to Bhakti Sangeet.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFilesSelected}
            />
            <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
              Choose Audio Files
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {step === 'choose-category' && (
          <>
            <h3>{pendingFiles.length} song{pendingFiles.length !== 1 ? 's' : ''} selected</h3>
            {lockedCategoryId ? (
              <p style={{ color: 'var(--text-muted)', marginTop: -10, fontSize: 14 }}>
                These songs will be added to {lockedCategoryName || 'this category'}.
              </p>
            ) : (
              <>
            <p style={{ color: 'var(--text-muted)', marginTop: -10, fontSize: 14 }}>Choose a category</p>
            <div className="pill-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`pill ${selectedCategory === cat.id && !showNewCategoryInput ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowNewCategoryInput(false);
                  }}
                >
                  {cat.icon} {cat.name}
                </div>
              ))}
              <div
                className={`pill ${showNewCategoryInput ? 'selected' : ''}`}
                onClick={() => setShowNewCategoryInput(true)}
              >
                + Create New
              </div>
            </div>
            {showNewCategoryInput && (
              <input
                className="text-input"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            )}
              </>
            )}
            <button
              className="btn-primary"
              disabled={!selectedCategory && !showNewCategoryInput}
              onClick={startImport}
            >
              Import {pendingFiles.length} Song{pendingFiles.length !== 1 ? 's' : ''}
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {step === 'importing' && (
          <>
            <h3>Importing songs…</h3>
            <div className="import-progress">
              <div
                className="import-progress-fill"
                style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {progress.done} of {progress.total} processed
            </p>
          </>
        )}

        {step === 'done' && (
          <>
            <h3>Import complete</h3>
            <div className="banner">
              {importedCount} song{importedCount !== 1 ? 's' : ''} imported successfully
              {skippedCount > 0 ? `, ${skippedCount} skipped (unsupported format)` : ''}.
            </div>
            <button className="btn-primary" onClick={onClose}>
              Done
            </button>
          </>
        )}

        {step === 'error' && (
          <>
            <h3>Import failed</h3>
            <div className="banner error">{errorMsg || 'Unable to import this song.'}</div>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
