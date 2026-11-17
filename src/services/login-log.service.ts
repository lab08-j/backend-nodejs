import { prisma } from "../lib/prisma";

type CreateLoginLogParams = {
  email: string;
  success: boolean;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function createLoginLog(data: CreateLoginLogParams) {
  return prisma.loginLog.create({
    data: {
      email: data.email,
      success: data.success,
      ...(data.userId && { userId: data.userId }),
      ...(data.ipAddress && { ipAddress: data.ipAddress }),
      ...(data.userAgent && { userAgent: data.userAgent }),
    },
  });
}
