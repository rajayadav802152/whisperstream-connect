import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, Globe, Home, RefreshCw, ArrowRight } from "lucide-react";

const Browser = () => {
  const [url, setUrl] = useState("https://");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const popularSites = [
    { name: "Google", url: "https://google.com", icon: "🔍" },
    { name: "YouTube", url: "https://youtube.com", icon: "📺" },
    { name: "GitHub", url: "https://github.com", icon: "💻" },
    { name: "Wikipedia", url: "https://wikipedia.org", icon: "📚" },
  ];

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith("http")) {
      setUrl(`https://${url}`);
    }
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    setUrl(searchUrl);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-6 py-6 flex items-center gap-4">
        <Link to="/chats">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chats
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Browser</h1>
      </header>

      <div className="container mx-auto px-6 space-y-6">
        {/* Browser Controls */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the web..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </Card>

        {/* Popular Sites */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularSites.map((site) => (
            <Card 
              key={site.name} 
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                setUrl(site.url);
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{site.icon}</div>
                <h3 className="font-medium">{site.name}</h3>
                <p className="text-xs text-muted-foreground">{site.url}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Browser Viewport */}
        <Card className="h-96 md:h-[500px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="h-full border rounded-md bg-card flex items-center justify-center">
              <div className="text-center space-y-4">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Web Browser</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a URL or search query to browse the web
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current: {url}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
};

export default Browser;