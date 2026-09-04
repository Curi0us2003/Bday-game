import { Volume2, VolumeX } from 'lucide-react'

// Renders a mute toggle while the song is playing. Owns no audio itself;
// all playback lives in useBirthdaySong (see BirthdayExperience.jsx).
export default function MusicControl({ song }) {
  if (!song) return null

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
