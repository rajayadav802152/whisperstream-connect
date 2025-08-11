import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, CheckCheck, Image as ImageIcon, Mic, Paperclip, Send } from "lucide-react";

interface Message {
  id: string;
  text?: string;
  mediaUrl?: string;
  fromMe: boolean;
  time: string;
  delivered?: boolean;
  read?: boolean;
}

const initialMessages: Message[] = [
  { id: "m1", text: "Hey! Are we still on for tonight?", fromMe: false, time: "18:02" },
  { id: "m2", text: "Yep, see you at 6.", fromMe: true, time: "18:03", delivered: true, read: true },
];

const Chat = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => (id === "2" ? "Design Team" : id === "3" ? "Maya" : "Alex Johnson"), [id]);

  const send = () => {
    if (!value.trim()) return;
    const newMsg: Message = {
      id: Math.random().toString(36).slice(2),
      text: value,
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      delivered: true,
      read: false,
    };
    setMessages((m) => [...m, newMsg]);
    setValue("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 20);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-xs text-muted-foreground">online • typing…</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Voice</Button>
            <Button variant="secondary" size="sm">Video</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 flex-1">
        <div className="py-6 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-lg px-3 py-2 text-sm shadow ${m.fromMe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.text && <p>{m.text}</p>}
                <div className="mt-1 flex items-center gap-1 justify-end opacity-80">
                  <span className="text-[10px]">{m.time}</span>
                  {m.fromMe && (m.read ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />)}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-6 py-3 flex items-center gap-2">
          <Button variant="secondary" size="icon" aria-label="Attach">
            <Paperclip />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Image">
            <ImageIcon />
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Message"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
          </div>
          <Button variant="secondary" size="icon" aria-label="Voice">
            <Mic />
          </Button>
          <Button onClick={send} variant="hero" size="icon" aria-label="Send">
            <Send />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
