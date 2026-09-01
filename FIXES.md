# Current birthday experience fixes

- Landing page is locked to one viewport and uses a compact regional India crop so Bangalore and Kolkata remain visible at 100% desktop zoom.
- Bangalore → Kolkata route is a dashed geographic-style path with a travelling dot and destination pulse.
- Microphone blow detection is more forgiving (lower threshold + shorter sustained duration). One successful blow now triggers a staggered all-candle extinguish.
- Cake scene has a 2.3s automatic handoff after the candles go out plus a visible Continue fallback, preventing a stuck post-blow state.
- Birthday message timing is slightly tighter and the handoff into game mode is shorter.
