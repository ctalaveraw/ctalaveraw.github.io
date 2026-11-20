/**
 * Text for the read-only portfolio console's help command.
 * Keep labels and spacing here; the console only renders the formatted result.
 */
type HelpEntry = readonly [command: string, description: string];
type HelpSection = {
  heading: string;
  commands: readonly HelpEntry[];
};

export const helpSections = [
  {
    heading: 'PROFILE',
    commands: [
      ['about', 'background and current work'],
      ['stack', 'systems I work with'],
      ['experience', 'work areas and responsibilities'],
      ['credentials', 'certifications and education'],
      ['projects', 'project summaries'],
    ],
  },
  {
    heading: 'ENGINEERING EVIDENCE',
    commands: [
      ['pipeline', 'application delivery and GitOps paths'],
      ['upstream', 'merged OpenWrt contributions'],
      ['verify', 'test records and open recovery work'],
      ['links', 'public repositories'],
    ],
  },
  {
    heading: 'REPOSITORIES',
    commands: [
      ['open arm', 'ARM64 platform source'],
      ['open mokerlink', 'RTL9303 board support'],
      ['open goodtop', 'SFP+ switch board support'],
      ['git status', 'portfolio repository'],
      ['git log', 'portfolio repository'],
      ['kubectl get pods', 'cluster documentation'],
      ['docker ps', 'container project documentation'],
    ],
  },
  {
    heading: 'SESSION',
    commands: [
      ['ls', 'portfolio files'],
      ['pwd', 'current path'],
      ['date', 'local time'],
      ['history', 'previous commands'],
      ['clear', 'clear output'],
      ['exit', 'close console'],
    ],
  },
] as const satisfies readonly HelpSection[];

export function formatTerminalHelp(): string[] {
  const commandNames = helpSections.flatMap((section) =>
    section.commands.map(([command]) => command),
  );
  const width = Math.max(...commandNames.map((command) => command.length)) + 3;

  return helpSections.flatMap((section) => [
    section.heading,
    ...section.commands.map(([command, description]) => `  ${command.padEnd(width)}${description}`),
    '',
  ]);
}
