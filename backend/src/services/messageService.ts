import Message, { IMessage } from '../models/Message';
import Conversation, { IConversation } from '../models/Conversation';
import mongoose from 'mongoose';

export class MessageService {
  // Get or create conversation
  async getOrCreateConversation(patientId: string, doctorId: string): Promise<IConversation> {
    let conversation = await Conversation.findOne({
      $or: [
        { patientId, doctorId },
        { patientId: doctorId, doctorId: patientId },
      ],
    });

    if (!conversation) {
      conversation = new Conversation({
        patientId,
        doctorId,
      });
      await conversation.save();
    }

    return conversation;
  }

  // Send message
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderRole: 'doctor' | 'patient',
    content: string,
    attachmentUrl?: string
  ): Promise<IMessage> {
    const message = new Message({
      conversationId,
      senderId,
      senderRole,
      content,
      attachmentUrl,
    });

    await message.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      lastMessage: content,
    });

    return message;
  }

  // Get messages for conversation
  async getMessages(conversationId: string, limit: number = 50, skip: number = 0): Promise<IMessage[]> {
    return Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }

  // Get all conversations for user
  async getConversationsForUser(userId: string): Promise<IConversation[]> {
    return Conversation.find({
      $or: [{ patientId: userId }, { doctorId: userId }],
    }).sort({ lastMessageAt: -1 });
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await Message.updateMany(
      { conversationId, senderId: { $ne: userId } },
      { isRead: true }
    );
  }

  // Get unread message count
  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return Message.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    });
  }
}

export default new MessageService();