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
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { 
  generateAIWebsiteFromDocument, 
  analyzeDocumentContent, 
  getAIWebsiteData,
  unpublishAIWebsite 
} from "@/actions/aiWebsiteActions";
import { AIWebsiteSettings } from "@/lib/aiWebsiteGenerator";
import { BlockNoteEditor } from "@blocknote/core";
import { useEditor } from "./EditorContext";
import { 
  Sparkles, 
  Wand2, 
  Eye, 
  EyeOff, 
  Copy, 
  RefreshCw,
  Palette,
  Layout,
  Type,
  Lightbulb
} from "lucide-react";

export default function AIWebsiteGenerator() {
  const { editor, documentTitle } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<AIWebsiteSettings>({
    style: 'modern',
    colorScheme: 'blue',
    includeNavigation: false,
    includeTOC: false,
    customInstructions: '',
    navigationItems: ['Home', 'About', 'Contact'], // Default navigation items
  });

  const [analysis, setAnalysis] = useState<{
    suggestedStyle: string;
    suggestedColorScheme: string;
    contentAnalysis: string;
  } | null>(null);

  const pathname = usePathname();
  let docId = pathname.split("/").pop() || "";
  
  // Clean up docId if it's URL-encoded HTML
  if (docId.includes("%3C") || docId.includes("div") || docId.includes("class")) {
    console.log("⚠️ Invalid docId detected, trying to extract from pathname...");
    // Try to extract a valid docId from the pathname
    const pathParts = pathname.split("/");
    const validDocId = pathParts.find(part => 
      part.length > 10 && 
      part.length < 50 && 
      !part.includes("%") && 
      !part.includes("<") && 
      !part.includes(">") &&
      !part.includes("div") &&
      !part.includes("class")
    );
    if (validDocId) {
      docId = validDocId;
      console.log("✅ Found valid docId:", docId);
    }
  }
  
  // Ensure docId is valid (not HTML content)
  const isValidDocId = docId && 
    docId.length > 0 && 
    docId.length < 50 && // Reasonable length for docId
    !docId.includes("<") && 
    !docId.includes(">") &&
    !docId.includes("%3C") && // URL-encoded <
    !docId.includes("%3E") && // URL-encoded >
    !docId.includes("div") &&
    !docId.includes("class");
  
  // Debug docId
  console.log("Pathname:", pathname);
  console.log("Extracted docId:", docId);
  console.log("Is valid docId:", isValidDocId);

  // Extract content from the BlockNote editor
  const extractDocumentContent = () => {
    if (!editor) {
      console.log("No editor available");
      return {
        title: documentTitle || "Untitled Document",
        content: [
          {
            type: "paragraph",
            content: [{ text: "This document appears to be empty. Please add some content to generate a meaningful website." }]
          }
        ]
      };
    }

    try {
      const blocks = editor.document;
      console.log("=== CONTENT EXTRACTION DEBUG ===");
      console.log("Raw blocks from editor:", blocks);
      console.log("Document title:", documentTitle);
      console.log("Number of blocks:", blocks.length);
      
                            // Extract actual text content from blocks
                      const textContent = blocks.map(block => {
                        if (typeof block === 'string') return block;
                        const { type, content: blockContent, props } = block;
                        console.log(`Block type: ${type}, content:`, blockContent);
                        
                        // Handle images specially
                        if (type === 'image') {
                          const imageUrl = props?.url || '';
                          const caption = props?.caption || '';
                          console.log(`Found image: ${imageUrl.substring(0, 100)}...${caption ? ` (Caption: ${caption})` : ''}`);
                          console.log(`Image URL length: ${imageUrl.length}`);
                          
                          // Handle base64 vs regular URLs
                          if (imageUrl.startsWith('data:')) {
                            // For base64, we need to include the full data URL in the AI prompt
                            return `[IMAGE_BASE64: ${imageUrl}${caption ? ` - ${caption}` : ''}]`;
                          } else {
                            return `[IMAGE: ${imageUrl}${caption ? ` - ${caption}` : ''}]`;
                          }
                        }
                        
                        // Extract text from block content
                        if (Array.isArray(blockContent)) {
                          return blockContent.map(item => {
                            if (typeof item === 'string') return item;
                            if (item && typeof item === 'object' && 'text' in item) {
                              return item.text || '';
                            }
                            return '';
                          }).join('');
                        }
                        return '';
                      }).filter(text => text.trim().length > 0).join('\n\n');
      
      console.log("Text content that will be sent to AI:", textContent);
      console.log("Content length:", textContent.length);
      console.log("Is content empty?", textContent.trim().length === 0);
      console.log("=== END DEBUG ===");
      
      return {
        title: documentTitle || "Untitled Document",
        content: blocks
      };
    } catch (error) {
      console.error("Error extracting document content:", error);
      return {
        title: documentTitle || "Untitled Document", 
        content: [
          {
            type: "paragraph",
            content: [{ text: "Unable to extract document content. Please try again." }]
          }
        ]
      };
    }
  };

  const styleOptions = [
    { value: 'modern', label: 'Modern', icon: '✨', desc: 'Sleek, contemporary design' },
    { value: 'minimal', label: 'Minimal', icon: '🎯', desc: 'Clean, simple layout' },
    { value: 'professional', label: 'Professional', icon: '💼', desc: 'Business-oriented design' },
    { value: 'creative', label: 'Creative', icon: '🎨', desc: 'Artistic, unique design' },
    { value: 'blog', label: 'Blog', icon: '📝', desc: 'Content-focused layout' },
  ];

  const colorOptions = [
    { value: 'blue', label: 'Ocean Blue', color: 'bg-blue-500' },
    { value: 'purple', label: 'Royal Purple', color: 'bg-purple-500' },
    { value: 'green', label: 'Nature Green', color: 'bg-green-500' },
    { value: 'orange', label: 'Sunset Orange', color: 'bg-orange-500' },
    { value: 'dark', label: 'Dark Theme', color: 'bg-gray-800' },
  ];



  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && docId) {
      // Load existing data
      const result = await getAIWebsiteData(docId);
      if (result.success && result.settings) {
        setSettings(result.settings);
        setIsPublished(result.isPublished);
        setGeneratedHTML(result.html || null);
      }
    }
  };

  const handleAnalyzeContent = async () => {
    if (!docId) return;
    
    setIsAnalyzing(true);
    try {
      const documentContent = extractDocumentContent();
      const result = await analyzeDocumentContent(docId, documentContent);
      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        toast.success("Content analyzed! Check out the AI suggestions.");
      } else {
        toast.error(result.error || "Failed to analyze content");
      }
    } catch (error) {
      toast.error("Failed to analyze content");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestions = () => {
    if (analysis) {
      setSettings({
        ...settings,
        style: analysis.suggestedStyle as AIWebsiteSettings['style'],
        colorScheme: analysis.suggestedColorScheme as AIWebsiteSettings['colorScheme'],
      });
      toast.success("AI suggestions applied!");
    }
  };

  const handleGenerate = () => {
    if (!isValidDocId) {
      toast.error("Invalid document ID");
      return;
    }

    const documentContent = extractDocumentContent();

    startTransition(async () => {
      const result = await generateAIWebsiteFromDocument(docId, settings, documentContent);
      if (result.success) {
        setIsPublished(true);
        setGeneratedHTML(result.html || null);
        toast.success("🎉 AI website generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate website");
      }
    });
  };

  const handleUnpublish = () => {
    if (!isValidDocId) {
      toast.error("Invalid document ID");
      return;
    }

    startTransition(async () => {
      const result = await unpublishAIWebsite(docId);
      if (result.success) {
        setIsPublished(false);
        setGeneratedHTML(null);
        toast.success("Website unpublished");
      } else {
        toast.error("Failed to unpublish website");
      }
    });
  };

  const previewUrl = isValidDocId ? `${window.location.origin}/api/website/${docId}` : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="cursor-pointer"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isPublished ? "View Website" : "Generate Website"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-blue-500 rounded-md">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            AI Website Generator
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Let AI transform your document into a beautiful, professional website. 
            Choose your style and let artificial intelligence handle the design.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Document Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
            <h3 className="font-semibold mb-2">Document: {documentTitle || "Untitled"}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editor ? "✅ Editor content will be used for generation" : "⚠️ No editor content available"}
            </p>
          </div>

          {/* AI Analysis Section */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                AI Content Analysis
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeContent}
                disabled={isAnalyzing}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Content"}
              </Button>
            </div>
            
            {analysis && (
              <div className="space-y-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">{analysis.contentAnalysis}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Suggested: {analysis.suggestedStyle}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Color: {analysis.suggestedColorScheme}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleApplySuggestions}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Apply Suggestions
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Website Style
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, style: option.value as AIWebsiteSettings['style'] })}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    settings.style === option.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Scheme
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, colorScheme: option.value as AIWebsiteSettings['colorScheme'] })}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                    settings.colorScheme === option.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 ${option.color} rounded-lg mb-2`}></div>
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Type className="w-5 h-5" />
              Advanced Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <Label htmlFor="navigation" className="font-medium">Navigation Menu</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add a top navigation bar with smooth scrolling</p>
                </div>
                <Switch
                  id="navigation"
                  checked={settings.includeNavigation}
                  onCheckedChange={(checked: boolean) => 
                    setSettings({ ...settings, includeNavigation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <Label htmlFor="toc" className="font-medium">Table of Contents</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Generate automatic TOC from headings</p>
                </div>
                <Switch
                  id="toc"
                  checked={settings.includeTOC}
                  onCheckedChange={(checked: boolean) => 
                    setSettings({ ...settings, includeTOC: checked })
                  }
                />
              </div>
            </div>

            {/* Navigation Items Configuration */}
            {settings.includeNavigation && (
              <div className="space-y-4 p-4 border rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Navigation Items</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItems = [...(settings.navigationItems || []), `Item ${(settings.navigationItems?.length || 0) + 1}`];
                      setSettings({ ...settings, navigationItems: newItems });
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    + Add Item
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add the navigation items you want in your website. These will be converted to anchor links.
                </p>
                <div className="space-y-2">
                  {(settings.navigationItems || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...(settings.navigationItems || [])];
                          newItems[index] = e.target.value;
                          setSettings({ ...settings, navigationItems: newItems });
                        }}
                        placeholder="Navigation item title"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = (settings.navigationItems || []).filter((_, i) => i !== index);
                          setSettings({ ...settings, navigationItems: newItems });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={settings.customInstructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  setSettings({ ...settings, customInstructions: e.target.value })
                }
                placeholder="Any specific design requests or requirements..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>

          {/* Preview Section */}
          {isPublished && generatedHTML && (
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-green-600" />
                Your AI-Generated Website
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Website URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={previewUrl}
                      readOnly
                      className="font-mono text-sm bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(previewUrl);
                        toast.success("URL copied!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="w-full cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View AI Website
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-6 border-t">
          {isPublished && (
            <Button
              variant="outline"
              onClick={handleUnpublish}
              disabled={isPending}
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Unpublish
            </Button>
          )}
          
          <Button
            onClick={handleGenerate}
            disabled={isPending}
            className="cursor-pointer"
          >
            {isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isPending ? "Generating..." : (isPublished ? "Regenerate Website" : "Generate Website")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 