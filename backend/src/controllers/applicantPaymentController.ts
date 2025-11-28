import { Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database";
import { ApplicantAuthRequest } from "../middleware/applicantAuth";
import {
  initializePayment as paystackInitialize,
  verifyPayment as paystackVerify,
} from "../utils/paystack";
import {
  initializePayment as flutterwaveInitialize,
  verifyPayment as flutterwaveVerify,
} from "../utils/flutterwave";
import { sendEmail, sendPaymentReceiptEmail } from "../utils/email";

const APPLICATION_FEE = 20000;
const ACCEPTANCE_FEE = 50000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const paymentMethodSchema = z.object({
  method: z.enum(["PAYSTACK", "FLUTTERWAVE"], {
    required_error: "Payment method is required",
  }),
});

export const initializeApplicationFee = async (
  req: ApplicantAuthRequest,
  res: Response
) => {
  try {
    const applicantId = req.applicant?.id;
    if (!applicantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validation = paymentMethodSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
    }

    const { method } = validation.data;

    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        applicationFeePaid: true,
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    if (applicant.applicationFeePaid) {
      return res.status(400).json({ message: "Application fee already paid" });
    }

    const reference = `APP-FEE-${applicantId}-${uuidv4()}`;

    await prisma.applicantPayment.create({
      data: {
        applicantId,
        type: "APPLICATION_FEE",
        amount: APPLICATION_FEE,
        method,
        reference,
        status: "PENDING",
      },
    });

    const callbackUrl = `${FRONTEND_URL}/applicant/payment/verify?reference=${reference}`;
    let authorizationUrl: string;

    if (method === "PAYSTACK") {
      const paystackResponse = await paystackInitialize({
        email: applicant.email,
        amount: APPLICATION_FEE * 100,
        reference,
        callback_url: callbackUrl,
      });
      if (!paystackResponse.success) {
        throw new Error(
          paystackResponse.error || "Paystack initialization failed"
        );
      }
      authorizationUrl = paystackResponse.data.authorization_url;
    } else {
      const flutterwaveResponse = await flutterwaveInitialize({
        amount: APPLICATION_FEE,
        tx_ref: reference,
        currency: "NGN",
        redirect_url: callbackUrl,
        customer: {
          email: applicant.email,
          name: `${applicant.firstName} ${applicant.lastName}`,
        },
      });
      if (!flutterwaveResponse.success) {
        throw new Error(
          flutterwaveResponse.error || "Flutterwave initialization failed"
        );
      }
      authorizationUrl = flutterwaveResponse.data.link;
    }

    res.json({
      message: "Payment initialized successfully",
      data: {
        reference,
        authorizationUrl,
        amount: APPLICATION_FEE,
      },
    });
  } catch (error: any) {
    console.error("Initialize application fee error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to initialize payment" });
  }
};

export const initializeAcceptanceFee = async (
  req: ApplicantAuthRequest,
  res: Response
) => {
  try {
    const applicantId = req.applicant?.id;
    if (!applicantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validation = paymentMethodSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
    }

    const { method } = validation.data;

    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        acceptanceFeePaid: true,
        department: {
          select: {
            code: true,
          },
        },
        admissionDecision: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    if (applicant.admissionDecision?.status !== "APPROVED") {
      return res
        .status(400)
        .json({
          message:
            "Acceptance fee can only be paid after admission is approved",
        });
    }

    if (applicant.acceptanceFeePaid) {
      return res.status(400).json({ message: "Acceptance fee already paid" });
    }

    const reference = `ACC-FEE-${applicantId}-${uuidv4()}`;

    await prisma.applicantPayment.create({
      data: {
        applicantId,
        type: "ACCEPTANCE_FEE",
        amount: ACCEPTANCE_FEE,
        method,
        reference,
        status: "PENDING",
      },
    });

    const callbackUrl = `${FRONTEND_URL}/applicant/payment/verify?reference=${reference}`;
    let authorizationUrl: string;

    if (method === "PAYSTACK") {
      const paystackResponse = await paystackInitialize({
        email: applicant.email,
        amount: ACCEPTANCE_FEE * 100,
        reference,
        callback_url: callbackUrl,
      });
      if (!paystackResponse.success) {
        throw new Error(
          paystackResponse.error || "Paystack initialization failed"
        );
      }
      authorizationUrl = paystackResponse.data.authorization_url;
    } else {
      const flutterwaveResponse = await flutterwaveInitialize({
        amount: ACCEPTANCE_FEE,
        tx_ref: reference,
        currency: "NGN",
        redirect_url: callbackUrl,
        customer: {
          email: applicant.email,
          name: `${applicant.firstName} ${applicant.lastName}`,
        },
      });
      if (!flutterwaveResponse.success) {
        throw new Error(
          flutterwaveResponse.error || "Flutterwave initialization failed"
        );
      }
      authorizationUrl = flutterwaveResponse.data.link;
    }

    res.json({
      message: "Payment initialized successfully",
      data: {
        reference,
        authorizationUrl,
        amount: ACCEPTANCE_FEE,
      },
    });
  } catch (error: any) {
    console.error("Initialize acceptance fee error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to initialize payment" });
  }
};

export const verifyPayment = async (
  req: ApplicantAuthRequest,
  res: Response
) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const payment = await prisma.applicantPayment.findUnique({
      where: { reference },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            department: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "PAID") {
      return res.json({
        message: "Payment already verified",
        data: {
          status: "PAID",
          type: payment.type,
          amount: payment.amount,
          paidAt: payment.paidAt,
        },
      });
    }

    let verificationResult: any;

    if (payment.method === "PAYSTACK") {
      verificationResult = await paystackVerify(reference);
    } else {
      verificationResult = await flutterwaveVerify(reference);
    }

    const updatedPayment = await prisma.applicantPayment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        gatewayResponse: JSON.stringify(verificationResult),
      },
    });

    if (payment.type === "APPLICATION_FEE") {
      await prisma.applicant.update({
        where: { id: payment.applicantId },
        data: { applicationFeePaid: true },
      });

      const receiptUrl = `${process.env.APPLICANT_PORTAL_URL}/applicant/payments`;
      await sendPaymentReceiptEmail(
        payment.applicant.email,
        `${payment.applicant.firstName} ${payment.applicant.lastName}`,
        reference,
        payment.amount,
        receiptUrl
      );
    } else if (payment.type === "ACCEPTANCE_FEE") {
      await prisma.applicant.update({
        where: { id: payment.applicantId },
        data: { acceptanceFeePaid: true },
      });

      const year = new Date().getFullYear();
      const deptCode = payment.applicant.department?.code || "GEN";

      const lastMatric = await prisma.matricNumber.findFirst({
        where: {
          matricNo: {
            startsWith: `IMS/${year}/${deptCode}/`,
          },
        },
        orderBy: {
          matricNo: "desc",
        },
      });

      let sequence = 1;
      if (lastMatric) {
        const lastSequence = parseInt(
          lastMatric.matricNo.split("/").pop() || "0"
        );
        sequence = lastSequence + 1;
      }

      const matricNo = `IMS/${year}/${deptCode}/${sequence
        .toString()
        .padStart(5, "0")}`;

      await prisma.matricNumber.create({
        data: {
          applicantId: payment.applicantId,
          matricNo,
        },
      });

      const receiptUrl = `${process.env.APPLICANT_PORTAL_URL}/applicant/payments`;
      await sendPaymentReceiptEmail(
        payment.applicant.email,
        `${payment.applicant.firstName} ${payment.applicant.lastName}`,
        reference,
        payment.amount,
        receiptUrl,
        matricNo
      );
    }

    // Get matricNo if it's acceptance fee
    let matricNo: string | undefined;
    if (payment.type === "ACCEPTANCE_FEE") {
      const matricNumber = await prisma.matricNumber.findUnique({
        where: { applicantId: payment.applicantId },
      });
      matricNo = matricNumber?.matricNo;
    }

    res.json({
      message: "Payment verified successfully",
      data: {
        status: "PAID",
        type: payment.type,
        amount: payment.amount,
        paidAt: updatedPayment.paidAt,
        matricNo,
      },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to verify payment" });
  }
};

export const getPaymentHistory = async (
  req: ApplicantAuthRequest,
  res: Response
) => {
  try {
    const applicantId = req.applicant?.id;
    if (!applicantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payments = await prisma.applicantPayment.findMany({
      where: { applicantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        amount: true,
        method: true,
        reference: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Payment history retrieved successfully",
      data: payments,
    });
  } catch (error: any) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};
