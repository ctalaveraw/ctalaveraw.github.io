/**
 * Public architecture references for the ARM64 platform lab.
 *
 * This is a dated description of the documented design, not live telemetry.
 * Source of truth: arm-homelab-platform/docs/architecture/overview.md.
 */
const repository = 'https://github.com/ctalaveraw/arm-homelab-platform';
const architecture = `${repository}/blob/main/docs/architecture/overview.md`;
const evidence = `${repository}/blob/main/docs/interview/engineering-evidence.md`;

export type ArchitectureNode = {
  title: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const architectureNodes = {
  source: {
    title: 'GitHub main',
    summary: 'Canonical source and desired state; pull requests protect main.',
    sourceLabel: 'Source repository',
    sourceUrl: repository,
  },
  build: {
    title: 'GitHub ARM64 CI',
    summary: 'Builds and tests platform-hello, scans with Trivy, and publishes verified artifacts.',
    sourceLabel: 'Engineering evidence',
    sourceUrl: evidence,
  },
  ghcr: {
    title: 'GHCR',
    summary: 'Holds the application image that Kubernetes references by digest.',
    sourceLabel: 'Delivery architecture',
    sourceUrl: architecture,
  },
  cluster: {
    title: 'Pi Kubernetes',
    summary: 'kubeadm cluster with one control plane and two workers; pulls the GHCR image.',
    sourceLabel: 'Cluster architecture',
    sourceUrl: architecture,
  },
  flux: {
    title: 'Flux',
    summary: 'Reads desired state from GitHub and reconciles through a scoped ServiceAccount.',
    sourceLabel: 'GitOps architecture',
    sourceUrl: architecture,
  },
  forgejo: {
    title: 'Forgejo mirror',
    summary: 'One-way pull mirror of GitHub main, hosted on the independent management node.',
    sourceLabel: 'Source and recovery',
    sourceUrl: architecture,
  },
  runner: {
    title: 'Forgejo runner',
    summary: 'Independent repository validation, without production deployment credentials.',
    sourceLabel: 'Validation boundaries',
    sourceUrl: architecture,
  },
  skopeo: {
    title: 'Skopeo copy',
    summary: 'Copies existing OCI content to Forgejo with digest preservation.',
    sourceLabel: 'OCI delivery',
    sourceUrl: architecture,
  },
  registry: {
    title: 'Forgejo OCI',
    summary: 'A linked registry copy; Kubernetes continues to use GHCR for this application.',
    sourceLabel: 'OCI distribution',
    sourceUrl: architecture,
  },
} as const satisfies Record<string, ArchitectureNode>;

export type ArchitectureNodeId = keyof typeof architectureNodes;

export type ArchitecturePath = {
  id: string;
  title: string;
  description: string;
  nodes: readonly ArchitectureNodeId[];
};

export const architecturePaths: ArchitecturePath[] = [
  {
    id: 'image',
    title: 'Application image',
    description:
      'GitHub CI builds, tests and scans the ARM64 image. Kubernetes pulls the published GHCR digest; Flux separately controls the desired workload state.',
    nodes: ['source', 'build', 'ghcr', 'cluster'],
  },
  {
    id: 'gitops',
    title: 'Desired state',
    description:
      'Flux reconciles the Kubernetes application from GitHub. It does not use Forgejo as the source for routine application reconciliation.',
    nodes: ['source', 'flux', 'cluster'],
  },
  {
    id: 'validation',
    title: 'Independent validation',
    description:
      'Forgejo mirrors GitHub one way and runs its own repository-scoped validation without deployment authority.',
    nodes: ['source', 'forgejo', 'runner'],
  },
  {
    id: 'distribution',
    title: 'OCI distribution copy',
    description:
      'Skopeo copies image content from GHCR to Forgejo while preserving the digest. This is a separate distribution path, not a Flux deployment step.',
    nodes: ['ghcr', 'skopeo', 'registry'],
  },
];

export function architectureConsoleLines(): string[] {
  return architecturePaths.flatMap((path) => [
    path.title,
    `  ${path.nodes.map((id) => architectureNodes[id].title).join(' -> ')}`,
    `  ${path.description}`,
    '',
  ]);
}

export const architectureSourceUrl = architecture;
