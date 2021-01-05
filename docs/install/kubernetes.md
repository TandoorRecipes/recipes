!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested.


# Kubernetes

This is a basic kubernetes setup. 
Please note that this does not necessarily follow Kubernetes best practices and should only used as a 
basis to build your own setup from!

All files con be found here in the Github Repo: 
[docs/install/k8s](https://github.com/vabene1111/recipes/tree/develop/docs/install/k8s)

## Important notes

State (database, static files and media files) is handled via `PersistentVolumes`.

Note that you will most likely have to change the `PersistentVolumes` in `30-pv.yaml`. The current setup is only usable for a single-node cluster because it uses local storage on the kubernetes worker nodes under `/data/recipes/`. It should just serve as an example.

Currently, the deployment in `50-deployment.yaml` just pulls the `latest` tag of all containers. In a production setup, you should set this to a fixed version!

See env variables tagged with `CHANGEME` in `50-deployment.yaml` and make sure to change those! A better setup would use kubernetes secrets but this is not implemented yet.

## Updates

These manifests are not tested against new versions.

## Apply the manifets

To apply the manifest with `kubectl`, use the following command:

```
kubectl apply -f ./docs/k8s/
```
