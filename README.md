# Peeko 1.5.2

A small Chrome extension for a calmer screen routine: adjustable focus intervals,
adjustable distance breaks, configurable reminders, and a theme-matched animated companion.

## Install in Chrome — no build required

1. Extract `focus-familiar.zip` to a permanent folder on your computer.
2. In Chrome, open `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and choose the extracted **focus-familiar** folder — the one containing `manifest.json`.
5. Use Chrome's puzzle-piece menu to pin **Peeko** to the toolbar.
6. Refresh existing website tabs. The floating panel appears in the top-right corner.
7. Click the panel's settings icon to open your theme gallery and preferences.

Keep the extracted folder in place while the extension is installed. No Node.js,
npm installation, account, API key, or server is required to use it.

## New in version 1.5.2

- Restored the settings preview’s original 2° tilt, with the existing flat layout on narrow screens.
- The expanded website companion blocks clicks on content behind it. Dragging still uses the handle.

## New in version 1.5.1

- Popup top spacing follows companion visibility, including changes from settings.
- Removed Calm melody; existing selections fall back to Soft buzzer.
- Sound names no longer include duration labels.

## New in version 1.5.0

- The popup now uses the same timer circle, numeral sizes, spacing, padding,
  weights, and Resume/Pause/Skip icon buttons as the website widget. At larger
  text sizes, the popup scrolls instead of shrinking the typography.
- The settings preview includes the same grip, minimize, and close controls.
  Minimize and close affect website widgets; the settings preview stays visible.
  The preview grip shows where to drag the widget on a website.
- Dropdowns have consistent left/right text padding and a separate inset chevron.
- Added Soft ping (0.3 seconds), Two gentle notes (0.7 seconds), Warm chime
  (2 seconds), and Calm melody (3 seconds). Use Test to hear any choice.
- Longer sounds play through their final note before audio resources are closed.

## New in version 1.4.1

- Restored the v1.3 Spider-Man companion with eight slim blue legs and matching eyes.
- The expanded website widget now moves only using its top-center grip. Focus
  the grip and use arrow keys for keyboard positioning. Collapsed pets and bars
  still drag directly, with no added handle.
- The toolbar popup uses a compact timer and always-visible **Start/Pause** and
  **Skip** controls. Start resumes a paused timer; Skip starts a fresh focus interval.
- Removed desktop notification settings and the Chrome notifications permission.
  Configurable sounds, timer visuals, and automatic breaks remain available.

## New in version 1.4.0

- Spidey now has a low, rounded body with eight curved supporting legs, inspired
  by the supplied references. Its small oval eyes match the other companions.
- Added **Show widget on websites** in the Chrome toolbar popup and settings.
  The website panel's **×** button turns the same setting off across all tabs.
- Hiding removes the panel, pet, and compact bar from websites. It keeps the
  timer and reminders running, and preserves placement and collapsed state.
  Use the toolbar popup or settings to show it again without refreshing tabs.
- **Let your companion hop** is disabled and displayed off when **Show companion**
  is off. The previous hopping preference returns when the companion is shown.

## New in version 1.3.0

- Spidey is a red-and-blue spider again: eight grounded legs, no hanging thread,
  and the same oval eyes and small highlights as the other animal companions.
- Added **Night Fury** from _How to Train Your Dragon_, with a simple Toothless
  companion: charcoal body, green eyes, rounded ear fins, and a small red tail fin.
- Night Fury uses cool blue colours and a rounded dragon silhouette, distinct from
  Batman's warm grey/gold palette, pointed ears, and broad angular wings.

## New in version 1.2.1

- Bolt is now a red-and-gold bear cub with a small blue reactor badge.
- Spidey is now a red-and-blue cat. Both use the same rounded animal shapes,
  eyes, paws, and proportions as the existing companions.
- Changing pet visibility or collapsed mode in another tab safely cancels an
  active drag instead of saving coordinates for the wrong panel size.
- Keyboard focus moves to the visible control when collapsing or expanding;
  changes in another tab do not steal focus from the webpage.
- Added checks for cancelled pointer drags and clicking to expand afterward.

## New in version 1.2.0

- Renamed to **Peeko**, with a simple red-and-gold Iron Man robot companion.
- Collapsing with the companion hidden leaves a draggable timer bar. Click to expand.
- Drag the expanded panel by its top-center grip, or drag the collapsed pet/bar.
- **Snap to nearest corner** is on by default. Snapping happens when you release a drag,
  cancel it, or leave the window. Turn it off to keep your chosen free position.
- Arrow keys reposition the focused pet, bar, or panel grip. With snapping on they
  select corners; with snapping off they move in small steps (Shift moves further).
- The countdown digits and progress ring now use the same deadline every animation
  frame, with no trailing CSS transition. Pause, resume, and reset apply immediately.

## New in version 1.1.1

- Font choices now apply directly to the floating panel, collapsed pet, toolbar popup, and settings page.
- Spidey is a simple eight-legged spider; Ember is a rounded dragon with small wings.

## New in version 1.1

- Redrawn Spider-Man, Iron Man, and Game of Thrones companions with distinct silhouettes and details.
- Larger text throughout the settings, timer panel, toolbar popup, and collapsed companion.
- Eight font choices and three reading sizes; your choice is saved and applied across tabs.
- Automatic focus → break → focus cycles; there is no need to click Start.

## What you can customise

- **Widget visibility:** globally show or hide website widgets from the popup or settings. The × on a website panel hides them everywhere. The popup and settings remain accessible.
- **Font style:** Roboto, system sans-serif, Arial, Verdana, Trebuchet MS, Georgia, Times New Roman, or Courier New. Roboto is bundled for offline use; other choices use local fonts with matching fallbacks.
- **Text size:** Comfortable, Large (115%), or Extra large (130%).
- **Focus interval:** 1–180 minutes; default 20 minutes.
- **Break duration:** 5–300 seconds; default 20 seconds.
- **Sound:** soft buzzer (default), gentle chime, crystal bell, soft ping, two gentle notes, warm chime, or silent. Choose a short tone or a longer chime.
- **Volume:** 0–100%, with a Test button.
- **Panel position:** choose an opening corner, or drag the top-center grip to move the open panel.
- **Snap to nearest corner:** enable to dock on release or window focus loss; disable for free placement.
- **Collapsed companion:** drag anywhere on the page; click or press Enter to expand into the selected corner. Arrow keys also move the focused companion.
- **Companion visibility and hopping:** independently configurable. When the widget is enabled, hiding the companion replaces the collapsed pet with a compact Peeko timer bar. Hopping is disabled until the companion is shown again. The interface also respects your system's reduced-motion preference.

## Themes

| Theme                                 | Original companion                                              |
| ------------------------------------- | --------------------------------------------------------------- |
| Harry Potter                          | Hoot, a scarf-wearing owl                                       |
| Game of Thrones                       | Ember, a rounded dragon with small red wings                    |
| Spider-Man                            | Spidey, the v1.3 red-and-blue spider with eight slim legs       |
| Batman                                | Bats, a little bat                                              |
| Night Fury (How to Train Your Dragon) | Toothless, a charcoal dragon with green eyes and a red tail fin |
| Iron Man                              | Bolt, a red-and-gold bear cub                                   |
| Captain America                       | Scout, a shield companion                                       |
| Black Panther                         | Onyx, a purple-accented panther                                 |
| Royal Amethyst                        | Luna, a lilac cat                                               |
| Royal Emerald                         | Clover, a green cat                                             |
| Royal Sapphire                        | Blue, a blue cat                                                |

Theme illustrations are original SVG artwork. This is an unofficial fan-inspired
personal project and has no affiliation with the referenced franchises.

## How the timer behaves

There is one shared timer across all tabs. A new tab does not reset the timer, and
multiple tabs do not produce multiple reminder sounds.

At the end of a focus interval, the buzzer plays once and the break countdown
**starts automatically**. Look at an object at least 20 feet away. When the break
ends, a short completion sound plays (unless silent) and the next focus interval
**starts automatically**. The default cycle is **20 minutes → 20 seconds → repeat**;
your configured durations are used throughout. Pause and Skip remain available.

**Pause** preserves the time left in either a work interval or a break. **Skip**
starts a fresh focus interval without counting a completed break. A collapsed
companion shows the countdown and highlights during a break. Your corner,
pet position, collapsed state, and other preferences stay in sync across tabs.

Changing the focus interval restarts the current work interval while preserving
an intentional pause. Changing break duration applies to the next break.
The local daily break counter counts finished break countdowns, not skipped reminders. It cannot determine whether you actually looked away.

Fully restarting Chrome starts a new focus interval unless you had paused the
timer. Sleeping your computer or suspended browser processes can delay reminders;
on recovery, the extension reconciles the stored deadline once instead of
playing a backlog of buzzers. Short break countdowns update against an absolute
timestamp. Foreground UI updates and a short worker timer handle completion,
with Chrome alarms providing recovery if the worker is suspended.

## Quick check after installation

1. Open settings from the toolbar panel and click **Try a reminder**.
2. Confirm the buzzer plays and the break countdown starts automatically; look away.
3. After the break, check that a fresh focus interval starts.
4. Try **Pause**, **Resume**, and **Skip**.
5. Switch themes, choose another corner, collapse the panel, and drag the pet.
6. Open a second ordinary website tab; check that the same timer and preferences appear.
7. Close the widget with ×. Both tabs should hide it. Turn **Show widget on websites**
   back on in the toolbar popup; both tabs should restore it with the timer still running.
8. Hide the companion in settings and verify the hopping switch is disabled.

The preview is the live timer, so **Try a reminder** ends the current interval
and starts a real break countdown. It can always be skipped.

## Browser boundaries

- The panel appears on ordinary HTTP and HTTPS pages. Chrome doesn't permit page
  extensions on `chrome://` pages, the Chrome Web Store, and some built-in viewers.
  Use the toolbar popup on those pages. Local file pages are not included.
- This is an in-page panel and companion, not an operating-system desktop widget.
- Existing tabs need a refresh after installing, updating, or reloading the extension.
- The timer follows wall-clock time while Chrome is running, including time spent
  in other apps. Use Pause when you do not want reminders.
- Moving the system clock can change countdowns. Chrome may delay alarms during
  sleep or heavy throttling; second-perfect background timing is not guaranteed.

## Privacy and permissions

No analytics, remote code, external images, font downloads, accounts, or network
requests are used. Preferences and timer state are saved only in Chrome's local
extension storage. The content script draws its own isolated interface without
reading the page's text, forms, browsing history, or credentials.

- `storage`: remember your timer and preferences.
- `alarms`: recover timer deadlines when the service worker is suspended.
- `offscreen`: play a reminder even when the panel is closed.
- HTTP/HTTPS content-script access: show the floating panel on websites. Chrome
  may describe this as permission to read and change data on websites.

## Source and tests

The extension uses plain JavaScript, HTML, CSS, Manifest V3, and original SVG
companions. There are no third-party runtime dependencies.

- `core.mjs`: validated preferences and timer transitions.
- `background.js`: shared timer, alarms, messaging, and notifications.
- `sounds.js`, `offscreen.js`: selectable sound definitions and local Web Audio playback.
- `themes.js`, `pets.js`: palettes and original vector companions.
- `fonts.js`, `font-data.js`: configurable typography and bundled Roboto font bytes.
- `licenses/Roboto.txt`: Roboto attribution and Apache 2.0 licence.
- `ui.js`: shared timer panel and controls.
- `content.js`, `positioning.js`: panel/pet/bar dragging, corner snapping, and viewport bounds.
- `settings.html`, `settings.css`, `settings.js`: customisation studio.
- `popup.html`, `popup.css`, `popup.js`: Chrome toolbar panel.

With Node.js 20+ installed, run `npm test` from this folder. No `npm install` is
required. Tests cover deadline handling, pause/resume, skip, daily counts, late
wake-up, repeated automatic cycles, font preference validation, upgrade migration,
concurrent tab requests, reminder deduplication,
and the service worker's browser API contract using mocked Chrome APIs.

All 39 automated tests passed, including simulated pointer release, window focus loss,
free positioning, the hidden-pet expand path, synchronized ring/digit updates,
cross-tab visibility changes during dragging, keyboard focus restoration, global
hide/show, popup save error recovery, the dependent hopping control, handle-only dragging, shared Resume/Pause/Skip actions, settings preview controls, and full-length sound playback. JavaScript syntax, package references, and font
file integrity were checked. The redesigned companion artwork was rendered and
visually inspected.
Live Chrome rendering, actual audio output, and drag interactions were not
verified in the build environment because a usable browser binary was unavailable.

Implementation references:

- https://developer.chrome.com/docs/extensions/reference/api/alarms
- https://developer.chrome.com/docs/extensions/reference/api/offscreen

## Updating

Replace the files in the same extension folder, press the extension's reload
button at `chrome://extensions`, and refresh open website tabs. Keeping the same
folder preserves the unpacked extension's identity and local preferences. The internal
`focus-familiar` folder name is retained for easy updates from earlier versions of Peeko. Open settings → Your routine → Easy on the eyes to change
the font and reading size.
