import { useState, useRef } from 'react';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface CreatePostFormProps {
  onSubmit: (content: string, files: File[]) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreatePostForm({ onSubmit, isSubmitting }: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
      
      // Создаем URL для превью
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    // Освобождаем URL для предотвращения утечек памяти
    URL.revokeObjectURL(previews[index]);
    
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      await onSubmit(content, files);
      
      // Сброс формы после успешной отправки
      setContent('');
      setFiles([]);
      
      // Освобождаем URL для превью
      previews.forEach(preview => URL.revokeObjectURL(preview));
      setPreviews([]);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="mb-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="О чем вы думаете?"
          rows={3}
          value={content}
          onChange={handleContentChange}
          required
          disabled={isSubmitting}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"
                onClick={() => removeFile(index)}
                disabled={isSubmitting}
              >
                <FaTimes />
              </button>
              
              {files[index]?.type.startsWith('image/') ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <video
                  src={preview}
                  className="w-full aspect-video rounded-lg object-cover"
                  controls
                />
              )}
            </div>
          ))}
        </div>
      )}
            
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
            multiple
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <FaImage className="text-xl" />
          </button>
          
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="video/*"
            multiple
            disabled={isSubmitting}
          />
          <button
            type="button"
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50"
            onClick={() => videoInputRef.current?.click()}
            disabled={isSubmitting}
          >
            <FaVideo className="text-xl" />
          </button>
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={isSubmitting || (content.trim() === '' && files.length === 0)}
        >
          {isSubmitting ? 'Публикация...' : 'Опубликовать'}
        </button>
      </div>
    </form>
  );
} 