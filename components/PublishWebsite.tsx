'use client'

import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { publishWebsite, unpublishWebsite, getWebsiteSettings } from "@/actions/websiteActions";
import { WebsiteSettings } from "@/lib/documentToHtml";
import { Globe, Settings, Eye, EyeOff } from "lucide-react";

export default function PublishWebsite() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings>({
    title: "",
    description: "",
    theme: "light",
    showAuthor: false,
    authorName: "",
  });

  const pathname = usePathname();
  const docId = pathname.split("/").pop();

  // Load existing settings when modal opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && docId) {
      const result = await getWebsiteSettings(docId);
      if (result.success && result.settings) {
        setSettings(result.settings);
        setIsPublished(result.isPublished);
      }
    }
  };

  const handlePublish = () => {
    if (!docId) return;

    if (!settings.title.trim()) {
      toast.error("Please enter a website title");
      return;
    }

    startTransition(async () => {
      const result = await publishWebsite(docId, settings);
      if (result.success) {
        setIsPublished(true);
        setIsOpen(false);
        toast.success("Website published successfully!");
      } else {
        toast.error(result.error || "Failed to publish website");
      }
    });
  };

  const handleUnpublish = () => {
    if (!docId) return;

    startTransition(async () => {
      const result = await unpublishWebsite(docId);
      if (result.success) {
        setIsPublished(false);
        toast.success("Website unpublished successfully!");
      } else {
        toast.error(result.error || "Failed to unpublish website");
      }
    });
  };

  const previewUrl = docId ? `${window.location.origin}/preview/${docId}` : "";

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Globe className="w-4 h-4" />
            {isPublished ? "Website Settings" : "Publish Website"}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {isPublished ? "Website Settings" : "Publish Your Website"}
            </DialogTitle>
            <DialogDescription>
              {isPublished 
                ? "Customize your published website settings and appearance."
                : "Convert your document into a beautiful, public website."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Basic Settings
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Website Title *</Label>
                  <Input
                    id="title"
                    value={settings.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, title: e.target.value })}
                    placeholder="Enter your website title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings({ ...settings, description: e.target.value })}
                    placeholder="Brief description of your website"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => 
                      setSettings({ ...settings, theme: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Author Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Author Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showAuthor"
                    checked={settings.showAuthor}
                    onCheckedChange={(checked: boolean) => 
                      setSettings({ ...settings, showAuthor: checked })
                    }
                  />
                  <Label htmlFor="showAuthor">Show author information</Label>
                </div>

                {settings.showAuthor && (
                  <div>
                    <Label htmlFor="authorName">Author Name</Label>
                    <Input
                      id="authorName"
                      value={settings.authorName}
                      onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                      placeholder="Enter author name"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {isPublished && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Your Published Website
                </h3>
                
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={previewUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(previewUrl);
                        toast.success("URL copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="w-full cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Website
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            {isPublished && (
              <Button
                variant="destructive"
                onClick={handleUnpublish}
                disabled={isPending}
                className="flex items-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Unpublish
              </Button>
            )}
            
            <Button
              onClick={handlePublish}
              disabled={isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Globe className="w-4 h-4" />
              {isPending ? "Publishing..." : (isPublished ? "Update Website" : "Publish Website")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 