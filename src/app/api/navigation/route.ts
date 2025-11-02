import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Navigation API called - BACKUP ROUTE');
  
  const menuItems = [
    { id: '1', label: 'HOME', href: '/', children: [] },
    { id: '2', label: 'PRODUCTS', href: '/products', children: [] },
    { id: '3', label: 'ABOUT US', href: '/about', children: [] },
    { id: '4', label: 'CONTACT US', href: '/contact', children: [] },
    { 
      id: '5', 
      label: 'EUROPEAN', 
      href: '#', 
      children: [
        { id: '5-1', label: 'BMW Parts', href: '/pages/bmw-parts' },
        { id: '5-2', label: 'Mercedes Parts', href: '/pages/mercedes-parts' },
        { id: '5-3', label: 'Audi Parts', href: '/pages/audi-parts' },
      ]
    },
  ];

  return NextResponse.json({ menuItems });
}