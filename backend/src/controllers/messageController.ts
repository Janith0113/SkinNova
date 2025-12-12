import { Request, Response } from 'express';
import messageService from '../services/messageService';
import { AuthRequest } from '../middleware/authMiddleware';

export class MessageController {
  // Get or create conversation
  async getOrCreateConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: user missing' });
        return;
      }
      if (!otherUserId) {
        res.status(400).json({ error: 'otherUserId is required' });
        return;
      }

      const conversation = await messageService.getOrCreateConversation(userId, otherUserId);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get or create conversation' });
    }
  }

  // Send message
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { conversationId, content, attachmentUrl } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role as 'doctor' | 'patient';

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: user missing' });
        return;
      }
      if (!conversationId) {
        res.status(400).json({ error: 'conversationId is required' });
        return;
      }
      if (!content || typeof content !== 'string') {
        res.status(400).json({ error: 'content is required' });
        return;
      }

      const message = await messageService.sendMessage(
        conversationId,
        userId,
        userRole,
        content,
        attachmentUrl
      );

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  // Get messages
  async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { limit = '50', skip = '0' } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: user missing' });
        return;
      }
      if (!conversationId) {
        res.status(400).json({ error: 'conversationId is required' });
        return;
      }

      const messages = await messageService.getMessages(
        conversationId,
        parseInt(limit as string, 10),
        parseInt(skip as string, 10)
      );

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // Get conversations
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: user missing' });
        return;
      }

      const conversations = await messageService.getConversationsForUser(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  // Mark as read
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: user missing' });
        return;
      }
      if (!conversationId) {
        res.status(400).json({ error: 'conversationId is required' });
        return;
      }

      await messageService.markAsRead(conversationId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }

  // Get unread count
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: user missing' });
        return;
      }
      if (!conversationId) {
        res.status(400).json({ error: 'conversationId is required' });
        return;
      }

      const count = await messageService.getUnreadCount(conversationId, userId);
      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }
}

export default new MessageController();