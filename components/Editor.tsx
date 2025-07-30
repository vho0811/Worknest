import { useRoom, useSelf } from "@liveblocks/react";
import * as Y from "yjs";
import { useEffect, useState } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import stringToColor from "@/lib/stringToColor";
import TranslateDocument from "./TranslateDocument";
import { useEditor } from "./EditorContext";
import { toast } from "sonner";


type EditorProps = {
    doc: Y.Doc;
    provider: any;
    
}

function BlockNote({doc, provider}: EditorProps) {
    const userInfo = useSelf((me) => me.info);
    const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
    const { setEditor: setGlobalEditor } = useEditor();

    useEffect(() => {
        if (!doc || !provider || !userInfo) return;

        const blockNoteEditor = BlockNoteEditor.create({
        collaboration: {
            provider,
            fragment: doc.getXmlFragment("document-store"),
                user: {
                name: userInfo?.name || "Anonymous",
                color: stringToColor(userInfo?.email || ""),
                },
            },
            uploadFile: async (file: File) => {
                try {
                    // Check file type and size
                    const maxSize = 10 * 1024 * 1024; // 10MB max (reduced for Liveblocks compatibility)
                    if (file.size > maxSize) {
                        const errorMsg = `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`;
                        toast.error(errorMsg);
                        throw new Error(errorMsg);
                    }

                    // Validate file type - images and videos only
                    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
                    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

                    const isValidType = [
                        ...validImageTypes,
                        ...validVideoTypes
                    ].includes(file.type);

                    if (!isValidType) {
                        const errorMsg = `Unsupported file type: ${file.type}. Please upload images or videos only.`;
                        toast.error(errorMsg);
                        throw new Error(errorMsg);
                    }

                    // Compress images before converting to base64 for Liveblocks storage
                    if (validImageTypes.includes(file.type)) {
                        // Additional check for very large images
                        if (file.size > 5 * 1024 * 1024) { // 5MB
                            toast.warning(`Large image detected. Compressing for better performance...`);
                        }
                        return new Promise((resolve, reject) => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new Image();
                            
                            img.onload = () => {
                                // Calculate new dimensions (max 800px width/height for smaller size)
                                const maxDimension = 800;
                                let { width, height } = img;
                                
                                if (width > height) {
                                    if (width > maxDimension) {
                                        height = (height * maxDimension) / width;
                                        width = maxDimension;
                                    }
                                } else {
                                    if (height > maxDimension) {
                                        width = (width * maxDimension) / height;
                                        height = maxDimension;
                                    }
                                }
                                
                                canvas.width = width;
                                canvas.height = height;
                                
                                // Draw and compress
                                ctx?.drawImage(img, 0, 0, width, height);
                                
                                // Convert to base64 with much lower quality (60%) for smaller size
                                const compressedDataUrl = canvas.toDataURL(file.type, 0.6);
                                
                                // Check if the result is still too large
                                if (compressedDataUrl.length > 500000) { // 500KB limit
                                    // Further compress with even smaller dimensions
                                    const smallCanvas = document.createElement('canvas');
                                    const smallCtx = smallCanvas.getContext('2d');
                                    const smallImg = new Image();
                                    
                                    smallImg.onload = () => {
                                        const smallMaxDimension = 600;
                                        let smallWidth = width;
                                        let smallHeight = height;
                                        
                                        if (smallWidth > smallHeight) {
                                            if (smallWidth > smallMaxDimension) {
                                                smallHeight = (smallHeight * smallMaxDimension) / smallWidth;
                                                smallWidth = smallMaxDimension;
                                            }
                                        } else {
                                            if (smallHeight > smallMaxDimension) {
                                                smallWidth = (smallWidth * smallMaxDimension) / smallHeight;
                                                smallHeight = smallMaxDimension;
                                            }
                                        }
                                        
                                        smallCanvas.width = smallWidth;
                                        smallCanvas.height = smallHeight;
                                        smallCtx?.drawImage(smallImg, 0, 0, smallWidth, smallHeight);
                                        
                                        const finalDataUrl = smallCanvas.toDataURL(file.type, 0.5);
                                        resolve(finalDataUrl);
                                    };
                                    
                                    smallImg.src = compressedDataUrl;
                                } else {
                                    resolve(compressedDataUrl);
                                }
                            };
                            
                            img.onerror = () => {
                                const errorMsg = `Failed to process image: ${file.name}`;
                                toast.error(errorMsg);
                                reject(new Error(errorMsg));
                            };
                            
                            // Add timeout for large images
                            setTimeout(() => {
                                reject(new Error(`Image processing timeout: ${file.name}`));
                            }, 30000); // 30 second timeout
                            
                            img.src = URL.createObjectURL(file);
                        });
                    }

                    // For videos, convert directly to base64
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        
                        reader.onload = () => {
                            resolve(reader.result as string);
                        };
                        
                        reader.onerror = () => {
                            const errorMsg = `Failed to read file: ${file.name}`;
                            toast.error(errorMsg);
                            reject(new Error(errorMsg));
                        };
                        
                        reader.readAsDataURL(file);
                    });
                } catch (error) {
                    toast.dismiss();
                    console.error('Upload error:', error);
                    const errorMsg = `Failed to upload file: ${file.name}`;
                    toast.error(errorMsg);
                    throw new Error(errorMsg);
                }
            }
        });

        setEditor(blockNoteEditor);
        setGlobalEditor(blockNoteEditor);

        return () => {
            // Cleanup if needed - BlockNoteEditor doesn't have destroy method
            setEditor(null);
            setGlobalEditor(null);
        };
    }, [doc, provider, userInfo?.name, userInfo?.email, setGlobalEditor]);

    if (!editor) {
        return (
            <div className="relative max-w-6xl mx-auto bg-gray-800 min-h-screen p-6 flex items-center justify-center">
                <div className="text-white flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading editor...
                </div>
            </div>
        );
    }

  return (
        <div className="relative max-w-6xl mx-auto bg-gray-800">
    <BlockNoteView
    editor={editor}
    editable={true}
    theme="dark"
    className="min-h-screen p-6"
    />
    </div>
    );
}

function Editor() {
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<LiveblocksYjsProvider>();
    
    useEffect(()=>{
       const yDoc = new Y.Doc();
       const yProvider = new LiveblocksYjsProvider(room,yDoc);
       setDoc(yDoc);
       setProvider(yProvider);
       return ()=>{
        yDoc?.destroy();
        yProvider?.destroy();
       }
    },[room])
    if (!doc || !provider) {
        return (
            <div className="flex-1 max-w-6xl mx-auto flex items-center justify-center min-h-screen">
                <div className="text-white flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connecting to document...
                </div>
            </div>
        );
    }
  return (
    <div className ="flex-1 max-w-6xl mx-auto justify-between items-center mb-5 ">
        {/* <TranslateDocument doc= {doc}/> */}

        <div className = "flex items-center gap-5 justify-end mb-10">
        
        </div>
        {/* TranslateDocument AI */}
        {/* ChatToDocument AI */}
        {/* BlockNote */}

        <BlockNote doc={doc} provider={provider} />

    </div>
  )
}

export default Editor