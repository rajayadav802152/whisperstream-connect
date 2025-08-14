import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Globe, User } from "lucide-react";

const demoChats = [
  { id: "1", name: "Alex Johnson", last: "See you at 6!", unread: 2, online: true },
  { id: "2", name: "Design Team", last: "Uploaded latest mockups.", unread: 0, online: false },
  { id: "3", name: "Maya", last: "Voice note • 0:23", unread: 1, online: true },
];

const Chats = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = demoChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.last.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen container mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Chats</h1>
        <div className="flex items-center gap-3">
          <Link to="/browser">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Browser
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="pl-10"
        />
      </div>
      <ul className="divide-y divide-border rounded-md border">
        {filteredChats.length === 0 ? (
          <li className="px-4 py-8 text-center text-muted-foreground">
            No chats found matching "{searchQuery}"
          </li>
        ) : (
          filteredChats.map((c) => (
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
          ))
        )}
      </ul>
    </main>
  );
};

export default Chats;
