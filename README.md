# Peeko 1.8.0

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

## New in version 1.8.0

- Keep the lock/unlock reset and add a fresh-focus reset after more than 2 minutes
  between successful timer checks. Exactly 2 minutes does not trigger this rule.
- Save the check timestamp with the timer transition, so multiple tabs and queued
  alarms trigger only one reset per gap. Worker restarts retain that timestamp.
- A lock takes priority: stay paused while locked, then reset on unlock. Manual
  pauses survive gaps. Interrupted breaks are discarded without counting or sound.
- Fixed queued alarm callbacks accidentally receiving an earlier command result
  as a presence state; alarm checks now query the actual Chrome lock state.
- Gap resets are a deliberate heuristic: delayed Chrome checks can cause an
  unwanted reset while awake. They are not confirmation that sleep occurred.

## New in version 1.7.0 (historical; gap behavior superseded by 1.8.0)

- A reported screen lock pauses the timer; an observed unlock starts a full focus
  interval using your configured duration. Interrupted breaks are not counted.
- Removed the 45-second sleep guess. Delayed checks and ordinary inactivity never
  reset or extend the timer. A 30-second alarm still checks the actual lock state
  and processes due timers; it no longer estimates sleep.
- Manual pauses remain paused. All tabs share one reset per detected lock/unlock.
- The panel labels automatic lock pauses and disables timer controls until unlock.
- Feedback link, preview tilt, pets, and previous layout fixes remain included.

## New in version 1.6.0 (historical; timer behavior superseded by 1.7.0)

- Added **Feedback & report a bug** to the settings sidebar. Opens the supplied
  Google Form in a separate tab: https://forms.gle/SZBmCVxhW49zpwi26
- Automatically pauses focus and break countdowns when Chrome reports a locked
  screen (or screensaver), then resumes the saved remainder when unlocked.
- A timer paused manually stays paused after unlocking.
- Added persisted awake checkpoints to recover from sleep without a lock event.
- Requires Chrome 120+ for the 30-second recovery alarm, and the `idle` permission.

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

The running timer stores an absolute deadline (`Date.now() + remaining`). The
popup, settings preview, and all website widgets calculate `deadline - Date.now()`
for the countdown and progress ring. A single service worker serializes commands,
changes phases, and plays sounds. Chrome alarms and foreground updates reconcile
the same stored timer, preventing duplicate reminders.

When Chrome reports a screen lock (including a screensaver reported as locked),
Peeko saves the remaining time for the paused display, clears the deadline alarm,
and marks the pause as automatic. When Chrome subsequently reports `active` or
`idle` (unlocked), Peeko discards the interrupted countdown and starts a fresh
focus interval. Unlocking does not play a reminder. Repeated unlocked checks do
not reset again. Manual pauses have no automatic marker and remain paused.

The extension listens for `chrome.idle.onStateChanged` and also queries the
current state on timer checks. It does not require mouse input after unlock:
`idle` also means unlocked. An unknown state does not clear an automatic pause.
The 30-second recovery alarm remains. Each successful timer check records a
persistent `timerCheckedAt` timestamp. If an unlocked, running timer goes more
than 120,000 ms without a check, the next check starts fresh focus before processing
any overdue reminder. Exactly 120,000 ms is tolerated. Alarms, UI requests, and
reported presence changes all run this check. One stored transition and checkpoint
prevent queued requests from repeatedly resetting the same gap. Old v1.6
`presenceCheckedAt` values are ignored; installing/updating establishes a new
baseline. Missing, invalid or future checkpoints do not trigger a gap reset.

| Situation                                                            | Behavior                                                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Browser untouched, minimized, background tabs, or another app in use | Countdown and reminders continue while Chrome is running and the computer can execute them.                                                |
| No mouse/keyboard input; computer awake and unlocked                 | Continue, even if Chrome reports `idle`, as long as check gaps stay within 2 minutes.                                                      |
| Screen lock detected                                                 | Pause either phase; no new timer reminders while the lock is observed. An already-playing tone is not stopped.                             |
| Unlock after an automatic pause                                      | Start one full focus interval using the latest configured duration.                                                                        |
| Lock during a break                                                  | On unlock, discard that break without adding it to the completed count.                                                                    |
| Timer manually paused before locking                                 | Keep the same phase and remaining time paused after unlock.                                                                                |
| A gap of more than 2 minutes, with no recorded lock                  | Start full focus silently, discarding an interrupted break without counting it. A manual pause stays paused.                               |
| A check gap of 2 minutes or less                                     | Preserve the running deadline; ordinary timer transitions still apply.                                                                     |
| Timer overdue, with no lock and no qualifying gap                    | A focus phase starts one full break and its sound; an overdue break completes once and starts focus. No replay of every missed cycle.      |
| A late check finds the machine still locked                          | Apply the lock pause before processing an overdue timer, suppressing its reminder.                                                         |
| Multiple tabs or repeated unlock checks                              | One shared transition and deadline, with no repeated reset or duplicate sound.                                                             |
| Focus duration edited during an automatic pause                      | Stay paused; use the new duration on unlock.                                                                                               |
| Theme, pet, widget visibility, fonts, position changes               | Those settings do not themselves reset or resume the timer; their request still processes any pre-existing gap or lock transition.         |
| Day changes while locked                                             | Start fresh focus on unlock; daily completed count resets to zero.                                                                         |
| Browser fully restarted                                              | Existing behavior: running timers start fresh focus. Manual pauses remain paused; automatic pauses wait for an unlocked state, then reset. |
| Extension updated while a v1.6 automatic pause is saved              | The saved pause uses the new fresh-focus behavior on unlock.                                                                               |

Chrome does not expose a direct lid-close/suspend event to ordinary extensions.
A reported lock/unlock or a check gap over 2 minutes now triggers a reset. A short
sleep without a recorded lock may not create a large enough gap; in that case
sleep counts as elapsed wall-clock time and an overdue timer follows the normal
phase transition. Display sleep alone does not trigger a reset if checks continue.

The gap rule is an accepted trade-off: Chrome may delay checks while the computer
is awake, causing an unwanted reset. Frequent locks or long check gaps can postpone
reminders. Ordinary browser inactivity is not itself a pause signal. Clock
adjustments can change the countdown; a forward clock jump can also create an
apparent gap. Chrome must be running, and alarms cannot play while the computer
is asleep or the browser is fully closed. A gap reset is silent and does not replay
missed reminders. An already-playing tone is not stopped by a lock or gap reset.
Short breaks use foreground updates and a short worker timeout, with Chrome
alarms providing recovery when the worker is suspended.

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
9. Let focus count down, lock the screen, then unlock. Confirm it starts at the
   configured full duration. Wait a minute: it should count down without resetting
   again. Repeat during a break: unlock must start focus, with no extra completed break.
10. Repeat after manually pausing: it must stay paused. Leave Chrome untouched while
    working in another app: the timer must continue. Test lid closure separately;
    reset is expected after a recorded lock/unlock or more than 2 minutes between
    checks. A shorter unreported sleep may leave the timer overdue and start a break.
    Try again during a break and while manually paused: a gap discards the former
    without counting it, but preserves the latter.
11. Open **Feedback & report a bug** in settings and confirm the form opens.

The preview is the live timer, so **Try a reminder** ends the current interval
and starts a real break countdown. It can always be skipped.

## Browser boundaries

- The panel appears on ordinary HTTP and HTTPS pages. Chrome doesn't permit page
  extensions on `chrome://` pages, the Chrome Web Store, and some built-in viewers.
  Use the toolbar popup on those pages. Local file pages are not included.
- This is an in-page panel and companion, not an operating-system desktop widget.
- Existing tabs need a refresh after installing, updating, or reloading the extension.
- While awake and unlocked, the timer follows wall-clock time, including time spent
  in other apps. A recorded lock pauses it; unlock or a check gap over 2 minutes starts fresh focus.
- Moving the system clock can change countdowns. Chrome may delay alarms during
  sleep or heavy throttling; second-perfect background timing is not guaranteed.

## Privacy and permissions

No analytics, remote code, external images, font downloads, accounts, or network
requests are used by the extension itself. The feedback link opens an external
Google Form only when you click it. Preferences and timer state are saved only in Chrome's local
extension storage. The content script draws its own isolated interface without
reading the page's text, forms, browsing history, or credentials.

- `storage`: remember your timer and preferences.
- `alarms`: recover timer deadlines when the service worker is suspended.
- `offscreen`: play a reminder even when the panel is closed.
- `idle`: detect system lock/unlock locally; this information is not sent anywhere.
- HTTP/HTTPS content-script access: show the floating panel on websites. Chrome
  may describe this as permission to read and change data on websites.

## Source and tests

The extension uses plain JavaScript, HTML, CSS, Manifest V3, and original SVG
companions. There are no third-party runtime dependencies.

- `core.mjs`: validated preferences and timer transitions.
- `background.js`: shared timer, alarms, messaging, lock detection, and sound effects.
- `presence.mjs`: reported-lock pause, fresh-focus reset on unlock, and the 2-minute gap rule.
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

All 58 automated tests passed, including simulated pointer release, window focus loss,
free positioning, the hidden-pet expand path, synchronized ring/digit updates,
lock/unlock resets, interrupted breaks, manual pause preservation, delayed checks,
restart behavior, duration changes, daily counts, old automatic-pause migration,
gap threshold boundaries, lock precedence, silent gap resets, invalid checkpoints,
cross-tab visibility changes during dragging, keyboard focus restoration, global
hide/show, popup save error recovery, the dependent hopping control, handle-only dragging, shared Resume/Pause/Skip actions, settings preview controls, and full-length sound playback. JavaScript syntax, package references, and font
file integrity were checked. The redesigned companion artwork was rendered and
visually inspected.
Live Chrome rendering, actual audio output, drag interactions, and physical Mac
lock/lid-close behavior were not
verified in the build environment because a usable browser binary was unavailable.

Implementation references:

- https://developer.chrome.com/docs/extensions/reference/api/idle
- https://developer.chrome.com/docs/extensions/reference/api/alarms
- https://developer.chrome.com/docs/extensions/reference/api/offscreen

## Updating

Replace the files in the same extension folder, press the extension's reload
button at `chrome://extensions`, and refresh open website tabs. Keeping the same
folder preserves the unpacked extension's identity and local preferences. The internal
`focus-familiar` folder name is retained for easy updates from earlier versions of Peeko. Open settings → Your routine → Easy on the eyes to change
the font and reading size.
