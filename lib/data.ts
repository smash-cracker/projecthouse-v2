export const CATEGORIES = [
  { id: 'all',  label: 'All Projects' },
  { id: 'ml',   label: 'Machine Learning' },
  { id: 'dl',   label: 'Deep Learning' },
  { id: 'cv',   label: 'Computer Vision' },
  { id: 'web',  label: 'Web Applications' },
  { id: 'mob',  label: 'Mobile Applications' },
];

/** Categories a project can actually belong to (everything except the
 *  "all" filter tab). Used by the admin forms. */
export const PROJECT_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'all');

/** The seven-day delivery plan shown in the drawer and on a project page. */
export const PROJECT_TIMELINE: [string, string][] = [
  ['Day 1',   'Download, unzip, run setup script'],
  ['Day 2',   'Walk through the report + notebooks'],
  ['Day 3–5', 'Customise dataset / tune for your use case'],
  ['Day 6',   'Deploy demo, record walkthrough'],
  ['Day 7',   'Viva prep — we answer your questions'],
];

export const TWEAK_DEFAULTS = {
  "accent": "#FF8A5C"
};

export const VIVA_TABS = [
  { id: 'ml',  label: 'Machine Learning', icon: '🤖' },
  { id: 'dl',  label: 'Deep Learning',    icon: '🧠' },
  { id: 'cv',  label: 'Computer Vision',  icon: '👁️' },
  { id: 'web', label: 'Web Applications', icon: '🌐' },
  { id: 'mob', label: 'Mobile Apps',      icon: '📱' },
];
