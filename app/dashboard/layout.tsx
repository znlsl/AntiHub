'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { MorphingSquare } from '@/components/ui/morphing-square';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // 检查是否是登录后的重定向
    const loginSuccess = searchParams.get('login');
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');

    if (loginSuccess === 'success' && token && userParam) {
      try {
        // 立即同步存储到 localStorage
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', decodeURIComponent(userParam));
        
        // 保存 refresh_token
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
          console.log('Refresh token synced to localStorage');
        }
        
        // 保存 token 过期时间
        if (expiresIn) {
          const expiresAt = Date.now() + parseInt(expiresIn, 10) * 1000;
          localStorage.setItem('token_expires_at', String(expiresAt));
          console.log('Token expires at:', new Date(expiresAt).toISOString());
        }
        
        console.log('Token synced to localStorage');
      } catch (error) {
        console.error('Failed to sync login data:', error);
      }
    }

    // 标记认证已就绪
    setIsAuthReady(true);
  }, [searchParams]);

  // 等待认证状态就绪后再渲染子组件
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <MorphingSquare message="加载中..." />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}