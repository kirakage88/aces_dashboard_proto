import Papa from 'papaparse';

export async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const result = Papa.parse(text, { header: false, skipEmptyLines: true });
  return result.data.map((row, i) => ({ index_: i, row }));
}

export function updateItem(data, index, patch) {
  const entry = data.find((d) => d.index_ === index);
  if (!entry) return data;
  return data.map((d) =>
    d.index_ === index
      ? { ...d, row: d.row.map((v, i) => (patch[i] !== undefined ? patch[i] : v)) }
      : d
  );
}

export function deleteItem(data, index) {
  return data.filter((d) => d.index_ !== index);
}

export function insertItem(data, row) {
  const maxIndex = data.reduce((max, d) => Math.max(max, d.index_), -1);
  return [...data, { index_: maxIndex + 1, row }];
}

export function moveItem(data, fromIdx, toIdx) {
  const copy = [...data];
  const [moved] = copy.splice(fromIdx, 1);
  copy.splice(toIdx, 0, moved);
  return copy;
}
