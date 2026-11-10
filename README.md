# Film Roulette · TMDB Edition

Static PWA + Netlify Function. No TMDB credentials in frontend.

## Deploy without a terminal (iPhone)

1. Extract the ZIP in iPhone Files.
2. Create a **private** GitHub repository, e.g. `film-roulette-tmdb`.
3. Upload `index.html`, `manifest.webmanifest`, `netlify.toml`, `README.md` to the repository root via GitHub's web interface. Create a new file with the exact path `netlify/functions/movies.mjs` and paste its content (or use GitHub's browser editor to upload the nested file).
4. In Netlify, open the existing **film-roulette-de** project and find **Build & deploy → Continuous deployment → Link repository**. Connect the GitHub repository. If the existing project doesn't offer linking, import the repo as a **new Netlify project** instead; don't delete the old site.
5. Build command: **leave empty**. Publish directory: `.`. Functions directory: `netlify/functions` (also set in netlify.toml).
6. Verify the `TMDB_READ_TOKEN` secret is set on **the project being deployed**, with scope Functions and the Production context. If using a new project, recreate the secret there.
7. Deploy and test `https://YOUR-SITE.netlify.app/.netlify/functions/movies?action=status`. Expect `{"ok":true}`. Then open the site and check the TMDB connected indicator.

## Notes

- Ratings shown are **TMDB**, not IMDb. IMDb rating/vote count requires a separate licensed source.
- The mood filter is a rough genre approximation; the UI should not be interpreted as semantic mood tagging.
- Watched list uses localStorage and TMDB numeric IDs; older title-based watched lists are not migrated automatically.
- TMDB API terms and attribution apply; add the required TMDB attribution before public release.
- Netlify manual drag-and-drop of a static ZIP is **not sufficient** to build Functions.
