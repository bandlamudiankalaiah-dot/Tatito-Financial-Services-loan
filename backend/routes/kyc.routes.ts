import { Router } from 'express';
import type { Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { kycAdapter } from '../../integrations/index.ts';

const router = Router();

// GET /api/kyc/status
router.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const records = await dbRepository.kyc.getByUserId(req.user!.userId);
    const isPanVerified = records.some((r: any) => r.document_type === 'pan' && r.verification_status === 'verified');
    const isAadhaarVerified = records.some((r: any) => r.document_type === 'aadhaar' && r.verification_status === 'verified');
    const hasSandboxRecords = records.some((r: any) => r.verification_status === 'sandbox_simulated');

    return res.json({
      user_id: req.user!.userId,
      is_fully_compliant: isPanVerified && isAadhaarVerified,
      pan_verified: isPanVerified,
      aadhaar_verified: isAadhaarVerified,
      has_sandbox_records: hasSandboxRecords,
      compliance_status: (isPanVerified && isAadhaarVerified) ? 'COMPLIANT_LIVE' : (hasSandboxRecords ? 'SANDBOX_UNVERIFIED' : 'PENDING'),
      records
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/kyc/verify-pan
router.post('/verify-pan', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pan_number, full_name, dob } = req.body;
    if (!pan_number || pan_number.length !== 10) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Valid 10-character alphanumeric PAN required' });
    }

    const result = await kycAdapter.verifyDocument({
      documentType: 'pan',
      documentNumber: pan_number,
      fullName: full_name || req.user!.fullName,
      dob
    });

    if (!result.isFormatValid) {
      return res.status(400).json({
        error: 'KYC Verification Failed',
        detail: result.complianceNote || 'Invalid PAN document format'
      });
    }

    const verificationStatus = (result.isLive && result.isVerified) ? 'verified' : 'sandbox_simulated';

    const record = await dbRepository.kyc.upsertRecord(
      req.user!.userId,
      'pan',
      result.maskedId,
      result.provider,
      result.complianceNote,
      verificationStatus
    );

    logAudit(req.user!.userId, 'KYC_VERIFY_PAN', 'kyc_records', String(record.id), {
      panMasked: result.maskedId,
      status: verificationStatus,
      isLive: result.isLive
    });

    return res.json({
      status: result.status,
      is_live_verified: result.isLive && result.isVerified,
      is_mock: result.isMock,
      masked: result.maskedId,
      provider: result.provider,
      environment: result.environment,
      compliance_note: result.complianceNote
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/kyc/verify-aadhaar-otp (and alias /verify-aadhaar)
router.post(['/verify-aadhaar-otp', '/verify-aadhaar'], requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { aadhaar_number, otp } = req.body;
    if (!aadhaar_number || aadhaar_number.length < 12) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Valid 12-digit Aadhaar number required' });
    }

    const result = await kycAdapter.verifyDocument({
      documentType: 'aadhaar',
      documentNumber: aadhaar_number,
      fullName: req.user!.fullName,
      otp: otp || '123456'
    });

    if (!result.isFormatValid) {
      return res.status(400).json({
        error: 'KYC Verification Failed',
        detail: result.complianceNote || 'Invalid Aadhaar format'
      });
    }

    const verificationStatus = (result.isLive && result.isVerified) ? 'verified' : 'sandbox_simulated';

    const record = await dbRepository.kyc.upsertRecord(
      req.user!.userId,
      'aadhaar',
      result.maskedId,
      result.provider,
      result.complianceNote,
      verificationStatus
    );

    logAudit(req.user!.userId, 'KYC_VERIFY_AADHAAR', 'kyc_records', String(record.id), {
      masked: result.maskedId,
      status: verificationStatus,
      isLive: result.isLive
    });

    return res.json({
      status: result.status,
      is_live_verified: result.isLive && result.isVerified,
      is_mock: result.isMock,
      masked: result.maskedId,
      provider: result.provider,
      environment: result.environment,
      compliance_note: result.complianceNote
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
