Creating a Ubuntu VM
- https://www.youtube.com/watch?v=8oMAEBUOPQ0

Initial Server Setup with Ubuntu 20.04
https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04

How To Set Up Django with Postgres, Nginx, and Gunicorn on Ubuntu 20.04
https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-20-04

**Installing the Packages from the Ubuntu Repositories**

To begin the process, we’ll download and install all of the items we need from the Ubuntu repositories. We will use the Python package manager pip to install additional components a bit later.

We need to update the local apt package index and then download and install the packages. The packages we install depend on which version of Python your project will use.

sudo apt update
sudo apt install python3-pip python3-dev libpq-dev postgresql postgresql-contrib nginx curl


sudo -u postgres psql




iocage setup
New Jail
DCHP

 create a dataset in the FreeNAS WebUI where you'll store the app
mkdir /mnt/myVol/apps/recipes/postgresql/

mount dataset 
iocage fstab -a postgresql /mnt/Data/apps/postgresql /mnt/postgres/data nullfs rw 0 0

The first thing you need to do is to update and upgrade packages:
pkg update
pkg upgrade

*Install Packages*
pkg install sudo
pkg install git
pkg install python38

*Install Pip*
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3.8 get-pip.py

*Upgrading PIP*
python -m pip install -U pip

*Install PostgreSQL*
pkg install postgresql12-server

#autostart service with jail
sysrc postgresql_enable=YES

sudo pip install -r requirements.txt

pip install cryptography-2.8-cp38-cp38-win_amd64 (1)


Get the last version from the repository:
git clone https://github.com/vabene1111/recipes.git -b master


<h1 align="center">
  <br>
  <a href="https://app.tandoor.dev"><img src="https://github.com/vabene1111/recipes/raw/develop/docs/logo_color.svg" height="256px" width="256px"></a>
  <br>
  Tandoor Recipes
  <br>
</h1>

<h4 align="center">The recipe manager that allows you to manage your ever growing collection of digital recipes.</h4>

<p align="center">

<img src="https://github.com/vabene1111/recipes/workflows/Continous%20Integration/badge.svg?branch=develop" >
<img src="https://img.shields.io/github/stars/vabene1111/recipes" >
<img src="https://img.shields.io/github/forks/vabene1111/recipes" >
<img src="https://img.shields.io/docker/pulls/vabene1111/recipes" >

</p>

<p align="center">
<a href="https://docs.tandoor.dev/install/docker/" target="_blank" rel="noopener noreferrer">Installation</a> •
<a href="https://docs.tandoor.dev/" target="_blank" rel="noopener noreferrer">Documentation</a> •
<a href="https://app.tandoor.dev/" target="_blank" rel="noopener noreferrer">Demo</a>
</p>

![Preview](docs/preview.png)

## Features

- 📦 **Sync** files with Dropbox and Nextcloud (more can easily be added)
- 🔍 Powerful **search** with Djangos [TrigramSimilarity](https://docs.djangoproject.com/en/3.0/ref/contrib/postgres/search/#trigram-similarity)
- 🏷️ Create and search for **tags**, assign them in batch to all files matching certain filters
- 📄 **Create recipes** locally within a nice, standardized web interface
- ⬇️ **Import recipes** from thousands of websites supporting [ld+json or microdata](https://schema.org/Recipe)
- 📱 Optimized for use on **mobile** devices like phones and tablets
- 🛒 Generate **shopping** lists from recipes
- 📆 Create a **Plan** on what to eat when
- 👪 **Share** recipes with friends and comment on them to suggest or remember changes you made
- ➗ automatically convert decimal units to **fractions** for those who like this
- 🐳 Easy setup with **Docker** and included examples for Kubernetes, Unraid and Synology
- 🎨 Customize your interface with **themes**
- ✉️ Export and import recipes from other users
- 🌍 localized in many languages thanks to the awesome community
- ➕ Many more like recipe scaling, image compression, cookbooks, printing views, ...

This application is meant for people with a collection of recipes they want to share with family and friends or simply
store them in a nicely organized way. A basic permission system exists but this application is not meant to be run as 
a public page.
Documentation can be found [here](https://docs.tandoor.dev/).

While this application has been around for a while and is actively used by many (including myself), it is still considered
**beta** software that has a lot of rough edges and unpolished parts.
## License

Beginning with version 0.10.0 the code in this repository is licensed under the [GNU AGPL v3](https://www.gnu.org/licenses/agpl-3.0.de.html) license with an
[common clause](https://commonsclause.com/) selling exception. See [LICENSE.md](https://github.com/vabene1111/recipes/blob/develop/LICENSE.md) for details.

> NOTE: There appears to be a whole range of legal issues with licensing anything else then the standard completely open licenses.
> I am in the process of getting some professional legal advice to sort out these issues. 
> Please also see [Issue 238](https://github.com/vabene1111/recipes/issues/238) for some discussion and **reasoning** regarding the topic.

**Reasoning**  
**This software and *all* its features are and will always be free for everyone to use and enjoy.**

The reason for the selling exception is that a significant amount of time was spend over multiple years to develop this software.
A payed hosted version which will be identical in features and code base to the software offered in this repository will
likely be released in the future (including all features needed to sell a hosted version as they might also be useful for personal use).
This will not only benefit me personally but also everyone who self-hosts this software as any profits made trough selling the hosted option
allow me to spend more time developing and improving the software for everyone. Selling exceptions are [approved by Richard Stallman](http://www.gnu.org/philosophy/selling-exceptions.en.html) and the
common clause license is very permissive (see the [FAQ](https://commonsclause.com/)).
