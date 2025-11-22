import express from 'express';
import * as admissionController from '../controllers/admissionController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.post(
  '/applicants',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  admissionController.createApplicant
);

router.get(
  '/applicants',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  admissionController.getApplicants
);

router.get(
  '/applicants/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  admissionController.getApplicantById
);

router.put(
  '/applicants/:id',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  admissionController.updateApplicant
);

router.delete(
  '/applicants/:id',
  authenticate,
  authorize('ADMIN'),
  admissionController.deleteApplicant
);

router.post(
  '/applicants/:id/decision',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  admissionController.makeAdmissionDecision
);

router.post(
  '/applicants/:id/convert',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  admissionController.convertToStudent
);

export default router;
