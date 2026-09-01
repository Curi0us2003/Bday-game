import { Volume2, VolumeX } from 'lucide-react'

// Renders whatever control the current song status calls for — a
// fallback play button if autoplay was blocked, a mute toggle if it's
// playing, or nothing while idle/fading/stopped. Owns no audio itself;
// all playback lives in useBirthdaySong (see BirthdayExperience.jsx).
export default function MusicControl({ song }) {
  if (!song) return null

  if (song.status === 'blocked') {
    return (
      <button
        onClick={song.play}
        className="label-mono border border-line rounded-full px-3 py-1.5 hover:border-gold hover:text-bone transition-colors duration-ui mt-6"
      >
        ♪ PLAY BIRTHDAY SONG
      </button>
    )
  }

  if (song.status === 'playing') {
    return (
      <button
        onClick={song.toggleMute}
        aria-label={song.muted ? 'Unmute' : 'Mute'}
        className="text-ash hover:text-bone transition-colors duration-ui mt-6"
      >
        {song.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    )
  }

  return null
}
