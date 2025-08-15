import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/shared/database/prisma/repositories';

export async function GET() {
  const startTime = Date.now();
  const health: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {},
  };

  try {
    // Check database connection
    const prisma = getPrismaClient();
    const dbStartTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.checks.database = {
        status: 'connected',
        responseTime: Date.now() - dbStartTime,
      };
    } catch (error) {
      health.status = 'unhealthy';
      health.checks.database = {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    };

    // Check storage (if local storage is used)
    if (process.env.STORAGE_TYPE === 'local') {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      const uploadsPath = process.env.STORAGE_PATH || './uploads';
      
      try {
        await fs.access(uploadsPath);
        const stats = await fs.stat(uploadsPath);
        health.checks.storage = {
          status: 'accessible',
          path: uploadsPath,
          isDirectory: stats.isDirectory(),
        };
      } catch (error) {
        health.checks.storage = {
          status: 'inaccessible',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Overall response time
    health.responseTime = Date.now() - startTime;

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}