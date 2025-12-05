import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      data: { success: true } 
    });

    // Clear user cookie
    response.cookies.delete('user');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Çıkış sırasında bir hata oluştu' } },
      { status: 500 }
    );
  }
}
