// Lightweight middleware placeholder (Edge runtime safe)
// Auth is now handled inside API routes (Node.js runtime).

import { NextRequest, NextResponse } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};

