# reviewer

A simple, mobile-friendly STS quiz with 335 questions: 284 identification and 51 enumeration. Based on the supplied PDFs.

## Use
Open `index.html` in a browser, or run `python3 -m http.server 8080` and visit http://localhost:8080.

- Identification and enumeration questions, with topic and session-length filters.
- Shuffled questions, per-answer feedback, partial credit, and missed-question retry.
- Searchable extracted notes and an embedded PDF viewer (uses the browser’s PDF support).
- Correct and incorrect answer sounds with spoken encouragement for Pauleen, and a saved Sound on/off preference. Speech uses available browser voices. Skipped questions stay silent.
- Session history stored in this browser's localStorage. No account or backend.

Answer checking ignores punctuation, spacing, accents and capitalization, and accepts explicitly listed aliases. Enumeration accepts any order and counts duplicate answers once. Other wording and typos may need comparison against the displayed key. Question coverage is curated, not every fact in every PDF. The original notes may contain inaccuracies; this app is a study aid based on those notes, not independently fact-checked material.

## Deploy to Netlify
Unzip `recall-site.zip` and upload its contents using Netlify's manual deploy, or connect a GitHub repository containing these files. No build command is needed; publish directory is `.` (configured in netlify.toml).

## Deploy to GitHub Pages
Push the folder contents to a repository. In repository Settings → Pages, select deployment from a branch, then choose your branch and `/ (root)`. All asset paths are relative, so repository project URLs work too. Include the four smaller original PDF files and the complete `assets/` directory. The oversized original `STS Presentation.pdf` is ignored by Git; the website uses its optimized copy in `assets/STS Presentation.pdf`.

Publishing makes the included notes and PDFs accessible to site visitors.

## Edit the question bank
Edit `questions.js`. `I(topic, prompt, answerOrAliases, source)` adds an identification item. `E(topic, prompt, answers, source)` adds enumeration. Each answer can be a string or an array of accepted aliases. Sources: `0` = REVIEWER STS, `1` = STS NEW LESSON REVIEWR, `2` = STS Presentation, `3` = STS REVIEWER NI BUSSENG.

No dependencies or build step. Google Fonts is optional; system fonts work without it.
# reviewer
