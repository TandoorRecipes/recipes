!!! info "Community Contributed"
    This guide was contributed by the community and is neither officially supported, nor updated or tested.

[KubeSail](https://kubesail.com/) lets you install Tandoor by providing a simple web interface for installing and managing apps. You can connect any server running Kubernetes, or get a pre-configured [PiBox](https://pibox.io).

<!-- A portion of every PiBox sale goes toward supporting Tandoor development. -->

The KubeSail template is closely based on the [Kubernetes installation]([docs/install/k8s](https://github.com/vabene1111/recipes/tree/develop/docs/install/k8s)) configs

## Quick Start

Load the [Tandoor Recipes](https://kubesail.com/template/PastuDan/Tandoor%20Recipes) template, and click **Launch Template**.

If you have not yet attached your server to KubeSail, see the [Getting a Cluster](https://docs.kubesail.com/guides/bare-metal/) section on the KubeSail docs.

## Important notes

In the "Template Variables" section you will see two input fields. These should show `RANDOM(16)`, indicating they will be randomly generated and specific to your install when you launch the template. If you prefer to set these yourself, you can type them in before launching the template.

![image](https://user-images.githubusercontent.com/1296162/140431276-b823ba1c-175c-436a-9ed9-35bc62f8744e.png)

