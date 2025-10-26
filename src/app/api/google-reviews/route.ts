import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PLACE_ID = 'ChIJeeqrSGMd1YkRPQXGdMznZH8';
const API_KEY = 'AIzaSyALo-BXSLlaFnOILjTk18UQGe2XNvm5-Hs';

export async function GET() {
  try {
    // Try the legacy Places API with field mask
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,rating,user_ratings_total,reviews&key=${API_KEY}`,
      {
        cache: 'no-store',
      }
    );

    const data = await response.json();

    // If legacy API returns error, return null data (frontend will show fallback)
    if (data.status !== 'OK' || data.error) {
      console.error('Google Places API error:', data.status, data.error || data.error_message);
      return NextResponse.json({
        success: false,
        error: data.error_message || 'Legacy API not enabled',
        data: null,
      });
    }

    const result = data.result;
    
    // Format the reviews
    const reviews = (result.reviews || []).slice(0, 4).map((review: any) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.relative_time_description,
      authorPhoto: review.profile_photo_url,
    }));

    return NextResponse.json({
      success: true,
      data: {
        name: result.name,
        rating: result.rating,
        totalRatings: result.user_ratings_total,
        reviews,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      data: null,
    });
  }
}
