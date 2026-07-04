export function parsePHP(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[₱,]/g, '')) || 0;
}

export function formatPHP(val) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(val);
}

export function getSummaryValue(data, keyword) {
  for (let r = 0; r < Math.min(data.length, 3); r++) {
    const idx = data[r].row.findIndex(
      (cell) => typeof cell === 'string' && cell.toLowerCase().includes(keyword.toLowerCase())
    );
    if (idx !== -1) {
      for (let i = idx + 1; i < Math.min(idx + 4, data[r].row.length); i++) {
        const val = data[r].row[i];
        if (val !== null && val !== '' && !(typeof val === 'string' && val.includes(':'))) {
          return val;
        }
      }
    }
  }
  return null;
}

export function getColIndex(headers, keywords) {
  return headers.findIndex(
    (h) => h && keywords.some((k) => h.toLowerCase().includes(k.toLowerCase()))
  );
}

export function transformTransactions(data) {
  if (!data || data.length === 0) return [];

  const headerRowIndex = data.findIndex((row) =>
    row.row.some((cell) => typeof cell === 'string' && cell.toLowerCase().includes('no.'))
  );
  if (headerRowIndex === -1) return [];

  const headers = data[headerRowIndex].row;
  const col = {
    no: getColIndex(headers, ['no.']),
    date: getColIndex(headers, ['date recorded']),
    entryCode: getColIndex(headers, ['entry code', 'entry id']),
    type: getColIndex(headers, ['type']),
    dateIssued: getColIndex(headers, ['date issued']),
    description: getColIndex(headers, ['description']),
    invoice: getColIndex(headers, ['invoice', 'doc no']),
    debit: getColIndex(headers, ['debit']),
    credit: getColIndex(headers, ['credit']),
    account: getColIndex(headers, ['account']),
    accountNo: getColIndex(headers, ['account no.']),
    project: getColIndex(headers, ['project']),
    filing: getColIndex(headers, ['filing status']),
    submission: getColIndex(headers, ['submission status']),
    link: getColIndex(headers, ['document link', 'gdrive']),
    entryBy: getColIndex(headers, ['entry by']),
  };

  const val = (idx, row) => (idx !== -1 && idx < row.length ? row[idx] : null);

  return data.slice(headerRowIndex + 1)
    .filter((item) => item.row.some((cell) => cell !== null && cell !== ''))
    .map((item) => ({
      index_: item.index_,
      no: val(col.no, item.row),
      date: val(col.date, item.row),
      entryCode: val(col.entryCode, item.row),
      type: val(col.type, item.row),
      dateIssued: val(col.dateIssued, item.row),
      description: val(col.description, item.row) || 'No description',
      invoice: val(col.invoice, item.row),
      debit: parsePHP(val(col.debit, item.row)),
      credit: parsePHP(val(col.credit, item.row)),
      account: val(col.account, item.row) || 'Uncategorized',
      accountNo: val(col.accountNo, item.row),
      project: val(col.project, item.row) || 'General',
      filing: val(col.filing, item.row) || 'Pending',
      submission: val(col.submission, item.row),
      link: val(col.link, item.row),
      entryBy: val(col.entryBy, item.row),
      raw: item.row,
    }));
}

export function computeSpendMap(ledgerData) {
  const transactions = transformTransactions(ledgerData);
  const map = {};
  transactions.forEach((t) => {
    const code = t.project;
    if (!code || code === 'General') return;
    const amount = t.credit; // outflow = actual spend
    map[code] = (map[code] || 0) + amount;
  });
  return map;
}
