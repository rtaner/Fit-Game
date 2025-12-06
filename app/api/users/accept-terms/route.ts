import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user ID from request body
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user's terms_accepted_at timestamp
    const { data, error } = await supabase
      .from('users')
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error accepting terms:', error);
      return NextResponse.json(
        { error: 'Failed to accept terms' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: data.id,
        termsAcceptedAt: data.terms_accepted_at
      }
    });
  } catch (error) {
    console.error('Error in accept-terms API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
