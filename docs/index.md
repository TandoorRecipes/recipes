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