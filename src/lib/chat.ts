import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  where,
  doc,
  getDoc,
  collectionGroup,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

// Типы для чатов и сообщений
export type Message = {
  id: string;
  content: string;
  senderId: string;
  chatId: string;
  timestamp: string;
  mediaUrl?: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  isOwn?: boolean; // Для отображения на клиенте
};

export type Chat = {
  id: string;
  participantIds: string[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  participants?: {
    id: string;
    name: string;
    avatar: string;
  }[];
};

// Получить список чатов пользователя
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(chatsQuery);
    const chats: Chat[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const chatData = docSnapshot.data() as Chat;
      const chatId = docSnapshot.id;
      
      // Получить информацию об участниках чата
      const participants = [];
      for (const participantId of chatData.participantIds) {
        if (participantId !== userId) {
          const userDoc = await getDoc(doc(db, 'users', participantId));
          const userData = userDoc.data();
          participants.push({
            id: userData?.uid,
            name: userData?.displayName,
            avatar: userData?.photoURL
          });
        }
      }
      
      // Получить последнее сообщение
      const messagesQuery = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('timestamp', 'desc'),
        where('chatId', '==', chatId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      let lastMessage = undefined;
      
      if (!messagesSnapshot.empty) {
        const latestMessage = messagesSnapshot.docs[0].data();
        lastMessage = {
          content: latestMessage.content,
          timestamp: latestMessage.timestamp.toDate().toISOString()
        };
      }
      
      chats.push({
        id: chatId,
        participantIds: chatData.participantIds,
        participants,
        lastMessage
      });
    }
    
    return chats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Создать новый чат между пользователями
export const createChat = async (userIds: string[]): Promise<string> => {
  try {
    // Проверяем, существует ли уже чат между этими пользователями
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participantIds', '==', userIds.sort())
    );
    
    const querySnapshot = await getDocs(chatsQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    // Создать новый чат
    const chatRef = await addDoc(collection(db, 'chats'), {
      participantIds: userIds.sort(),
      createdAt: Timestamp.now()
    });
    
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// Отправить сообщение в чат
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  content: string, 
  mediaFile?: File
): Promise<string> => {
  try {
    let mediaUrl = undefined;
    
    // Загрузить медиафайл, если он есть
    if (mediaFile) {
      const storageRef = ref(storage, `chats/${chatId}/${Date.now()}_${mediaFile.name}`);
      await uploadBytes(storageRef, mediaFile);
      mediaUrl = await getDownloadURL(storageRef);
    }
    
    // Создать сообщение
    const messageData = {
      chatId,
      senderId,
      content,
      mediaUrl,
      timestamp: Timestamp.now()
    };
    
    const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Получить сообщения из чата
export const getChatMessages = async (chatId: string, currentUserId: string): Promise<Message[]> => {
  try {
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    const querySnapshot = await getDocs(messagesQuery);
    const messages: Message[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const messageData = docSnapshot.data();
      const senderId = messageData.senderId;
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      
      messages.push({
        id: docSnapshot.id,
        content: messageData.content,
        senderId,
        chatId,
        timestamp: messageData.timestamp.toDate().toISOString(),
        mediaUrl: messageData.mediaUrl,
        sender: {
          id: senderData?.uid,
          name: senderData?.displayName,
          avatar: senderData?.photoURL
        },
        isOwn: senderId === currentUserId
      });
    }
    
    return messages;
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Подписаться на новые сообщения в чате
export const subscribeToChatMessages = (
  chatId: string, 
  currentUserId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesQuery = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(messagesQuery, async (querySnapshot: QuerySnapshot<DocumentData>) => {
    const messages: Message[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const messageData = docSnapshot.data();
      const senderId = messageData.senderId;
      
      // Получаем данные отправителя, если они еще не кэшированы
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      
      messages.push({
        id: docSnapshot.id,
        content: messageData.content,
        senderId,
        chatId,
        timestamp: messageData.timestamp.toDate().toISOString(),
        mediaUrl: messageData.mediaUrl,
        sender: {
          id: senderData?.uid,
          name: senderData?.displayName,
          avatar: senderData?.photoURL
        },
        isOwn: senderId === currentUserId
      });
    }
    
    callback(messages);
  });
}; 