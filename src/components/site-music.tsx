import { useEffect, useRef } from "react";

const MUSIC_SRC = "/Echoes%20of%20the%20Ancient%20Kingdom.mp3";

export function SiteMusic({ start }: { start: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !start) return;

    audio.volume = 0.45;
    const play = () => void audio.play().catch(() => undefined);
    play();

    // If the browser blocks an unprompted play, its first user interaction is
    // allowed to start the same looping track without any page refresh.
    window.addEventListener("pointerdown", play, { once: true });
    window.addEventListener("keydown", play, { once: true });
    return () => {
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("keydown", play);
    };
  }, [start]);

  return <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" aria-hidden="true" />;
}
