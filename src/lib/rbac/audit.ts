import { prisma } from '@/lib/prisma';

interface RBACLogData {
  actorId: string;
  actorEmail: string;
  targetId: string;
  targetEmail: string;
  action: 'PERMISSION_CHANGE' | 'ROLE_CHANGE';
  oldValue?: any;
  newValue?: any;
  metadata?: any;
}

/**
 * Log RBAC changes (permission updates, role changes)
 */
export async function logRBACChange(data: RBACLogData): Promise<void> {
  try {
    await prisma.rBACLog.create({
      data: {
        actorId: data.actorId,
        actorEmail: data.actorEmail,
        targetId: data.targetId,
        targetEmail: data.targetEmail,
        action: data.action,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        metadata: data.metadata || null,
      },
    });

    // Also log to console for critical actions
    console.log(`[RBAC LOG] ${data.action}:`, {
      actor: data.actorEmail,
      target: data.targetEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log RBAC change:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

/**
 * Get RBAC logs for a specific user
 */
export async function getRBACLogs(userId: string, limit = 50) {
  return prisma.rBACLog.findMany({
    where: {
      OR: [
        { actorId: userId },
        { targetId: userId },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get all RBAC logs (admin only)
 */
export async function getAllRBACLogs(limit = 100) {
  return prisma.rBACLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}
