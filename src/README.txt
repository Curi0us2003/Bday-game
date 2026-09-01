LEVEL 3 — TUSHAR SPRITE FIX

This patch replaces the Level 3 playable character rendering.

COPY:
components/game/Level3Game.jsx
assets/characters/shadow-weaver/idle-clean.png
assets/characters/shadow-weaver/tushar-combat-sprites.png

The playable Tushar is now rendered from real frame-based character artwork:
- RUN: 4 distinct full-body poses with visible arms/hands/legs
- JUMP: 4 poses
- AIM/SHOOT: 3 poses
- HURT: frame-based reaction
- DEATH: frame-based reaction
- IDLE: clean transparent full-body Tushar

The old poster/card character is no longer used as the playable sprite.
The sprite sheet is based on the previously created Tushar Shadow Weaver character-sheet artwork; no new AI image is required.

The code was syntax-checked as JSX after the patch.
