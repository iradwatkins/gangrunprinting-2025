import React, { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { EmailBlock, EmailDesign, EmailTemplate } from '../../types/email';
import { 
  Type, 
  Image, 
  MousePointer, 
  Package, 
  Minus, 
  Share2, 
  Palette, 
  Settings, 
  Eye, 
  Save,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';

interface EmailBuilderProps {
  template?: EmailTemplate;
  onSave: (template: Partial<EmailTemplate>) => void;
  onPreview: (template: Partial<EmailTemplate>) => void;
}

const BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'button', label: 'Button', icon: MousePointer },
  { type: 'product', label: 'Product', icon: Package },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'social', label: 'Social', icon: Share2 },
] as const;

const EmailBuilder: React.FC<EmailBuilderProps> = ({ template, onSave, onPreview }) => {
  const [design, setDesign] = useState<EmailDesign>(template?.design_json || {
    version: '1.0',
    blocks: [],
    settings: {
      background_color: '#ffffff',
      content_width: 600,
      font_family: 'Arial, sans-serif',
      font_size: 14,
    }
  });

  const [selectedBlock, setSelectedBlock] = useState<EmailBlock | null>(null);
  const [templateSettings, setTemplateSettings] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'marketing',
    subject_line: template?.subject_line || '',
    preview_text: template?.preview_text || '',
  });

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedBlock = design.blocks[dragIndex];
    const newBlocks = [...design.blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, draggedBlock);
    
    setDesign(prev => ({
      ...prev,
      blocks: newBlocks.map((block, index) => ({ ...block, position: index }))
    }));
  }, [design.blocks]);

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      position: design.blocks.length,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };

    setDesign(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (blockId: string, updates: Partial<EmailBlock>) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    }));
  };

  const deleteBlock = (blockId: string) => {
    setDesign(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
    setSelectedBlock(null);
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = design.blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock: EmailBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}`,
      position: design.blocks.length,
    };

    setDesign(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const handleSave = () => {
    const templateData: Partial<EmailTemplate> = {
      ...templateSettings,
      design_json: design,
      html_content: generateHtmlContent(),
      text_content: generateTextContent(),
    };
    onSave(templateData);
  };

  const handlePreview = () => {
    const templateData: Partial<EmailTemplate> = {
      ...templateSettings,
      design_json: design,
      html_content: generateHtmlContent(),
      text_content: generateTextContent(),
    };
    onPreview(templateData);
  };

  const generateHtmlContent = (): string => {
    // This would generate the actual HTML email content based on the design
    return `
      <html>
        <head>
          <style>
            body { font-family: ${design.settings.font_family}; font-size: ${design.settings.font_size}px; }
            .email-container { max-width: ${design.settings.content_width}px; margin: 0 auto; background-color: ${design.settings.background_color}; }
          </style>
        </head>
        <body>
          <div class="email-container">
            ${design.blocks.map(block => generateBlockHtml(block)).join('')}
          </div>
        </body>
      </html>
    `;
  };

  const generateTextContent = (): string => {
    return design.blocks
      .filter(block => block.type === 'text')
      .map(block => block.content.text || '')
      .join('\n\n');
  };

  const generateBlockHtml = (block: EmailBlock): string => {
    switch (block.type) {
      case 'text':
        return `<div style="padding: 10px;">${block.content.text || ''}</div>`;
      case 'image':
        return `<div style="padding: 10px; text-align: center;"><img src="${block.content.src || ''}" alt="${block.content.alt || ''}" style="max-width: 100%;" /></div>`;
      case 'button':
        return `<div style="padding: 10px; text-align: center;"><a href="${block.content.url || '#'}" style="display: inline-block; padding: 12px 24px; background-color: ${block.styles.backgroundColor || '#007bff'}; color: white; text-decoration: none; border-radius: 4px;">${block.content.text || 'Button'}</a></div>`;
      case 'divider':
        return `<div style="padding: 10px;"><hr style="border: none; height: 1px; background-color: #e9ecef;" /></div>`;
      default:
        return '';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="email-builder h-screen flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Email Builder</h2>
          </div>
          
          <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blocks">Blocks</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blocks" className="flex-1 p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Add Elements</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(type)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Icon size={16} />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={design.settings.background_color}
                    onChange={(e) => setDesign(prev => ({
                      ...prev,
                      settings: { ...prev.settings, background_color: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Content Width</Label>
                  <Input
                    type="number"
                    value={design.settings.content_width}
                    onChange={(e) => setDesign(prev => ({
                      ...prev,
                      settings: { ...prev.settings, content_width: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label>Font Family</Label>
                  <Select
                    value={design.settings.font_family}
                    onValueChange={(value) => setDesign(prev => ({
                      ...prev,
                      settings: { ...prev.settings, font_family: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font Size</Label>
                  <Input
                    type="number"
                    value={design.settings.font_size}
                    onChange={(e) => setDesign(prev => ({
                      ...prev,
                      settings: { ...prev.settings, font_size: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={templateSettings.name}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={templateSettings.description}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={templateSettings.category}
                    onValueChange={(value) => setTemplateSettings(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject Line</Label>
                  <Input
                    value={templateSettings.subject_line}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, subject_line: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Preview Text</Label>
                  <Input
                    value={templateSettings.preview_text}
                    onChange={(e) => setTemplateSettings(prev => ({ ...prev, preview_text: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {design.blocks.length} blocks
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye size={16} />
                Preview
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save size={16} />
                Save
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-8 bg-gray-100">
            <div 
              className="mx-auto bg-white shadow-lg"
              style={{ width: design.settings.content_width }}
            >
              <EmailCanvas 
                blocks={design.blocks}
                onBlockSelect={setSelectedBlock}
                onBlockUpdate={updateBlock}
                onBlockDelete={deleteBlock}
                onBlockDuplicate={duplicateBlock}
                onBlockMove={moveBlock}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Properties Panel */}
        {selectedBlock && (
          <div className="w-80 border-l bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Block Properties</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBlock(null)}
              >
                ×
              </Button>
            </div>
            <BlockEditor
              block={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
            />
          </div>
        )}
      </div>
    </DndProvider>
  );
};

// Canvas component for drag-and-drop
const EmailCanvas: React.FC<{
  blocks: EmailBlock[];
  onBlockSelect: (block: EmailBlock) => void;
  onBlockUpdate: (id: string, updates: Partial<EmailBlock>) => void;
  onBlockDelete: (id: string) => void;
  onBlockDuplicate: (id: string) => void;
  onBlockMove: (dragIndex: number, hoverIndex: number) => void;
}> = ({ blocks, onBlockSelect, onBlockUpdate, onBlockDelete, onBlockDuplicate, onBlockMove }) => {
  const [, drop] = useDrop({
    accept: 'block',
    drop: () => ({}),
  });

  return (
    <div ref={drop} className="min-h-96">
      {blocks.map((block, index) => (
        <DraggableBlock
          key={block.id}
          block={block}
          index={index}
          onSelect={onBlockSelect}
          onUpdate={onBlockUpdate}
          onDelete={onBlockDelete}
          onDuplicate={onBlockDuplicate}
          onMove={onBlockMove}
        />
      ))}
    </div>
  );
};

// Draggable block component
const DraggableBlock: React.FC<{
  block: EmailBlock;
  index: number;
  onSelect: (block: EmailBlock) => void;
  onUpdate: (id: string, updates: Partial<EmailBlock>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}> = ({ block, index, onSelect, onUpdate, onDelete, onDuplicate, onMove }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'block',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`group relative border-2 border-transparent hover:border-blue-300 ${isDragging ? 'opacity-50' : ''}`}
      onClick={() => onSelect(block)}
    >
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md rounded-bl-md">
        <div className="flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(block.id);
            }}
          >
            <Copy size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
      
      <BlockRenderer block={block} />
    </div>
  );
};

// Block renderer component
const BlockRenderer: React.FC<{ block: EmailBlock }> = ({ block }) => {
  const { type, content, styles } = block;

  switch (type) {
    case 'text':
      return (
        <div className="p-4" style={styles}>
          <div dangerouslySetInnerHTML={{ __html: content.text || 'Enter your text here...' }} />
        </div>
      );
    case 'image':
      return (
        <div className="p-4 text-center" style={styles}>
          {content.src ? (
            <img src={content.src} alt={content.alt || ''} className="max-w-full h-auto" />
          ) : (
            <div className="border-2 border-dashed border-gray-300 p-8 text-gray-500">
              Click to add image
            </div>
          )}
        </div>
      );
    case 'button':
      return (
        <div className="p-4 text-center" style={styles}>
          <button
            className="px-6 py-3 rounded text-white font-medium"
            style={{ backgroundColor: styles.backgroundColor || '#007bff' }}
          >
            {content.text || 'Button Text'}
          </button>
        </div>
      );
    case 'divider':
      return (
        <div className="p-4" style={styles}>
          <hr className="border-gray-300" />
        </div>
      );
    default:
      return <div className="p-4">Unknown block type: {type}</div>;
  }
};

// Block editor component
const BlockEditor: React.FC<{
  block: EmailBlock;
  onUpdate: (updates: Partial<EmailBlock>) => void;
}> = ({ block, onUpdate }) => {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...block.content, [key]: value }
    });
  };

  const updateStyles = (key: string, value: any) => {
    onUpdate({
      styles: { ...block.styles, [key]: value }
    });
  };

  switch (block.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <div>
            <Label>Text Content</Label>
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => updateContent('text', e.target.value)}
              placeholder="Enter your text here..."
            />
          </div>
          <div>
            <Label>Text Color</Label>
            <Input
              type="color"
              value={block.styles.color || '#000000'}
              onChange={(e) => updateStyles('color', e.target.value)}
            />
          </div>
          <div>
            <Label>Text Align</Label>
            <Select
              value={block.styles.textAlign || 'left'}
              onValueChange={(value) => updateStyles('textAlign', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <Label>Image URL</Label>
            <Input
              value={block.content.src || ''}
              onChange={(e) => updateContent('src', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <Label>Alt Text</Label>
            <Input
              value={block.content.alt || ''}
              onChange={(e) => updateContent('alt', e.target.value)}
              placeholder="Image description"
            />
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="space-y-4">
          <div>
            <Label>Button Text</Label>
            <Input
              value={block.content.text || ''}
              onChange={(e) => updateContent('text', e.target.value)}
              placeholder="Button Text"
            />
          </div>
          <div>
            <Label>Button URL</Label>
            <Input
              value={block.content.url || ''}
              onChange={(e) => updateContent('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={block.styles.backgroundColor || '#007bff'}
              onChange={(e) => updateStyles('backgroundColor', e.target.value)}
            />
          </div>
        </div>
      );
    default:
      return <div>No properties available for this block type.</div>;
  }
};

// Helper functions
const getDefaultContent = (type: EmailBlock['type']): Record<string, any> => {
  switch (type) {
    case 'text':
      return { text: 'Enter your text here...' };
    case 'image':
      return { src: '', alt: '' };
    case 'button':
      return { text: 'Button Text', url: '#' };
    case 'divider':
      return {};
    default:
      return {};
  }
};

const getDefaultStyles = (type: EmailBlock['type']): Record<string, any> => {
  switch (type) {
    case 'text':
      return { color: '#000000', textAlign: 'left' };
    case 'image':
      return { textAlign: 'center' };
    case 'button':
      return { backgroundColor: '#007bff', textAlign: 'center' };
    case 'divider':
      return {};
    default:
      return {};
  }
};

export default EmailBuilder;