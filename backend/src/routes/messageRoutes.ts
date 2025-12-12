import { Router } from 'express';
import messageController from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/conversation', messageController.getOrCreateConversation);
router.post('/send', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/:conversationId/messages', messageController.getMessages);
router.post('/mark-read', messageController.markAsRead);
router.get('/:conversationId/unread', messageController.getUnreadCount);

export default router;