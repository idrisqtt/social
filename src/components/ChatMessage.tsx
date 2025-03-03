import Image from 'next/image';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type ChatMessageProps = {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  isOwn: boolean;
};

export default function ChatMessage({ content, sender, timestamp, isOwn }: ChatMessageProps) {
  const messageTime = new Date(timestamp);
  
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && (
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
          <Image 
            src={sender.avatar} 
            alt={sender.name} 
            fill 
            className="object-cover"
          />
        </div>
      )}
      
      <div 
        className={`rounded-lg py-2 px-4 max-w-[70%] break-words ${
          isOwn 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-200 text-gray-900 rounded-tl-none'
        }`}
      >
        {!isOwn && (
          <div className="text-xs font-semibold mb-1">{sender.name}</div>
        )}
        <p>{content}</p>
        <div 
          className={`text-right text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {format(messageTime, 'HH:mm', { locale: ru })}
        </div>
      </div>
    </div>
  );
} 