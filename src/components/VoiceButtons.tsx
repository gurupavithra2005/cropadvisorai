import { Button } from "@/components/ui/button";
import { Mic, Volume2 } from "lucide-react";
import { useListen, useSpeak } from "@/hooks/useVoice";
import { cn } from "@/lib/utils";

export function ListenButton({ onText, className }: { onText: (t: string) => void; className?: string }) {
  const { listening, start, stop, supported } = useListen(onText);
  if (!supported) return null;
  return (
    <Button type="button" size="icon" variant={listening ? "default" : "outline"}
      onClick={listening ? stop : start}
      className={cn("relative rounded-full", listening && "bg-accent text-accent-foreground", className)}
      aria-label="Voice input">
      {listening && <span className="absolute inset-0 rounded-full border-2 border-accent animate-pulse-ring" />}
      <Mic size={20} />
    </Button>
  );
}

export function SpeakButton({ text, className }: { text: string; className?: string }) {
  const speak = useSpeak();
  return (
    <Button type="button" size="icon" variant="ghost" onClick={() => speak(text)}
      className={cn("rounded-full text-muted-foreground hover:text-primary", className)}
      aria-label="Read aloud">
      <Volume2 size={18} />
    </Button>
  );
}
