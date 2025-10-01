import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface AuditLogFilter {
  page?: number;
  pageSize?: number;
  actorId?: string;
  action?: string;
  targetType?: string;
}

interface RecordAuditLogInput {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Prisma.InputJsonValue | null;
}

export async function recordAuditLog({
  actorId,
  action,
  targetType,
  targetId,
  meta
}: RecordAuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metaJson: meta ?? Prisma.JsonNull
      }
    });
  } catch (error) {
    // Audit logging should never block main flow; swallow errors after logging to console.
    console.error("Failed to record audit log", error);
  }
}

export async function listAuditLogs({
  page = 1,
  pageSize = 20,
  actorId,
  action,
  targetType
}: AuditLogFilter = {}) {
  const where: Prisma.AuditLogWhereInput = {
    ...(actorId ? { actorId } : {}),
    ...(action ? { action } : {}),
    ...(targetType ? { targetType } : {})
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    items,
    total,
    page,
    pageSize
  };
}
