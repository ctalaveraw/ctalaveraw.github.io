/**
 * Public credentials, distinct from current employment and lab projects.
 * Only confirmed earned certifications appear below.
 * The A.A.S. has met degree requirements; official conferral is pending.
 */
export const certifications = [
  { name: 'AWS Certified Machine Learning Engineer – Associate', detail: 'MLA-C01 · Earned Sep 2026' },
  { name: 'AWS Certified Solutions Architect – Associate' },
  { name: 'CompTIA Security+' },
  { name: 'AWS Certified Cloud Practitioner' },
  { name: 'LPI Linux Essentials' },
  { name: 'PCEP – Certified Entry-Level Python Programmer' },
  { name: 'GitLab Certified Git Associate' },
] as const;

export const education = {
  program: 'Associate of Applied Science in Cybersecurity',
  institution: 'Northern Virginia Community College',
  status: 'Degree requirements completed · Official conferral pending',
} as const;
