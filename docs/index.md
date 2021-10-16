<h1 align="center">
  <br>
  <a href="https://app.tandoor.dev"><img src="https://github.com/vabene1111/recipes/raw/develop/docs/logo_color.svg" height="256px" width="256px"></a>
  <br>
  Tandoor Recipes
  <br>
</h1>

<h4 align="center">This is my personal beta of vabene's excellent recipe app.  It includes many of the new features I've developed and should be considered experimental.</h4>
## Experimental Features
- Manual import recipes from URL & Source (HTML/JSON)
- Bookmarklet to import recipes from any website
- Full Text Search
- Hierarchical Keywords

## Coming Next
- Heirarchical Ingredients
- Faceted Search
- Search filter by rating
- What Can I Make Now?
- Better ingredient/unit matching on import
- Custom word replacement on import (e.g. 'grams' automatically imported as 'g')
- improved ingredient parser (items in parens moved to notes)
- quick view ingredients
- quick view associated recipe
- favorite recipes

<h4 align="center">The recipe manager that allows you to manage your ever growing collection of digital recipes.</h4>

<p align="center">

<img src="https://github.com/vabene1111/recipes/workflows/Continous%20Integration/badge.svg?branch=develop" >
<img src="https://img.shields.io/github/stars/vabene1111/recipes" >
<img src="https://img.shields.io/github/forks/vabene1111/recipes" >
<img src="https://img.shields.io/docker/pulls/vabene1111/recipes" >

</p>

<p align="center">
<a href="https://docs.tandoor.dev/install/docker.html" rel="noopener noreferrer">Installation</a> •
<a href="https://docs.tandoor.dev/" target="_blank" rel="noopener noreferrer">Documentation</a> •
<a href="https://app.tandoor.dev/" target="_blank" rel="noopener noreferrer">Demo</a>
</p>

![Preview](preview.png)

!!! info "WIP"
    The documentation is work in progress. New information will be added over time.
    Feel free to open pull requests to enhance the documentation.

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



## Roadmap
This application has been under rapid development over the last year.
During this time I have learnt a lot and added tons of features, I have also moved to some new technologies like Vue.js.
This has led to some great features but has left the Quality unsatisfactory in regard to the details and technical implementation.

So in addition to the new Features and Ideas which can always be found in the [Issues & Milestones](https://github.com/vabene1111/recipes/issues)
there are some greater overall goals for the future (in no particular order)

- Improve the UI! The Design is inconsistent and many pages work but don't look great. This needs to change.
- I strongly believe in Open Data and Systems. Thus adding importers and exporters for all relevant other recipe management systems is something i really want to do.
- Move all Javascript Libraries to a packet manger and clean up some of the mess I made in the early days
- Improve Test coverage and also the individual tests themselves
- Improve the documentation for all features and aspects of this project and add some application integrated help

## About
This application has originally been developed to index, tag and search my collection of digital (PDF) recipes.
Over the time tons of features have been added making this the most comprehensive recipe management system. 

I am just a single developer with many other interests and obligations so development and support might be slow at times, 
but I try my best to constantly improve this application.

If you have any wishes, feature requests, problems or ideas feel free to open an issue on GitHub.
