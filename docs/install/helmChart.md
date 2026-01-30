!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested.

## Helm Install Setup

Assumptions:

1. You have a running postgres database you can access.
2. The initial version of this chart does not include a LB. It assume you will point to the service that will be create by using either an Ingress manifest or a httproute.

Example config values.yaml. Please see helm-chart repo for the last [version](https://github.com/csg33k/helm-charts/blob/main/charts/tandoor/values.yaml).

Basic minimal example:

**values.yaml**
```yaml
## these are not needed but I'm setting them so they're consistent with my env. The routes I give assume these settings.
namespaceOverride: food
fullnameOverride: "recipes"


Change to latest version if out of date.
#global:
#  create_namespace: false
#  image: vabene1111/recipes
#  tandoor_version: 2.3

# Environment variables
env: 
## Values below will get you to a basic working installation
  - name: DB_ENGINE
    value: django.db.backends.postgresql
  - name: POSTGRES_HOST
    value: shared-rw.postgres-operator.svc.cluster.local
  - name: POSTGRES_PORT
    value: "5432"
  - name: POSTGRES_DB
    value: fooddb
  - name: SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: recipes-secrets
        key: secret-key
  - name: POSTGRES_USER
    valueFrom:
      secretKeyRef:
        name: recipes-secrets
        key: username
  - name: POSTGRES_PASSWORD
    valueFrom:
      secretKeyRef:
        name: recipes-secrets
        key: password
## I skipped email support but feel free to add it as well. 

# Persistent Volume Claims, is not strictly required but it's highly recommended
# to create a few volumes to persist your data. Otherwise those files would reboot
# on each pod restart.
persistence:
  enabled: true
  volumes:
    - name: staticfiles
      mountPath: /opt/recipes/staticfiles
      size: 1Gi
    - name: mediafiles
      mountPath: /opt/recipes/mediafiles
      size: 1Gi

## In Production, use a different way of getting the secrets in. unless this code never leaves your server.
## In a "Prod" like homelab you should use ESO or Sealed Secrets, etc populate these values.
extraResources:
  - apiVersion: v1
    kind: Secret
    metadata:
      name: recipes-secrets
      namespace: food
    type: Opaque
    stringData:
      password: superSecretDBPass
      secret-key: ## output of openssl rand -base64 32 | tr -d '/+=' | head -c 32 
      username: db_username
```

Install the chart:

```sh
helm install recipe-manager -n food oci://ghcr.io/csg33k/helm-charts/tandoor --version 0.0.1 -f myvalues.yaml 
```

Once that is complete all you need is to setup your Ingress / httproute. Everyone does this differently but if you have an Gateway already setup setting up a route is as easy as:

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: food-https
  namespace: food
spec:
  parentRefs:
    - name: http-gateway ## Change this
      namespace: default  ## Change this
      sectionName: https
  hostnames:
    - food.domain.tld ## Change this
  rules:
    - backendRefs:
        - name: recipes ## If the name is different for your env, update it accordingly.
          port: 80
```

That's it! Happy cooking!
~~~
