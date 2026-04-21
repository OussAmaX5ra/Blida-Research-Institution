function formatAuthorForBibtex(author) {
  const name = typeof author === "string" ? author : (author.displayName || "");
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const lastName = parts[parts.length - 1];
  const firstInitials = parts.slice(0, -1).map((p) => p[0]).join(" ");
  return `${lastName}, ${firstInitials}`;
}

function formatAuthorForApa(author) {
  const name = typeof author === "string" ? author : (author.displayName || "");
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  const lastName = parts[parts.length - 1];
  const firstInitials = parts.slice(0, -1).map((p) => p[0] + ".").join(" ");
  return `${lastName}, ${firstInitials}`;
}

function generateBibtexKey(authors, year, title) {
  const firstAuthorLastName = authors[0]?.displayName?.split(" ").pop() || "unknown";
  const titleWord = title?.split(" ")[0]?.toLowerCase().replace(/[^a-z]/g, "") || "paper";
  return `${firstAuthorLastName}${year || ""}${titleWord}`.toLowerCase();
}

export function generateBibtex(publication) {
  const { title, authors, journal, year, volume, issue, pages, doi } = publication;
  const key = generateBibtexKey(authors, year, title);
  
  const authorStr = authors?.map(formatAuthorForBibtex).filter(Boolean).join(" and ") || "Unknown";
  
  let entry = `@article{${key},\n`;
  entry += `  author = {${authorStr}},\n`;
  entry += `  title = {${title || ""}},\n`;
  entry += `  journal = {${journal || ""}},\n`;
  entry += `  year = {${year || ""}},\n`;
  
  if (volume) entry += `  volume = {${volume}},\n`;
  if (issue) entry += `  number = {${issue}},\n`;
  if (pages) entry += `  pages = {${pages}},\n`;
  if (doi) entry += `  doi = {${doi}},\n`;
  
  entry += `}`;
  return entry;
}

export function generateApa(publication) {
  const { title, authors, journal, year, volume, issue, pages, doi } = publication;
  
  const authorStr = authors?.map((a, i) => {
    const formatted = formatAuthorForApa(a);
    if (i === authors.length - 1 && authors.length > 1) {
      return `& ${formatted}`;
    }
    return i === 0 ? formatted : `${formatted},`;
  }).join(" ") || "Unknown";
  
  let citation = `${authorStr} (${year || "n.d."}). ${title || ""}. `;
  
  if (journal) {
    citation += `*${journal}*`;
    if (volume) citation += `, ${volume}`;
    if (issue) citation += `(${issue})`;
    if (pages) citation += `, ${pages}`;
    citation += ". ";
  }
  
  if (doi) {
    citation += `https://doi.org/${doi}`;
  }
  
  return citation.trim();
}