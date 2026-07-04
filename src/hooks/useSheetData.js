import { useState, useEffect, useCallback } from 'react';
import { fetchCSV, updateItem as update, deleteItem as remove, insertItem as insert, moveItem as move } from '../data/csvParser';
import { SHEETS } from '../data/sources';

export default function useSheetData() {
  const [projectData, setProjectData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([fetchCSV(SHEETS.projectTracker), fetchCSV(SHEETS.ledger)])
      .then(([projects, ledger]) => {
        if (!cancelled) {
          setProjectData(projects);
          setLedgerData(ledger);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const updateProjectItem = useCallback((index, patch) => {
    setProjectData((prev) => update(prev, index, patch));
  }, []);

  const deleteProjectItem = useCallback((index) => {
    setProjectData((prev) => remove(prev, index));
  }, []);

  const insertProjectItem = useCallback((index, row) => {
    setProjectData((prev) => insert(prev, row));
  }, []);

  const moveProjectItem = useCallback((fromIdx, toIdx) => {
    setProjectData((prev) => move(prev, fromIdx, toIdx));
  }, []);

  const updateLedgerItem = useCallback((index, patch) => {
    setLedgerData((prev) => update(prev, index, patch));
  }, []);

  const deleteLedgerItem = useCallback((index) => {
    setLedgerData((prev) => remove(prev, index));
  }, []);

  const insertLedgerItem = useCallback((index, row) => {
    setLedgerData((prev) => insert(prev, row));
  }, []);

  const moveLedgerItem = useCallback((fromIdx, toIdx) => {
    setLedgerData((prev) => move(prev, fromIdx, toIdx));
  }, []);

  const followLink = useCallback((url, key, setCopiedKey) => {
    const fallback = (text) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        if (setCopiedKey) { setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); }
      } catch (err) { console.error('Clipboard fallback failed', err); }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (setCopiedKey) { setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); }
      }).catch(() => fallback(url));
    } else { fallback(url); }
  }, []);

  const project = {
    data: projectData,
    updateItem: updateProjectItem,
    deleteItem: deleteProjectItem,
    insertItem: insertProjectItem,
    moveItem: moveProjectItem,
  };

  const ledger = {
    data: ledgerData,
    updateItem: updateLedgerItem,
    deleteItem: deleteLedgerItem,
    insertItem: insertLedgerItem,
    moveItem: moveLedgerItem,
  };

  return { project, ledger, loading, error, followLink };
}
