# Move Week — NTC Screenshot Workout Planner

Move Week reads workout names and durations from a Nike Training Club screenshot, then helps you turn them into a weekly plan.

## Public links

- Try the app: <https://moksiuyin217.github.io/move-week/>
- Public repository: <https://github.com/moksiuyin217/move-week>

## Run it on your computer

1. Open PowerShell in this project folder.
2. Start Python's small local web server:

   ```powershell
   py -m http.server 8000
   ```

3. Open <http://localhost:8000/> in a modern browser.
4. Choose a PNG, JPG, or WEBP screenshot. The first read needs an internet connection to load Tesseract.js and its English text data. The screenshot is read in your browser and is not sent to an app server.

Press `Ctrl+C` in PowerShell to stop the local server.

## Publish with GitHub Pages

Push the project to a public GitHub repository. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select the branch you pushed (`main` or `master`) and `/ (root)` folder, and save. GitHub Pages will show the published site address in the Pages settings after deployment.

## Try the proof of concept

Upload an NTC screenshot, review the workout names and durations, then edit or remove rows. Add dates and start times to see the live text plan and download an `.ics` file with timed or all-day events. The time picker offers quarter-hour choices, and the field also accepts any typed minute. Follow the Google Calendar or Apple Calendar import guide below the plan to add the events.

## Demo walkthrough

1. Upload an NTC workout screenshot and show the extracted names and durations.
2. Edit one workout name, choose a date, and set a start time. Show the picker’s 15-minute minute choices and the live plan update.
3. Type a different minute to show custom times work, then download the `.ics` file and point out the calendar import guide.
