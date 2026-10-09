---
doc: spec
status: approved
---

# NTC Screenshot Workout Planner — Technical Spec

## How This Works, In Plain Language

The site is a few ordinary web files: HTML lays out the page, CSS gives it the sporty look, and JavaScript makes the upload, editing, and downloads work. When you choose a screenshot, a text-reading tool called Tesseract.js runs in your browser. It reads printed words from the image; our JavaScript then groups the recognized lines into workout names and durations. That grouping may need tuning against the NTC screenshot, so the editable table is where you check names and schedule details before using them.

The browser keeps the current screenshot results and edits in memory only. It makes the text plan and `.ics` calendar file on your computer, without a database, account, or app server. GitHub Pages serves the web files at a public link. This keeps the project small and gives you a direct path from learning HTML to publishing a site.

## The Core Journey Through the System

Implements `prd.md > The Core Journey` and `prd.md > Features and Behavior > Screenshot to scheduled plan`.

1. You open the single page and choose an image file. The page checks that it is a supported image and starts the OCR worker.
2. Tesseract.js downloads its browser worker, OCR engine, and English text data from its configured CDN on first use, then reads the chosen image locally in the browser. A progress callback drives the loading indicator.
3. The app turns the recognized text into candidate workout rows (name and duration) and displays them for review. You can edit names, set dates, choose hours and quarter-hour minutes from the in-page picker, manually type times at any minute, or remove rows. Durations stay as read.
4. The plan output uses today's local date when a row's date is blank. A blank time means an all-day event. For timed rows, the app adds the extracted duration to the start time to calculate the end time.
5. The page updates the paste-ready plan and creates an `.ics` download from the remaining rows. The import guide explains how to add the file in Google Calendar or Apple Calendar.
6. If no workouts can be formed, the page explains this and offers another upload. If all rows are removed, it shows an empty state and hides the download.

```text
Image chosen → Tesseract.js reads text in browser → parser makes workout rows
     → user reviews/edits rows → plan text + .ics made in browser → calendar import
```

## Stack

- **HTML, CSS, and vanilla JavaScript** — learner-agreed foundation; no framework or build step, so the page's parts stay visible while learning how websites work.
- **Tesseract.js** — learner-agreed browser OCR approach. The project documents the browser worker API and plain-script CDN usage. The versioned CDN example in its README uses the v5 UMD build; v7 is listed as the current release. During the first build step, verify the chosen pinned browser build and worker/core/language-data URLs together before building the parser. [Tesseract.js README](https://github.com/naptha/tesseract.js/blob/master/README.md), [API documentation](https://github.com/naptha/tesseract.js/blob/master/docs/api.md), [release notes](https://github.com/naptha/tesseract.js/releases).
- **Browser APIs only for output** — JavaScript `Blob` and an object URL create a local `.ics` download; no calendar API or extra package is needed. [MDN: `URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static).
- **GitHub Pages** — learner-agreed public hosting for static files. No Python server or API keys are required after publishing. [GitHub Pages: creating a site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## Where It Runs and How Someone Tries It

- **During the build:** run a local static server from the project root with `py -m http.server 8000`, then open `http://localhost:8000/` in a modern browser. This avoids browser restrictions that can affect workers when opening an HTML file directly. Python is already familiar to the learner.
- **Published demo:** [Move Week on GitHub Pages](https://moksiuyin217.github.io/move-week/) is served from the public [GitHub repository](https://github.com/moksiuyin217/move-week). GitHub Pages publishes from the `main` branch and `/ (root)` folder. No secrets or API keys are needed.
- **Recording:** open the published page, upload the NTC screenshot, show the recognized rows, correct/schedule at least one workout, then show the generated text and `.ics` download. For the app-only demo, stay in the planner page and do not claim that the calendar file was imported. Keep the public repository available with the short demo video for submission; the live link complements those required items.
- **Network requirement:** the page itself is hosted on GitHub Pages; OCR also needs internet access to load Tesseract.js and its worker/engine/language files from the configured CDN. The selected screenshot remains in the browser.

## Look and Feel

Carry forward `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`: a bright, energetic sports look with a simple original athlete illustration drawn as inline SVG in the page. Use a high-contrast accent palette, bold headings, clear workout cards/table rows, and roomy spacing so upload, progress, and schedule actions are easy to follow. The SVG is part of the HTML, so there is no external image service or separate illustration dependency. Use encouraging, plain labels and visible progress text alongside the loading icon.

## Components

### Single-page shell and upload area

Shows the explanatory header, inline athlete illustration, image picker, and loading/no-results feedback. Accept common screenshot image formats (PNG, JPEG, and WebP). Selecting another image begins a fresh read and replaces the current results.

Implements `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Screenshot to scheduled plan`, and `prd.md > States and Boundaries`.

### OCR and workout-row parser

Starts one Tesseract.js English worker, reports its progress to the page, passes the selected image to `recognize`, and terminates the worker after the read. A small parser uses the recognized text lines to identify workout names and duration values, producing candidate rows. This is tuned against the provided NTC screenshot, not intended as a general-purpose OCR parser. Recognition or parsing results are candidates for the user to review.

Implements `prd.md > Features and Behavior > Screenshot to scheduled plan` and `prd.md > States and Boundaries > No workouts found`.

### Editable workout table

Displays each row's editable workout name, read-only extracted duration, date input, time text field, custom picker toggle, and remove button. The picker offers 00, 15, 30, and 45 minutes across selectable hours; users may type times at any minute. Valid typed or picked times immediately update the output. An empty table becomes the all-rows-removed state.

Implements `prd.md > Screens and Layout` and `prd.md > Features and Behavior > Screenshot to scheduled plan`.

### Text plan and calendar-file generator

Builds the visible paste-ready lines from the remaining rows. Blank date resolves to today's date in the browser's local calendar; blank time is labeled full day. For timed events, add duration minutes to the chosen start. Build a standards-shaped VCALENDAR with one VEVENT per remaining row: date-only all-day events, timed events encoded in UTC after interpreting the chosen date and time in the browser's local timezone, and escaped names. Generate the downloadable file in memory and revoke its temporary object URL when it is no longer needed. Hide the download when there are no rows.

Implements `prd.md > Features and Behavior > Screenshot to scheduled plan` and `prd.md > States and Boundaries > All rows removed`.

### Calendar import guide

Show short import instructions next to the output: in Google Calendar on a computer, open Settings → Import & export, choose the `.ics` file and destination calendar, then import; on Mac, open Calendar and use File → Import to choose the `.ics` file. Link to current official instructions. [Google Calendar import help](https://support.google.com/calendar/answer/37118), [Apple Calendar import help](https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac).

Implements `prd.md > Features and Behavior > Screenshot to scheduled plan`.

## Data Model

One in-memory list of workout records is enough:

```text
Workout {
  id: unique string for the row
  name: editable string
  durationMinutes: number parsed from screenshot (read-only)
  date: date string or blank
  time: time string or blank
}
```

The screenshot file is selected by the user and passed directly to the OCR worker; raw recognized text is temporary parser input. The list changes when a name/date/time is edited or a row is removed. The text plan and `.ics` are derived from that list and are regenerated as it changes. Nothing is saved to local storage or sent to an application server. When the page is refreshed or closed, the screenshot, rows, and edits are gone; the learner agreed a fresh upload is fine.

For `.ics`, an all-day event uses a date and an exclusive next-day end date. A timed event interprets the form values in the browser's local timezone, converts the start and duration-based end to UTC, and writes UTC timestamps. This should display at the selected local time when imported in that same timezone; verify both calendar imports during the build.

## File Structure

```text
project root/
├── index.html             # Single page, semantic sections, inline athlete SVG
├── styles.css             # Sporty responsive layout, table, loading/error/empty states
├── app.js                 # Upload, OCR, parser, row editing, text and ICS generation
├── .nojekyll              # Tell Pages to serve the static project as-is
├── README.md              # How to run locally, publish, and try the demo
└── devpost/
    ├── learner-profile.md # Learner preferences and learning goal
    ├── scope.md           # Approved scope and POC boundary
    ├── prd.md             # Approved product behavior
    ├── prd.html            # PRD visual review
    ├── scope.html          # Scope visual review
    ├── spec.md             # Canonical technical blueprint
    └── spec.html           # Visual review companion to this blueprint
```

## External Services and Dependencies

- **Tesseract.js browser build and OCR assets:** include a pinned Tesseract.js script from jsDelivr; `Tesseract.createWorker('eng', ...)` creates a worker and `worker.recognize(imageFile)` returns text under `data.text`. The worker loads its WebAssembly engine and English trained data from the configured asset locations. No app API key, upload endpoint, or user account. Internet access is needed for those assets. The official docs describe CDN setup and `langPath`, `corePath`, and `workerPath`; confirm the selected version's asset paths and license in the first build step. [CDN/API README](https://github.com/naptha/tesseract.js/blob/master/README.md), [local installation and asset paths](https://github.com/naptha/tesseract.js/blob/master/docs/local-installation.md).
- **GitHub Pages:** hosts the repository's static files. No runtime request from the app to Pages beyond loading the page assets, and no API key. Enable Pages from the root of `main`. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
- **Google Calendar and Apple Calendar:** not connected services. The user imports the downloaded file manually; the guide links to [Google's import instructions](https://support.google.com/calendar/answer/37118) and [Apple's Calendar guide](https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac).

## Important Failure Modes

- **OCR assets fail to load or image reading errors** → stop the loading indicator, explain that reading failed, and offer another upload or retry. The user needs internet access for CDN assets.
- **Text is found but no usable workout name/duration pairs are parsed** → show the PRD's no-workouts-found message and retry action. During build, inspect raw output from the NTC screenshot and tune line pairing; don't fabricate rows.
- **OCR misreads a workout name or duration** → keep names editable and make the extracted duration visible so the learner can spot a bad read. The PRD intentionally does not allow editing duration, so a badly misread duration may require another screenshot; do not silently invent a value.

## What Was Simplified and Why

- **One browser session** instead of accounts, a database, or saved plans — the learner said a fresh upload is fine, and the POC proves screenshot-to-calendar output without persistence.
- **Manual calendar import** instead of calendar account connections — an `.ics` download demonstrates scheduled events without OAuth, secrets, or service setup.
- **Client-side OCR and output generation** instead of an application server — keeps the site static and publishable with GitHub Pages and avoids sending the screenshot to an app backend. The tradeoff is reliance on external OCR asset downloads and OCR quality.
- **A small NTC-oriented parser** instead of generalized extraction — enough to prove the kernel for the supplied screenshot, with a visible review step for corrections.

## Decisions and Open Issues

- **Learner choice — public link:** use GitHub Pages for others to open the app; tradeoff is that the site is public and its OCR assets require internet access.
- **Learner choice — web technologies:** use plain HTML, CSS, and JavaScript to learn how a webpage is built and published; tradeoff is that interactive behavior is written directly without a framework.
- **Learner choice — browser OCR:** use Tesseract.js to avoid a separate server; OCR may confuse text or line grouping, so the extracted data needs review.
- **Learner choice — temporary plan:** keep uploaded image and rows in the open page only; no restore after closing or refreshing.
- **Learner choice — design:** energetic, bright sports styling with a simple inline SVG athlete illustration.
- **Uncertainty to investigate — OCR row pairing:** the recognized words may not map cleanly to NTC workout names and durations. In the first build step, inspect the OCR output for the actual screenshot, adjust the small parser, and confirm that the editable rows correspond to the image before implementing schedule output.
- **Implementation detail to verify early:** the Tesseract.js docs' directly demonstrated script-tag CDN is v5 while v7 is the current release. Pin the browser build used and verify the worker, WebAssembly core, English data paths, and current-browser loading before investing in parsing. No blocking product question remains from `prd.md > Open Questions`.
