export const adminDashboardMetrics = [
  { label: 'Published items', value: '148', change: '+12 this month', tone: 'up' },
  { label: 'Review backlog', value: '09', change: '2 overdue today', tone: 'down' },
  { label: 'Pending approvals', value: '17', change: '8 need director sign-off', tone: 'warn' },
  { label: 'Research alerts', value: '04', change: '1 externally visible', tone: 'neutral' },
];

export const adminDeskNotes = [
  {
    title: 'Publication queue drifting beyond SLA',
    body: 'Three article records have all metadata completed but are still waiting on PDF verification and DOI confirmation.',
  },
  {
    title: 'Two teams need profile refreshes',
    body: 'The DEC and BIG summaries are current, but member headcounts do not match the latest internal roster review.',
  },
  {
    title: 'News feed feels strong this week',
    body: 'The award story, the partnership note, and the doctoral milestone create a cohesive public narrative if approved today.',
  },
];

export const adminApprovalTimeline = [
  { time: '08:15', item: 'Director digest compiled', status: 'Filed' },
  { time: '09:00', item: 'Homepage spotlight review', status: 'Live desk' },
  { time: '11:30', item: 'Publication metadata check', status: 'Needs source' },
  { time: '14:10', item: 'Grant announcement approval', status: 'Awaiting sign-off' },
];

export const adminQuickActions = [
  'Review homepage spotlight sequence',
  'Audit draft-to-publish transitions',
  'Normalize team ownership metadata',
  'Prepare user role management foundation',
];

export const adminSectionContentById = {
  'admin-teams': {
    eyebrow: 'Team Registry',
    title: 'Team management will grow into full CRUD from this shell.',
    description:
      'This milestone step establishes the protected frame, route structure, and navigation target for the teams workspace before list, create, edit, and delete workflows are implemented.',
    highlights: ['List view pending', 'Create form pending', 'Edit form pending', 'Delete confirmation pending'],
  },
  'admin-members': {
    eyebrow: 'Member Ledger',
    title: 'The members workspace is protected and ready for role-specific CRUD next.',
    description:
      'The shell already reserves a dedicated surface for member management so future work can focus on professor, doctor, and PhD student workflows without revisiting navigation.',
    highlights: ['Grouped role workflows pending', 'List filters pending', 'Profile forms pending', 'Deletion guard pending'],
  },
  'admin-projects': {
    eyebrow: 'Project Board',
    title: 'Projects now have a dedicated admin destination inside the protected shell.',
    description:
      'This route is where project listings, create/edit forms, milestone editing, and linked PhD progress flows can be introduced in the next milestone tasks.',
    highlights: ['Project list pending', 'Project form pending', 'Milestone editor pending', 'Delete flow pending'],
  },
  'admin-publications': {
    eyebrow: 'Publication Desk',
    title: 'Publications are framed for editorial management and citation work.',
    description:
      'The protected publication route is now part of the admin structure, creating a stable home for metadata editing, citation export controls, and search-oriented review workflows.',
    highlights: ['Publication list pending', 'Create/edit forms pending', 'Citation tools pending', 'Delete flow pending'],
  },
  'admin-news': {
    eyebrow: 'News Desk',
    title: 'News now sits inside the admin shell as its own editorial workspace.',
    description:
      'This route prepares the admin side for structured institutional storytelling workflows, including drafting, approval, publication, and media pairing.',
    highlights: ['News list pending', 'Story editor pending', 'Publish controls pending', 'Delete flow pending'],
  },
  'admin-gallery': {
    eyebrow: 'Gallery Archive',
    title: 'Gallery management has a reserved route in the protected workspace.',
    description:
      'The shell gives gallery curation a stable admin home so media ordering, categorization, and future upload workflows can land cleanly.',
    highlights: ['Gallery list pending', 'Upload/edit forms pending', 'Ordering controls pending', 'Delete flow pending'],
  },
  'admin-users': {
    eyebrow: 'Access Control',
    title: 'User and role administration is framed as a high-trust protected section.',
    description:
      'This route is intentionally separated in the navigation to support future account creation, activation, deactivation, role assignment, and password reset workflows.',
    highlights: ['Account list pending', 'Role assignment pending', 'Status toggles pending', 'Password reset flow pending'],
  },
  'admin-activity': {
    eyebrow: 'Audit Stream',
    title: 'Activity monitoring is now part of the admin navigation model.',
    description:
      'This route prepares the shell for future audit logging and operational visibility without forcing that design work into later CRUD screens.',
    highlights: ['Recent activity feed pending', 'Filters pending', 'Actor drill-down pending', 'Sensitive action review pending'],
  },
  'admin-settings': {
    eyebrow: 'Platform Settings',
    title: 'Settings now live inside the protected shell, ready for later system controls.',
    description:
      'Environment policy, security defaults, publishing rules, and future platform configuration all have a dedicated place in the admin structure.',
    highlights: ['Settings panels pending', 'Publishing policy pending', 'Security controls pending', 'Environment controls pending'],
  },
};
