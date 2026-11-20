/**
 * Public architecture references for the ARM64 platform lab.
 *
 * Design snapshot checked against public architecture notes (2026-11-18).
 * This is not live telemetry.
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
    summary: 'Protected GitHub main holds the application source and Flux manifests.',
    sourceLabel: 'Source repository',
    sourceUrl: repository,
  },
  build: {
    title: 'GitHub ARM64 CI',
    summary: 'Builds and tests platform-hello, scans it with Trivy, and verifies artifacts before publication.',
    sourceLabel: 'Engineering evidence',
    sourceUrl: evidence,
  },
  ghcr: {
    title: 'GHCR',
    summary: 'Supplies the digest-pinned application image used by Kubernetes.',
    sourceLabel: 'Delivery architecture',
    sourceUrl: architecture,
  },
  cluster: {
    title: 'Pi Kubernetes',
    summary: 'Three-node kubeadm cluster: one control plane, two workers, GHCR image pulls.',
    sourceLabel: 'Cluster architecture',
    sourceUrl: architecture,
  },
  flux: {
    title: 'Flux',
    summary: 'Reads GitHub manifests and reconciles through a namespace-scoped ServiceAccount.',
    sourceLabel: 'GitOps architecture',
    sourceUrl: architecture,
  },
  forgejo: {
    title: 'Forgejo mirror',
    summary: 'One-way mirror on the management node, outside the Kubernetes cluster.',
    sourceLabel: 'Source and recovery',
    sourceUrl: architecture,
  },
  runner: {
    title: 'Forgejo runner',
    summary: 'Repository-scoped CI without deployment credentials or Kubernetes authority.',
    sourceLabel: 'Validation boundaries',
    sourceUrl: architecture,
  },
  skopeo: {
    title: 'Skopeo copy',
    summary: 'Copies existing GHCR image content to Forgejo without changing the digest.',
    sourceLabel: 'OCI delivery',
    sourceUrl: architecture,
  },
  registry: {
    title: 'Forgejo OCI',
    summary: 'A second OCI copy; the Kubernetes workload still pulls from GHCR.',
    sourceLabel: 'OCI distribution',
    sourceUrl: architecture,
  },
} as const satisfies Record<string, ArchitectureNode>;

export type ArchitectureNodeId = keyof typeof architectureNodes;

export type ArchitecturePath = {
  id: string;
  title: string;
  description: string;
  gate: string;
  evidence: string;
  boundary: string;
  nodes: readonly ArchitectureNodeId[];
};

export const architecturePaths: ArchitecturePath[] = [
  {
    id: 'image',
    title: 'Application image',
    description: 'GitHub CI builds, tests, and scans the ARM64 image. Kubernetes references its published GHCR digest.'
    gate: 'BUILD / TEST / SCAN',
    evidence: 'Image archive, checksum, image ID, and full registry retrieval were checked.',
    boundary: 'CI publishes the image; Flux owns workload changes.',
    nodes: ['source', 'build', 'ghcr', 'cluster'],
  },
  {
    id: 'gitops',
    title: 'Desired state',
    description: 'Flux reads the application manifests from GitHub and reconciles the cluster.'
    gate: 'RECONCILE / TEST DRIFT',
    evidence: 'Reconciliation, rollback, and drift correction have recorded tests.',
    boundary: 'Forgejo is not the Flux source of truth.',
    nodes: ['source', 'flux', 'cluster'],
  },
  {
    id: 'validation',
    title: 'Independent validation',
    description: 'Forgejo mirrors GitHub and runs a separate repository-scoped CI runner.'
    gate: 'MIRROR / VALIDATE',
    evidence: 'Manual runs and mirrored-push validation passed after migration.',
    boundary: 'The runner has no Kubernetes authority or production Docker socket.',
    nodes: ['source', 'forgejo', 'runner'],
  },
  {
    id: 'distribution',
    title: 'OCI distribution copy',
    description: 'Skopeo copies the built image from GHCR into the Forgejo OCI registry.'
    gate: 'COPY / VERIFY DIGEST',
    evidence: 'Digest parity and full OCI retrieval were verified after migration.',
    boundary: 'The Kubernetes workload continues to pull from GHCR.',
    nodes: ['ghcr', 'skopeo', 'registry'],
  },
];

export function architectureConsoleLines(): string[] {
  return architecturePaths.flatMap((path) => [
    `[${path.gate}] ${path.title}`,
    `  ${path.nodes.map((id) => architectureNodes[id].title).join(' -> ')}`,
    `  evidence: ${path.evidence}`,
    `  boundary: ${path.boundary}`,
    '',
  ]);
}

export const architectureSourceUrl = architecture;
