import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { FiImage, FiLink, FiSmile, FiBold, FiItalic, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';

interface DealEditorProps {
  initialContent?: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const DealEditor: React.FC<DealEditorProps> = ({
  initialContent = '',
  onContentChange,
  placeholder = 'Enter deal description...',
  minHeight = '150px'
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkPreview, setLinkPreview] = useState<null | {
    url: string;
    title: string;
    description: string;
    image: string;
  }>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Handle clicks outside of emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        event.target instanceof Element &&
        !event.target.closest('.emoji-trigger')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle editor content changes
  const handleEditorChange = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (editorRef.current) {
      // Insert emoji at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const emoji = document.createTextNode(emojiData.emoji);
        range.insertNode(emoji);

        // Move cursor after the inserted emoji
        range.setStartAfter(emoji);
        range.setEndAfter(emoji);
        selection.removeAllRanges();
        selection.addRange(range);

        handleEditorChange();
        editorRef.current.focus();
      } else {
        // If no selection, append to the end
        editorRef.current.innerHTML += emojiData.emoji;
        handleEditorChange();
      }
    }

    setShowEmojiPicker(false);
  };

  // Format text (bold, italic, etc.)
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleEditorChange();
      editorRef.current.focus();
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && e.target.result) {
        // Insert image at cursor position
        const imgHtml = `<img src="${e.target.result}" alt="Uploaded image" style="max-width: 100%; margin: 10px 0;" />`;

        if (editorRef.current) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = imgHtml;
            const imageNode = tempDiv.firstChild;

            if (imageNode) {
              range.insertNode(imageNode);
              range.setStartAfter(imageNode);
              range.setEndAfter(imageNode);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } else {
            editorRef.current.innerHTML += imgHtml;
          }

          handleEditorChange();
        }
      }
    };

    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle link insertion
  const insertLink = () => {
    if (!linkUrl.trim()) return;

    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`;

    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = linkHtml;
        const linkNode = tempDiv.firstChild;

        if (linkNode) {
          range.deleteContents();
          range.insertNode(linkNode);
          range.setStartAfter(linkNode);
          range.setEndAfter(linkNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        editorRef.current.innerHTML += linkHtml;
      }

      handleEditorChange();
    }

    // Reset link input
    setLinkUrl('');
    setLinkText('');
    setShowLinkInput(false);
  };

  // Generate link preview
  const generateLinkPreview = async (url: string) => {
    if (!url.trim() || !url.startsWith('http')) return;

    setIsPreviewLoading(true);

    try {
      // In a real implementation, you would call your backend API to fetch link metadata
      // For this demo, we'll simulate a response after a brief delay
      setTimeout(() => {
        // Simulated preview data
        setLinkPreview({
          url: url,
          title: 'Sample Link Title',
          description: 'This is a sample description for the link preview feature.',
          image: 'https://via.placeholder.com/300x200?text=Link+Preview'
        });

        setIsPreviewLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating link preview:', error);
      setIsPreviewLoading(false);
    }
  };

  // Insert link preview
  const insertLinkPreview = () => {
    if (!linkPreview) return;

    const previewHtml = `
      <div class="link-preview" style="border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; margin: 10px 0; max-width: 100%;">
        ${linkPreview.image ? `<img src="${linkPreview.image}" alt="${linkPreview.title}" style="width: 100%; max-height: 200px; object-fit: cover;" />` : ''}
        <div style="padding: 12px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${linkPreview.title}</div>
          <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">${linkPreview.description}</div>
          <a href="${linkPreview.url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.8em; color: #0066cc;">${linkPreview.url}</a>
        </div>
      </div>
    `;

    if (editorRef.current) {
      editorRef.current.innerHTML += previewHtml;
      handleEditorChange();
    }

    // Reset link input and preview
    setLinkUrl('');
    setLinkText('');
    setLinkPreview(null);
    setShowLinkInput(false);
  };

  return (
    <div className="deal-editor border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="editor-toolbar flex items-center p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 rounded hover:bg-gray-200"
          title="Bold"
        >
          <FiBold />
        </button>

        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 rounded hover:bg-gray-200"
          title="Italic"
        >
          <FiItalic />
        </button>

        <div className="border-r border-gray-300 mx-2 h-6"></div>

        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          <FiList />
        </button>

        <div className="border-r border-gray-300 mx-2 h-6"></div>

        <button
          type="button"
          onClick={() => formatText('justifyLeft')}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Left"
        >
          <FiAlignLeft />
        </button>

        <button
          type="button"
          onClick={() => formatText('justifyCenter')}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Center"
        >
          <FiAlignCenter />
        </button>

        <button
          type="button"
          onClick={() => formatText('justifyRight')}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Right"
        >
          <FiAlignRight />
        </button>

        <div className="border-r border-gray-300 mx-2 h-6"></div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Image"
        >
          <FiImage />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => setShowLinkInput(true)}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Link"
        >
          <FiLink />
        </button>

        <div className="relative emoji-trigger">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Emoji"
          >
            <FiSmile />
          </button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute z-10 top-full left-0 mt-1"
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="p-3 bg-gray-50 border-b border-gray-300">
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                if (e.target.value.startsWith('http')) {
                  generateLinkPreview(e.target.value);
                } else {
                  setLinkPreview(null);
                }
              }}
              placeholder="Enter URL"
              className="px-3 py-2 border border-gray-300 rounded"
            />

            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Link text (optional)"
              className="px-3 py-2 border border-gray-300 rounded"
            />

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert Link
              </button>

              {linkPreview && (
                <button
                  type="button"
                  onClick={insertLinkPreview}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Insert Preview
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                  setLinkText('');
                  setLinkPreview(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Link Preview */}
          {isPreviewLoading && (
            <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-md bg-slate-200 h-20 w-20"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {linkPreview && !isPreviewLoading && (
            <div className="mt-3 border border-gray-200 rounded overflow-hidden">
              <div className="flex">
                {linkPreview.image && (
                  <div className="w-20 h-20">
                    <img
                      src={linkPreview.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="font-medium">{linkPreview.title}</div>
                  <div className="text-sm text-gray-600">{linkPreview.description}</div>
                  <div className="text-xs text-blue-600 mt-1">{linkPreview.url}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="editor-content p-4"
        contentEditable
        onInput={handleEditorChange}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        placeholder={placeholder}
        style={{ minHeight }}
      ></div>
    </div>
  );
};

export default DealEditor;
