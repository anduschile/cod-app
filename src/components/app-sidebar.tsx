"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { uiTexts } from '@/lib/constants/ui-texts'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
    LayoutDashboard,
    FlaskConical,
    ShoppingCart,
    Upload,
    DollarSign,
    BookOpen,
} from 'lucide-react'

// Menu items.
const items = [
    {
        title: uiTexts.sidebar.dashboard || "Panel",
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: uiTexts.sidebar.products,
        url: '/products',
        icon: FlaskConical,
    },
    {
        title: uiTexts.sidebar.orders,
        url: '/orders',
        icon: ShoppingCart,
    },
    {
        title: uiTexts.sidebar.import,
        url: '/orders/import',
        icon: Upload,
    },
    {
        title: uiTexts.sidebar.costs,
        url: '/costs',
        icon: DollarSign,
    },
    {
        title: "Bitácora",
        url: '/observations',
        icon: BookOpen,
    },
    {
        title: uiTexts.sidebar.docs,
        url: '/docs',
        icon: BookOpen,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <h2 className="text-xl font-bold tracking-tight">COD Intel</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                // Evitar que /orders se active cuando estamos en /orders/import
                                const isActive = 
                                    pathname === item.url || 
                                    (pathname.startsWith(item.url + '/') && item.url !== '/orders')

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
