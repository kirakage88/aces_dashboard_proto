const STORAGE_KEY = 'aces_templates';
const DEFAULT_KEY = 'aces_default_template_id';

const HARDCODED_TEMPLATE = {
  name: 'Default Template',
  content: [
    { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Project Title', styles: {} }] },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Project Introduction', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Brief background of the project...', styles: {} }] },
    { type: 'divider' },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Objectives', styles: {} }] },
    { type: 'bulletListItem', content: [{ type: 'text', text: 'Objective 1', styles: {} }] },
    { type: 'bulletListItem', content: [{ type: 'text', text: 'Objective 2', styles: {} }] },
    { type: 'divider' },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Participants', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'What the project includes and covers...', styles: {} }] },
    { type: 'divider' },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Project Tasks', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: '[link project tasks here]', styles: { italic: true } }] },
    { type: 'bulletListItem', content: [{ type: 'text', text: 'Task 1', styles: {} }] },
    { type: 'bulletListItem', content: [{ type: 'text', text: 'Task 2', styles: {} }] },
    { type: 'divider' },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Expected Outcomes', styles: {} }] },
    { type: 'bulletListItem', content: [{ type: 'text', text: 'Outcome 1', styles: {} }] },
    { type: 'bulletListItem', content: [{ type: 'text', text: 'Outcome 2', styles: {} }] },
    { type: 'divider' },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Project Timeline', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: '[link project timeline here]', styles: { italic: true } }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Week 1:', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Week 2:', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Week 3:', styles: {} }] },
    { type: 'divider' },
    { type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: 'Remarks', styles: {} }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Additional notes, clarifications, or important details about the project...', styles: {} }] },
  ],
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function seedIfEmpty() {
  let templates = load();
  if (!templates || templates.length === 0) {
    const id = uid();
    templates = [{ ...HARDCODED_TEMPLATE, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    saveToStorage(templates);
    localStorage.setItem(DEFAULT_KEY, id);
  }
  return templates;
}

export function getTemplates() {
  return seedIfEmpty();
}

export function getDefaultTemplate() {
  const templates = getTemplates();
  const defaultId = localStorage.getItem(DEFAULT_KEY);
  const found = templates.find((t) => t.id === defaultId);
  return found || templates[0];
}

export function saveTemplate(template) {
  const templates = getTemplates();
  const idx = templates.findIndex((t) => t.id === template.id);
  const stamped = { ...template, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    templates[idx] = stamped;
  } else {
    stamped.id = uid();
    stamped.createdAt = new Date().toISOString();
    templates.push(stamped);
  }
  saveToStorage(templates);
  return stamped;
}

export function deleteTemplate(id) {
  let templates = getTemplates();
  templates = templates.filter((t) => t.id !== id);
  saveToStorage(templates);
  const defaultId = localStorage.getItem(DEFAULT_KEY);
  if (defaultId === id) {
    const next = templates[0];
    if (next) {
      localStorage.setItem(DEFAULT_KEY, next.id);
    } else {
      localStorage.removeItem(DEFAULT_KEY);
    }
  }
}

export function setDefaultTemplate(id) {
  localStorage.setItem(DEFAULT_KEY, id);
}
