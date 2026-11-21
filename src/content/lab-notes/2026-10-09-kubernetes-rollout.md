---
title: 'Failed Kubernetes rollout with the original replica serving traffic'
summary: 'A nonexistent OCI digest caused an image-pull failure. The original replica stayed Ready while the scoped deployer rolled back to the known-good image.'
date: '2026-10-09'
status: verified
order: 1
areas:
  - Kubernetes
  - OCI images
  - Incident testing
  - Rollback
evidence:
  - label: Incident record and captured observations
    url: https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/incidents/2026-10-09-platform-hello-failed-rollout.md
  - label: Sprint acceptance and test scope
    url: https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/sprints/11-deployment-failure-rollback.md
  - label: Recovery runbook
    url: https://github.com/ctalaveraw/arm-homelab-platform/blob/main/docs/runbooks/kubernetes-deployment-rollback.md
---

### The test

I wanted to know what happened to a one-replica service when its replacement could not pull an image. The `platform-hello` Deployment started at **1/1 Ready**, with its working container referenced by a registry digest.

Using the namespace-scoped `platform-deployer` identity, I changed the live Deployment to a syntactically valid digest that did not exist in the registry. The Git manifest stayed unchanged. Kubernetes created a new ReplicaSet, but the replacement Pod entered `ErrImagePull` and then `ImagePullBackOff`; the registry response was `NotFound`.

### What I measured

The default `RollingUpdate` settings allowed a surge Pod and kept the previous Ready replica in service. During the failed rollout:

- The original ReplicaSet had **one Ready replica**; the replacement had **zero**.
- The EndpointSlice listed the replacement with `ready=false` and `serving=false`.
- **10 of 10** HTTP requests through the ClusterIP Service returned **200**.

The rollout timed out, but those requests showed no service interruption in the sampled interval. The result does not establish continuous availability outside the test.

### Recovery

The deployer used `kubectl rollout undo deployment/platform-hello --to-revision=1`. Kubernetes restored the known-good Pod template and scaled the failed ReplicaSet to zero. Another **10 of 10** Service requests returned HTTP 200. The deployed image digest matched the unchanged repository manifest afterward.

Rollback created a new Deployment revision in rollout history. The earlier revision number was not the release identity; the OCI digest identified the artifact.

### Limits

This was a controlled manual rollout exercise, completed before the later Flux reconciliation work. It did not test an infrastructure outage or an automated alerting response. Those require separate experiments.
