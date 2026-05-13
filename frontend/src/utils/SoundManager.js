import useSound from 'use-sound';

// Using royalty-free placeholder sounds for 'God Mode' experience
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  error: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  hover: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  ai: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3'
};

export function useGodSounds() {
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });
  const [playSuccess] = useSound(SOUNDS.success, { volume: 0.6 });
  const [playError] = useSound(SOUNDS.error, { volume: 0.5 });
  const [playHover] = useSound(SOUNDS.hover, { volume: 0.2 });
  const [playAI] = useSound(SOUNDS.ai, { volume: 0.7 });

  return { playClick, playSuccess, playError, playHover, playAI };
}
