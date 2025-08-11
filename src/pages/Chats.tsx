import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const demoChats = [
  { id: "1", name: "Alex Johnson", last: "See you at 6!", unread: 2, online: true },
  { id: "2", name: "Design Team", last: "Uploaded latest mockups.", unread: 0, online: false },
  { id: "3", name: "Maya", last: "Voice note • 0:23", unread: 1, online: true },
];

const Chats = () => {
  return (
    <main className="min-h-screen container mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Chats</h1>
        <Link to="/profile" className="text-sm underline-offset-4 hover:underline">Profile</Link>
      </header>
      <ul className="divide-y divide-border rounded-md border">
        {demoChats.map((c) => (
          <li key={c.id}>
            <Link to={`/chat/${c.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-accent">
              <div className="relative">
                <Avatar>
                  <AvatarFallback>{c.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {c.online && (
                  <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  {c.unread > 0 && <Badge>{c.unread}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.last}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Chats;
