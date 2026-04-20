export const adminSectionContentById = {
  'admin-teams': {
    eyebrow: 'Team Registry',
    title: 'Manage research teams stored in MongoDB.',
    description:
      'Create, edit, and remove team profiles. Changes persist through the protected admin API and appear on the public site after the next data refresh.',
    highlights: ['List and filters', 'Create / edit forms', 'Slug-safe routing', 'Axis-linked metadata'],
  },
  'admin-members': {
    eyebrow: 'Member Ledger',
    title: 'Maintain the lab member directory.',
    description:
      'Member records are saved to the database via the admin API. Assign teams, roles, and themes with server-side validation.',
    highlights: ['Role-based roster', 'Team assignments', 'Search and filters', 'Public slug URLs'],
  },
  'admin-projects': {
    eyebrow: 'Project Board',
    title: 'Track research projects by team and year.',
    description:
      'Projects are stored in MongoDB and linked to teams and optional lead members. Updates sync to the public projects listing.',
    highlights: ['Team linkage', 'Milestones and status', 'Year and themes', 'PhD progress flag'],
  },
  'admin-publications': {
    eyebrow: 'Publication Desk',
    title: 'Curate publications and citation metadata.',
    description:
      'Full BibTeX-oriented fields are validated on the server. Publications are tied to teams and surface on the public bibliography.',
    highlights: ['DOI and venue fields', 'Status workflow', 'Team assignment', 'Citation helpers'],
  },
  'admin-news': {
    eyebrow: 'News Desk',
    title: 'Publish institutional news stories.',
    description:
      'Stories are persisted in the database with publish dates, excerpts, and team tags. Draft and review statuses control visibility.',
    highlights: ['Editorial statuses', 'Team tagging', 'Image URLs', 'Multi-paragraph body'],
  },
  'admin-gallery': {
    eyebrow: 'Gallery Archive',
    title: 'Manage media entries for the public gallery.',
    description:
      'Gallery items are stored server-side with optional team association, categories, and publication-style statuses.',
    highlights: ['Capture dates', 'Captions and categories', 'Team or institution-wide', 'Status workflow'],
  },
  'admin-users': {
    eyebrow: 'Access Control',
    title: 'Admin accounts and roles.',
    description:
      'User accounts are backed by the database. Role and status changes apply through the protected users API.',
    highlights: ['Role assignment', 'Account status', 'Password reset issuance', 'Capability scopes'],
  },
  'admin-activity': {
    eyebrow: 'Audit Stream',
    title: 'Recent actions in this browser.',
    description:
      'A lightweight activity log is kept in local storage for quick feedback. For a full server-side audit trail, extend the API with persistent logging.',
    highlights: ['Create / update / delete events', 'Entity labels', 'Timestamps', 'Session-scoped view'],
  },
  'admin-settings': {
    eyebrow: 'Platform Settings',
    title: 'Reserved for environment and policy controls.',
    description:
      'Use this area when you add system configuration backed by the API. Site copy and contact details continue to load from public configuration endpoints.',
    highlights: ['Future: API keys', 'Future: publishing policy', 'Future: security defaults'],
  },
};
