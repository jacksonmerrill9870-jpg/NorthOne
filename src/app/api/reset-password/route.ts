import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }

    // We need the SERVICE_ROLE_KEY to perform administrative actions like listing users and updating passwords without a token.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Find the user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('List Users Error:', listError);
      return NextResponse.json({ error: 'Failed to access user database' }, { status: 500 });
    }

    const targetUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      return NextResponse.json({ error: 'Account not found. Please check the email address.' }, { status: 404 });
    }

    // 2. Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Update Password Error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
