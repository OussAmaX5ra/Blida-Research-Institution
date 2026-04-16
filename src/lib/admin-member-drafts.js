import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'research-lab.admin-member-drafts.v1';
const STORAGE_EVENT = 'research-lab:admin-member-drafts:change';
const RESERVED_SLUGS = new Set(['admin', 'api', 'login', 'search', 'new', 'edit']);
const ALLOWED_ROLES = new Set(['Professor', 'Doctor', 'PhD Student']);

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }

  return String(value ?? '')
    .split(/[\n,]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export function slugifyMemberName(value) {
  return normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readStoredMembers() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredMembers(members) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

function toStoredMemberRecord(member) {
  return {
    avatar: normalizeText(member.avatar) || normalizeText(member.name).slice(0, 2).toUpperCase(),
    createdAt: member.createdAt ?? new Date().toISOString(),
    email: normalizeText(member.email ?? ''),
    expertise: normalizeText(member.expertise ?? member.bio),
    id: String(member.id ?? member.slug),
    isLeader: Boolean(member.isLeader),
    name: normalizeText(member.name ?? member.fullName),
    primaryTeamSlug: member.primaryTeamSlug ?? member.team?.slug ?? member.teamSlug ?? '',
    projectCount: member.projectCount ?? 0,
    publicationCount: member.publicationCount ?? 0,
    role: normalizeText(member.role),
    slug: normalizeText(member.slug),
    teamSlugs: member.teamSlugs ?? (member.team?.slug ? [member.team.slug] : []),
    themes: parseList(member.themes),
    title: normalizeText(member.title ?? member.academicTitle),
    updatedAt: member.updatedAt ?? new Date().toISOString(),
  };
}

function ensureSeededMembers(sourceMembers) {
  const storedMembers = readStoredMembers();

  if (storedMembers?.length) {
    return storedMembers;
  }

  if (!sourceMembers.length) {
    return [];
  }

  const seededMembers = sourceMembers.map((member) => toStoredMemberRecord(member));
  writeStoredMembers(seededMembers);
  return seededMembers;
}

function buildUniqueSlug(slug, members, currentId) {
  let nextSlug = slug;
  let suffix = 2;

  while (members.some((member) => member.id !== currentId && member.slug === nextSlug)) {
    nextSlug = `${slug}-${suffix}`;
    suffix += 1;
  }

  return nextSlug;
}

function buildInitialAvatar(name) {
  return normalizeText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function isValidEmail(value) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateMemberDraft(values, members, currentId) {
  const nextErrors = {};
  const normalizedSlug = slugifyMemberName(values.slug || values.name);
  const teamSlugs = Array.isArray(values.teamSlugs)
    ? values.teamSlugs.filter(Boolean)
    : parseList(values.teamSlugs);
  const themes = parseList(values.themes);

  if (!normalizeText(values.name)) {
    nextErrors.name = 'Member name is required.';
  }

  if (!normalizedSlug) {
    nextErrors.slug = 'A valid slug is required.';
  } else if (RESERVED_SLUGS.has(normalizedSlug)) {
    nextErrors.slug = 'This slug is reserved by the routing system.';
  } else if (members.some((member) => member.id !== currentId && member.slug === normalizedSlug)) {
    nextErrors.slug = 'Another member already uses this slug.';
  }

  if (!ALLOWED_ROLES.has(normalizeText(values.role))) {
    nextErrors.role = 'Choose Professor, Doctor, or PhD Student.';
  }

  if (!normalizeText(values.title)) {
    nextErrors.title = 'Academic title is required.';
  }

  if (!normalizeText(values.expertise)) {
    nextErrors.expertise = 'Add the member expertise or bio summary.';
  }

  if (!teamSlugs.length) {
    nextErrors.teamSlugs = 'Assign at least one team.';
  }

  if (!themes.length) {
    nextErrors.themes = 'Add at least one research theme.';
  }

  if (!isValidEmail(normalizeText(values.email))) {
    nextErrors.email = 'Use a valid email address or leave the field blank.';
  }

  if (normalizeText(values.avatar) && !/^[A-Z]{1,4}$/.test(normalizeText(values.avatar).toUpperCase())) {
    nextErrors.avatar = 'Avatar initials should use 1 to 4 uppercase letters.';
  }

  return {
    errors: nextErrors,
    normalizedSlug,
    teamSlugs,
    themes,
  };
}

function buildStoredMemberFromForm(values, members, currentId = null) {
  const { errors, normalizedSlug, teamSlugs, themes } = validateMemberDraft(values, members, currentId);

  if (Object.keys(errors).length) {
    return {
      errors,
      member: null,
    };
  }

  const existingMember = currentId ? members.find((member) => member.id === currentId) ?? null : null;
  const nextId = currentId ?? `local-member-${Date.now()}`;

  return {
    errors: {},
    member: {
      avatar: normalizeText(values.avatar).toUpperCase() || buildInitialAvatar(values.name),
      createdAt: existingMember?.createdAt ?? new Date().toISOString(),
      email: normalizeText(values.email),
      expertise: normalizeText(values.expertise),
      id: nextId,
      isLeader: existingMember?.isLeader ?? false,
      name: normalizeText(values.name),
      primaryTeamSlug: values.primaryTeamSlug && teamSlugs.includes(values.primaryTeamSlug)
        ? values.primaryTeamSlug
        : teamSlugs[0],
      projectCount: existingMember?.projectCount ?? 0,
      publicationCount: existingMember?.publicationCount ?? 0,
      role: normalizeText(values.role),
      slug: buildUniqueSlug(normalizedSlug, members, currentId),
      teamSlugs,
      themes,
      title: normalizeText(values.title),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createAdminMemberDraft(values, members) {
  const result = buildStoredMemberFromForm(values, members);

  if (!result.member) {
    return result;
  }

  const nextMembers = [result.member, ...members];
  writeStoredMembers(nextMembers);

  return {
    errors: {},
    member: result.member,
    members: nextMembers,
  };
}

export function updateAdminMemberDraft(memberId, values, members) {
  const result = buildStoredMemberFromForm(values, members, memberId);

  if (!result.member) {
    return result;
  }

  const nextMembers = members.map((member) => (member.id === memberId ? result.member : member));
  writeStoredMembers(nextMembers);

  return {
    errors: {},
    member: result.member,
    members: nextMembers,
  };
}

export function deleteAdminMemberDraft(memberId, members) {
  const nextMembers = members.filter((member) => member.id !== memberId);
  writeStoredMembers(nextMembers);
  return nextMembers;
}

function enrichMember(member, teams) {
  const assignedTeams = member.teamSlugs
    .map((teamSlug) => teams.find((team) => team.slug === teamSlug))
    .filter(Boolean);
  const primaryTeam = assignedTeams.find((team) => team.slug === member.primaryTeamSlug) ?? assignedTeams[0] ?? null;

  return {
    ...member,
    assignedTeams,
    primaryTeam,
  };
}

export function useAdminMemberDrafts(sourceMembers, teams) {
  const normalizedSourceMembers = useMemo(
    () => sourceMembers.map((member) => toStoredMemberRecord(member)),
    [sourceMembers],
  );
  const [members, setMembers] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncMembers = () => {
      const nextMembers = ensureSeededMembers(normalizedSourceMembers);
      setMembers(nextMembers);
      setIsReady(true);
    };

    syncMembers();

    if (!canUseStorage()) {
      return undefined;
    }

    window.addEventListener(STORAGE_EVENT, syncMembers);
    window.addEventListener('storage', syncMembers);

    return () => {
      window.removeEventListener(STORAGE_EVENT, syncMembers);
      window.removeEventListener('storage', syncMembers);
    };
  }, [normalizedSourceMembers]);

  const enrichedMembers = useMemo(
    () =>
      members
        .map((member) => enrichMember(member, teams))
        .toSorted((left, right) => left.name.localeCompare(right.name)),
    [members, teams],
  );

  return {
    isReady,
    members: enrichedMembers,
    findMemberBySlug(slug) {
      return enrichedMembers.find((member) => member.slug === slug) ?? null;
    },
    createMember(values) {
      const result = createAdminMemberDraft(values, members);

      if (result.members) {
        setMembers(result.members);
      }

      return result;
    },
    updateMember(memberId, values) {
      const result = updateAdminMemberDraft(memberId, values, members);

      if (result.members) {
        setMembers(result.members);
      }

      return result;
    },
    deleteMember(memberId) {
      const nextMembers = deleteAdminMemberDraft(memberId, members);
      setMembers(nextMembers);
      return nextMembers;
    },
  };
}
