import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  
  console.log('🔍 Test API called');
  console.log('👤 Clerk User ID:', userId);
  
  return NextResponse.json({ 
    message: 'Test API working',
    clerkUserId: userId,
    instructions: userId 
      ? `Copy this User ID: ${userId} and use it in the manual-add-user script`
      : 'You are not signed in. Please sign in first.'
  });
}