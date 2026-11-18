# Portfolio — Alexandre Le Port

Interactive CV / portfolio. Static site with no build step: `index.html` + `style.css` + `script.js`, with all content in `data.js` (`window.PORTFOLIO`).
Libraries are loaded from CDNs (GSAP 3.12.5, Lenis 1.1.13, Three.js r128).

**Live:** https://alexlp05.github.io/portfolio/

## Run locally

Any static server works, for example:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or with Docker (nginx):

```bash
docker build -t portfolio . && docker run -p 8080:80 portfolio
```

## Editing content

Change the texts, projects, and links in `data.js`, not in the HTML. Add `?audit` to the URL to show the remaining to-do lists.

## Deployment

GitHub Pages serves the root of the `main` branch. Every push to `main` redeploys the site.
