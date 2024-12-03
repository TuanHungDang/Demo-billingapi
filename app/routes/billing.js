import express from 'express';
import { getSubscriptionStatus } from '../models/Subscription.server';

const router = express.Router();

router.post('/billing', async (req, res) => {
    try {
        const result = await getSubscriptionStatus(req.shopify.graphql);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
