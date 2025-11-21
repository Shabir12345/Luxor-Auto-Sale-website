// GET /api/vehicles/makes - Get available vehicle makes

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Database connection not initialized',
        },
        { status: 500 }
      );
    }

    // Get ALL makes from database (including duplicates with different casing)
    // We'll deduplicate them in JavaScript since SQL DISTINCT is case-sensitive
    const allMakes = await prisma.vehicle.findMany({
      select: {
        make: true,
      },
    });

    // Aggressive normalization and deduplication
    // This will catch: "Ford", "FORD", "ford", "Ford ", "  Ford  ", etc.
    const makeMap = new Map<string, string>();
    const seenNormalized = new Set<string>();
    
    allMakes.forEach((v) => {
      if (v.make) {
        // Step 1: Trim and clean whitespace
        let cleaned = v.make.trim().replace(/\s+/g, ' ');
        
        // Step 2: Normalize to lowercase for comparison (remove diacritics too)
        const normalized = cleaned
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/[^\w\s]/g, ''); // Remove special characters for comparison
        
        // Step 3: Only add if we haven't seen this normalized version
        if (normalized && normalized.length > 0 && !seenNormalized.has(normalized)) {
          seenNormalized.add(normalized);
          
          // Step 4: Capitalize properly for display
          const capitalized = cleaned
            .split(' ')
            .map(word => {
              if (word.length === 0) return word;
              // Handle special cases
              const lower = word.toLowerCase();
              if (lower.startsWith('mc') && word.length > 2) {
                return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
              }
              // Standard capitalization: first letter uppercase, rest lowercase
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
          
          makeMap.set(normalized, capitalized);
        }
      }
    });

    // Convert to array and sort alphabetically
    const makeList = Array.from(makeMap.values()).sort((a, b) => 
      a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
    );

    // Log for debugging - show what we found
    console.log(`[MAKES API] Found ${allMakes.length} total makes in DB`);
    console.log(`[MAKES API] After deduplication: ${makeList.length} unique makes`);
    console.log(`[MAKES API] Makes list:`, makeList);
    
    // Double-check for any remaining duplicates (should be 0)
    const duplicates = makeList.filter((make, index) => makeList.indexOf(make) !== index);
    if (duplicates.length > 0) {
      console.error(`[MAKES API] WARNING: Found ${duplicates.length} duplicates after processing:`, duplicates);
    }

    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: makeList,
      },
      { status: 200 }
    );

    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Get makes error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
