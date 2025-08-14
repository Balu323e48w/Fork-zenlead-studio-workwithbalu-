import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BookContentRendererProps {
  content: string;
  images?: Array<{
    caption: string;
    data: string;
    source: string;
  }>;
  title: string;
  chapterNumber: number;
  wordCount: number;
}

interface ContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'image_placeholder' | 'separator';
  content: string;
  level?: number;
}

export const BookContentRenderer: React.FC<BookContentRendererProps> = ({ 
  content, 
  images = [], 
  title, 
  chapterNumber, 
  wordCount 
}) => {
  
  const parseContent = (text: string): ContentBlock[] => {
    const lines = text.split('\n');
    const blocks: ContentBlock[] = [];
    let imageIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'separator') {
          blocks.push({ type: 'separator', content: '' });
        }
        continue;
      }
      
      // Handle headings
      if (line.startsWith('### ')) {
        blocks.push({
          type: 'heading',
          content: line.replace('### ', ''),
          level: 3
        });
      } else if (line.startsWith('## ')) {
        blocks.push({
          type: 'heading',
          content: line.replace('## ', ''),
          level: 2
        });
        
        // Add image after section headings if available
        if (images[imageIndex]) {
          blocks.push({
            type: 'image_placeholder',
            content: `IMAGE_${imageIndex}`
          });
          imageIndex++;
        }
      } else if (line.startsWith('# ')) {
        blocks.push({
          type: 'heading',
          content: line.replace('# ', ''),
          level: 1
        });
      } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        // Handle list items
        const listItems = [line];
        
        // Collect consecutive list items
        while (i + 1 < lines.length && 
               (lines[i + 1].trim().startsWith('- ') || 
                lines[i + 1].trim().startsWith('• ') || 
                lines[i + 1].trim().startsWith('* '))) {
          i++;
          listItems.push(lines[i].trim());
        }
        
        blocks.push({
          type: 'list',
          content: listItems.join('\n')
        });
      } else if (line.includes('[IMAGE_SUGGESTION:')) {
        // Handle image suggestions from content
        if (images[imageIndex]) {
          blocks.push({
            type: 'image_placeholder',
            content: `IMAGE_${imageIndex}`
          });
          imageIndex++;
        }
      } else {
        // Regular paragraph
        blocks.push({
          type: 'paragraph',
          content: line
        });
      }
    }
    
    return blocks;
  };

  const formatText = (text: string): string => {
    // Handle bold text
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '$1');
    // Handle italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '$1');
    // Handle code blocks
    formatted = formatted.replace(/`(.*?)`/g, '$1');
    
    return formatted;
  };

  const contentBlocks = parseContent(content);

  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Chapter {chapterNumber}: {title}
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Badge variant="secondary">{wordCount.toLocaleString()} words</Badge>
          <Badge variant="outline">{images.length} images</Badge>
          <span>~{Math.round(wordCount / 250)} min read</span>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="prose prose-lg max-w-none">
        {contentBlocks.map((block, index) => {
          switch (block.type) {
            case 'heading':
              const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
              const headingClass = {
                1: 'text-2xl font-bold text-gray-900 mt-8 mb-4',
                2: 'text-xl font-semibold text-gray-800 mt-6 mb-3',
                3: 'text-lg font-medium text-gray-700 mt-4 mb-2'
              }[block.level!] || 'text-lg font-medium text-gray-700 mt-4 mb-2';
              
              return (
                <HeadingTag key={index} className={headingClass}>
                  {formatText(block.content)}
                </HeadingTag>
              );

            case 'paragraph':
              return (
                <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify">
                  {formatText(block.content)}
                </p>
              );

            case 'list':
              const listItems = block.content.split('\n').map(item => 
                item.replace(/^[-•*]\s*/, '').trim()
              );
              
              return (
                <ul key={index} className="list-disc list-inside space-y-2 mb-4 ml-4">
                  {listItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">
                      {formatText(item)}
                    </li>
                  ))}
                </ul>
              );

            case 'image_placeholder':
              const imageIdx = parseInt(block.content.replace('IMAGE_', ''));
              const image = images[imageIdx];
              
              if (image) {
                return (
                  <div key={index} className="my-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <img 
                        src={image.data} 
                        alt={image.caption}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                      <div className="p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 italic text-center">
                          Figure {imageIdx + 1}: {image.caption}
                        </p>
                        {image.source && (
                          <p className="text-xs text-gray-500 text-center mt-1">
                            Source: {image.source}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;

            case 'separator':
              return <Separator key={index} className="my-6" />;

            default:
              return null;
          }
        })}
      </div>

      {/* Remaining Images */}
      {images.length > contentBlocks.filter(b => b.type === 'image_placeholder').length && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Additional Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.slice(contentBlocks.filter(b => b.type === 'image_placeholder').length).map((image, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img 
                  src={image.data} 
                  alt={image.caption}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600 italic">
                    {image.caption}
                  </p>
                  {image.source && (
                    <p className="text-xs text-gray-500 mt-1">
                      Source: {image.source}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
