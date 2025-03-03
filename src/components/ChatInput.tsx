import { useState, useRef, KeyboardEvent } from 'react';
import { FaPaperPlane, FaImage } from 'react-icons/fa';

type ChatInputProps = {
  onSendMessage: (content: string, file?: File) => void;
};

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() !== '' || file) {
      onSendMessage(message, file || undefined);
      setMessage('');
      setFile(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
      {file && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex justify-between items-center">
          <span className="text-sm truncate">{file.name}</span>
          <button 
            type="button" 
            className="text-red-500 ml-2"
            onClick={() => setFile(null)}
          >
            Удалить
          </button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <button 
          type="button"
          className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaImage />
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*"
          />
        </button>
        
        <textarea
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Введите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        
        <button 
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
          disabled={message.trim() === '' && !file}
        >
          <FaPaperPlane />
        </button>
      </div>
    </form>
  );
} 