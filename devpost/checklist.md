---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Upload a workout screenshot and review the extracted workouts**
  Becomes usable: A local website that reads the supplied NTC screenshot in the browser and shows candidate workout names and durations in an editable, removable table.
  Why now: This delivers the unique kernel first and investigates the spec's largest uncertainty—whether the pinned Tesseract.js assets work and the screenshot's OCR text can be paired into useful rows—before scheduling is built on top.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Features and Behavior > Screenshot to scheduled plan`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Components > Single-page shell and upload area`, `spec.md > Components > OCR and workout-row parser`, `spec.md > Components > Editable workout table`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`, `spec.md > File Structure`
  Build: Create the static HTML/CSS/JavaScript app and local run instructions as part of the first usable behavior. Pin Tesseract.js and verify its browser script, worker, core, and English data load together; inspect actual OCR output for the supplied screenshot; tune a small parser to show candidate name/duration rows; add progress, upload failure, no-results retry, row editing/removal, and the sporty page shell.
  Verify (mechanical): Run `py -m http.server 8000`; use a browser to load the supplied NTC screenshot; confirm OCR reaches completion and the parsed names/durations match the screenshot, then edit and remove a row. Check a non-workout image yields a retryable no-results state.
  Learner check: Open the local page, upload the NTC screenshot, and see whether the listed workout names and durations match what you expected; edit or remove one row and tell me what feels unclear.
  Commit: `Add screenshot upload and workout review`

- [x] **2. Schedule workouts and generate a plan and calendar file**
  Becomes usable: Reviewed workouts can be scheduled and turned into paste-ready text and a downloadable `.ics` file, including all-day entries and duration-based end times.
  Why now: Once OCR rows are useful and reviewable, this completes the core journey while keeping scheduling and calendar formatting grounded in confirmed row data.
  PRD ref: `prd.md > The Core Journey` (steps 3–5), `prd.md > Features and Behavior > Screenshot to scheduled plan`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Core Journey Through the System`, `spec.md > Components > Editable workout table`, `spec.md > Components > Text plan and calendar-file generator`, `spec.md > Data Model`
  Build: Add date fields and a compact in-page time picker with 15-minute minute options while accepting manually typed values at any minute, today's-date default, blank-time full-day behavior, live text output, correctly calculated timed ends, escaped calendar events, all-day calendar events, and hiding the download when no rows remain.
  Verify (mechanical): In the browser, open the custom time picker and confirm its minute choices are 00, 15, 30, and 45; set a workout date and picked time and confirm the plan updates; manually enter a time at another minute and confirm it also updates; check the downloaded `.ics` uses the chosen local start and duration-based end; clear the time and confirm an all-day event; clear the date and confirm today's local date; remove all rows and confirm the download is hidden.
  Learner check: User confirmed the custom start-time picker matches the intended menu: quarter-hour minute options with manually typed minutes still accepted.
  Commit: `Generate scheduled text and calendar file`

- [x] **3. Finish the import guide and make the whole page ready to share**
  Becomes usable: The complete single-page journey explains how to import the calendar file and how to run and publish the static site.
  Why now: With extraction and scheduling already working, this completes the remaining product behavior and makes the proof of concept straightforward to try and publish.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Screenshot to scheduled plan`, `prd.md > Acceptance criteria`
  Spec ref: `spec.md > Components > Calendar import guide`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > What Was Simplified and Why`
  Build: Add concise Google Calendar and Apple Calendar import steps with official links, finish responsive visual details and empty/error states, and complete the README with local run, GitHub Pages publishing, and demo instructions.
  Verify (mechanical): Run the site locally; inspect the full page at desktop and 390px widths; confirm the narrow layout has no horizontal overflow; verify both official import links and the README's local command, branch-aware Pages steps, and demo walkthrough.
  Learner check: User said the desktop page looked good, requested and received a 390px mobile interaction check before commit, then reviewed the full flow and confirmed “all good.”
  Commit: `Complete import guide and sharing instructions`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1; learner confirmed “all working” after checking the extracted rows and edit/remove behavior.
- [x] Final kick-the-tires exploration and feedback completed — after slice 3; learner reviewed the full flow and confirmed “all good.”

## Final Review

- [x] Final review complete — no revisions requested; learner confirmed ready with “all good.”

## Code Tour and App Map

- [x] Learning activity complete — brief guided code recap connected the user's browser checks to the code route and publishing model
- [x] Optional edit and transfer reflection addressed — no separate code edit made; optional reflection offered
- [x] `devpost/app-map.html` generated from finished code, checked at desktop and mobile widths, and shown, including a project-grounded practice to reuse

Activity and evidence: Brief guided recap connected the user's NTC upload and mobile scheduling checks to the rendered plan. `devpost/app-map.html` was served locally, visually checked, and verified at 390px with no scripts or external assets.
Route and stops: `README.md` local server command → `index.html` stylesheet/script includes and `#image-input` → `app.js` change handler, `readImage`, `parseWorkouts`, `renderWorkouts`, `renderPlan`, and `createCalendarFile` → `styles.css` mobile breakpoint.
Edit outcome: No separate code edit requested during the wrap-up; the time-picker refinement was kept and verified at desktop and 390px widths.
Reflection: Optional transfer question offered; any personal answer belongs only in the ignored learner profile.
Activity mode: Brief guided recap connected to prior live browser practice; app map shown.

## Revisions

- Replaced the native time picker after confirming its minute menu did not honor the requested interval; the custom menu shows 15-minute minute choices and still accepts typed minutes at any value.
