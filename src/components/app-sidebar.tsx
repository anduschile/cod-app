import Link from 'next/link'
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
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Product Lab',
        url: '/products',
        icon: FlaskConical,
    },
    {
        title: 'Orders Manual Hub',
        url: '/orders',
        icon: ShoppingCart,
    },
    {
        title: 'CSV Import',
        url: '/orders/import',
        icon: Upload,
    },
    {
        title: 'Costos y Ads',
        url: '/costs',
        icon: DollarSign,
    },
    {
        title: 'SOP Playbook',
        url: '/docs',
        icon: BookOpen,
    },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <h2 className="text-xl font-bold tracking-tight">COD Intel</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
