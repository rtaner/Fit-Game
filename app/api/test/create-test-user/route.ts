import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const supabase = createClient();

    // Test user credentials
    const testUser = {
      username: 'test',
      password: '123456',
      first_name: 'Test',
      last_name: 'User',
      store_code: 101,
      role: 'employee' as const,
    };

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', testUser.username)
      .single();

    if (existing) {
      return NextResponse.json({
        message: 'Test user already exists',
        credentials: {
          username: testUser.username,
          password: testUser.password,
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(testUser.password, 12);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username: testUser.username,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        password_hash: passwordHash,
        store_code: testUser.store_code,
        role: testUser.role,
        current_streak: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Test user created successfully',
      credentials: {
        username: testUser.username,
        password: testUser.password,
      },
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}
