---
doc: prd
status: approved
---

# NTC Screenshot Workout Planner — Product Requirements

One line: A small website for turning an NTC workout screenshot into an editable scheduled text plan and a downloadable calendar file for the learner.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey

1. The user opens the planner and sees a brief header explaining its purpose, followed by a space to upload an NTC workout screenshot. (`scope.md > The Core Loop`)
2. After upload, the page shows a loading icon while it reads the screenshot. The wait is expected to be brief. (`scope.md > The Core Loop`)
3. The page displays the extracted workouts in a table. The user can edit workout names, add a date and time for each workout, or remove a row they do not want. Extracted durations are used as read. (`scope.md > The Core Loop`)
4. A missing date means today's date. A missing time means the workout is a full-day calendar event. (`scope.md > The Core Loop`)
5. The page shows the scheduled text plan directly on screen and offers a link to download an `.ics` calendar file. Timed event end times are calculated from the extracted duration. The page also includes a short guide to importing the file into Google Calendar or Apple Calendar. (`scope.md > The POC Boundary`)

## Screens and Layout

One page, with sections in this order:

- A short explanatory header.
- Screenshot upload area.
- A loading indicator while the screenshot is read.
- An editable workout table with workout name, extracted duration, date, time, and a remove action for each row.
- The generated text plan and `.ics` download link.
- A short calendar import guide.

The results, plan, and download are presented on the same page after upload; no separate screen is needed. (`scope.md > The Core Loop`)

## Look and Feel

The page should feel energetic and sporty. Use an illustration showing someone doing sport. No specific colors, type style, or illustration style has been chosen yet.

## Features and Behavior

### Screenshot to scheduled plan

- Accept a workout screenshot and show a loading icon while reading it.
- If workouts are found, show their names and extracted durations in a table.
- Let the user edit each workout name, enter a date, and open a compact in-page time picker with hour choices and 15-minute minute choices; manually typed times at any minute are accepted. The user can also remove a row.
- Use today's date when a date is blank. Treat a blank time as a full-day event.
- Use the extracted duration to calculate the end time for timed calendar events.
- Show a text plan on the page containing each remaining workout's date, start time or full-day designation, and name.
- Offer a downloadable `.ics` file for the remaining workouts.
- Provide concise import steps for Google Calendar and Apple Calendar.

Acceptance criteria:

- [ ] Uploading a readable screenshot results in a visible table of extracted workout names and durations after a loading indicator.
- [ ] A user can change a name, enter a date, choose hours and 15-minute minute increments in the in-page time picker or manually enter a time at any minute, and remove an individual row.
- [ ] A row with no date uses today's date; a row with no time is represented as a full-day event.
- [ ] Timed calendar events end at their start time plus the extracted workout duration.
- [ ] The page displays a text plan and provides an `.ics` download link.
- [ ] The import guide includes steps for both Google Calendar and Apple Calendar.

## States and Boundaries

- **Before upload** — show the explanatory header and screenshot upload area.
- **Reading screenshot** — show a loading icon; the expected wait is brief.
- **Workouts found** — show the editable table and the scheduled plan and download output.
- **No workouts found** — show an error explaining that no workout was found. Offer a clear way to try another screenshot.
- **All rows removed** — show an empty result state and do not offer an empty calendar download.

## Product Decisions

- The page is a simple single-page experience with a header and screenshot upload area.
- Extracted workout names are editable; extracted durations are accepted as-is.
- Users schedule workouts by entering dates and start times in the table. The in-page picker offers hour choices and minute choices of 00, 15, 30, and 45; manually typed times at any minute are accepted. A missing date defaults to today; a missing time makes the entry full-day.
- Each row has a remove button so an individual workout can be excluded.
- Show the text plan directly on the page and offer an `.ics` download link.
- The visual direction is energetic and sporty, with an illustration of someone exercising.

## What We're Building

- A single-page website that accepts an NTC workout screenshot, shows extraction progress, and presents extracted workouts for review.
- Editable workout names, per-workout date and time fields, and a remove action.
- Date and full-day defaults, plus duration-based end times for timed events.
- An on-page text plan, downloadable `.ics` calendar file, and short Google Calendar and Apple Calendar import guide.
- A no-workouts-found error state.

## Deferred From the POC

- Direct Google or Apple calendar connections, which are not needed when users can import a calendar file.
- Direct Notion or Nike account integration, which is outside the screenshot-to-plan proof of concept.
- Automatic workout scheduling, NRC run logging, and weekly distance tracking, which expand beyond the chosen NTC planning slice.

## Possible Later Enhancements

Direct calendar connections, Notion insertion, automatic scheduling rules, and NRC run details can be considered later, as listed in `scope.md > Later`.

## Non-Goals

- Editing extracted durations; the user is comfortable using the extracted duration as-is.
- Scheduling NRC runs or tracking weekly distance; the POC focuses on planned NTC workouts. (`scope.md > Explicitly Cut`)
- Workout difficulty in the generated plan; it is not needed to demonstrate the core idea. (`scope.md > Explicitly Cut`)

## Open Questions

- None that block the product definition. Exact visual details beyond an energetic sports illustration remain open for `4-spec` to translate into a simple design direction.
