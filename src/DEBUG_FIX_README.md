# Debug navigation fix

This patch fixes the debug navigation in the current source.

## What was wrong

`DebugPanel.jsx` existed, but `App.jsx` never rendered `<DebugPanel />` and the `/debug/*` route was not registered. That meant the keyboard listener was never mounted and debug URLs had no route to render.

## Install

Replace these three files in your project:

- `App.jsx`
- `components/DebugPanel.jsx`
- `components/DebugPage.jsx`

## Test

1. Run the project normally.
2. Press **F8** anywhere. The debug panel should appear in the bottom-right.
3. Click **LV3 ENDING** to jump straight to the final game ending.
4. Click **MEMORY LANE** to jump straight to the memory page.
5. **Ctrl + Shift + M** jumps directly to Memory Lane without opening the panel.
6. **Ctrl + Shift + G** and **Alt + Shift + D** remain as aliases for opening the panel.

If the panel does not appear after replacing the files, restart Vite once with `Ctrl+C` and `npm run dev`.
