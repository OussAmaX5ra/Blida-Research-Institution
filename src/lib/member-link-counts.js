function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stripAcademicTitles(name) {
  return normalizeText(name).replace(/^(prof\.|professor|dr\.|doctor|mr\.|ms\.|mrs\.)\s+/i, '').trim();
}

export function memberPublicationMatchKeys(memberName) {
  const core = stripAcademicTitles(memberName);
  if (!core) {
    return null;
  }

  const parts = core.split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return null;
  }

  const surname = parts[parts.length - 1].toLowerCase();
  const givenTokens = parts.slice(0, -1);
  const firstWord = givenTokens[0] ?? '';
  const firstInitial = firstWord.replace(/[^a-z]/gi, '').charAt(0).toUpperCase();

  return {
    exactCoreLower: core.toLowerCase(),
    fullNameLower: normalizeText(memberName).toLowerCase(),
    surname,
    firstInitial,
    firstGivenLower: firstWord.toLowerCase(),
  };
}

export function authorMatchesMemberKeys(author, keys) {
  if (!keys) {
    return false;
  }

  const a = normalizeText(author);
  if (!a) {
    return false;
  }

  const authorLower = a.toLowerCase();
  if (authorLower === keys.fullNameLower) {
    return true;
  }

  const authorCore = stripAcademicTitles(a);
  if (authorCore.toLowerCase() === keys.exactCoreLower) {
    return true;
  }

  const tokens = authorLower.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return false;
  }

  const authorSurname = tokens[tokens.length - 1];
  if (authorSurname !== keys.surname) {
    return false;
  }

  if (tokens.length === 1) {
    return true;
  }

  const firstToken = tokens[0].replace(/\.$/, '');
  if (firstToken.length === 1 && keys.firstInitial && firstToken.toUpperCase() === keys.firstInitial) {
    return true;
  }

  if (keys.firstGivenLower && (firstToken === keys.firstGivenLower || keys.firstGivenLower.startsWith(firstToken))) {
    return true;
  }

  return false;
}

export function countProjectsForMember(member, projects) {
  const name = normalizeText(member.name);

  return projects.filter((project) => {
    const slug = normalizeText(project.leadMemberSlug ?? project.leadMember?.slug ?? '');
    if (slug) {
      return slug === member.slug;
    }

    const lead = normalizeText(project.lead);
    return Boolean(lead && lead === name);
  }).length;
}

export function countPublicationsForMember(member, publications) {
  const keys = memberPublicationMatchKeys(member.name);
  if (!keys) {
    return 0;
  }

  return publications.filter((publication) =>
    (publication.authors ?? []).some((author) => authorMatchesMemberKeys(author, keys)),
  ).length;
}

export function withMemberLinkCounts(members, projects, publications) {
  return members.map((member) => ({
    ...member,
    projectCount: countProjectsForMember(member, projects),
    publicationCount: countPublicationsForMember(member, publications),
  }));
}
