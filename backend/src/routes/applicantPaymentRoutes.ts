import express from 'express';
import { applicantAuth } from '../middleware/applicantAuth';
import {
  initializeApplicationFee,
  initializeAcceptanceFee,
  verifyPayment,
  getPaymentHistory,
} from '../controllers/applicantPaymentController';

const router = express.Router();

router.use(applicantAuth);

router.post('/application-fee/initialize', initializeApplicationFee);
router.post('/acceptance-fee/initialize', initializeAcceptanceFee);
router.get('/verify/:reference', verifyPayment);
router.get('/history', getPaymentHistory);

export default router;
