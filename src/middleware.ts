import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

// Define protected routes
const protectedRoutes = ['/dashboard'];
const adminProtectedRoutes = ['/admin']; // Admin routes that require admin_token
const adminAuthRoutes = ['/admin-login']; // Admin login route
const adminSetupRoutes = ['/admin-setup']; // Admin setup route (accessible without token)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for certain paths to avoid redirect loops
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('token')?.value || "";
  const adminToken = request.cookies.get("admin_token")?.value || "";
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
    // Check if the route is an admin protected route
  const isAdminProtectedRoute = adminProtectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is an admin setup route
  const isAdminSetupRoute = adminSetupRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the route is an admin auth route (admin-login)
  const isAdminAuthRoute = adminAuthRoutes.some(route => 
    pathname.startsWith(route)
  );// Verify JWT token if it exists
  let isValidToken = false;
  let isValidAdminToken = false;
  
  // Check regular user token
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValidToken = true;
    } catch (error) {
      // Token is invalid, but don't redirect here, just mark as invalid
      console.log('Invalid user token:', error);
      isValidToken = false;
    }
  }
  
  // Check admin token
  if (adminToken) {
    try {
      await jwtVerify(adminToken, JWT_SECRET);
      isValidAdminToken = true;
    } catch (error) {
      // Admin token is invalid, but don't redirect here, just mark as invalid
      console.log('Invalid admin token:', error);
      isValidAdminToken = false;
    }  }  
  
  // Early return for admin setup route - allow access without any token validation
  if (isAdminSetupRoute) {
    return NextResponse.next();
  }

  // Redirect logic with proper checks to prevent loops
  // 1. Admin protected routes - require admin token (excluding admin-setup)
  if (isAdminProtectedRoute && !isValidAdminToken) {
    // Only redirect if not already on admin-login page
    if (pathname !== '/admin-login') {
      const response = NextResponse.redirect(new URL('/admin-login', request.url));
      if (!isValidAdminToken && adminToken) {
        response.cookies.delete('admin_token');
      }
      return response;
    }
  }
    // 2. Admin already logged in trying to access admin-login
  if (isAdminAuthRoute && isValidAdminToken) {
    // Only redirect if not already on admin page
    if (pathname !== '/admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  


  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
