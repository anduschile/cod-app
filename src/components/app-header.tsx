import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserCheck } from 'lucide-react'

export function AppHeader() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 w-full shrink-0">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">Admin User</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-primary" />
                </div>
            </div>
        </header>
    )
}
