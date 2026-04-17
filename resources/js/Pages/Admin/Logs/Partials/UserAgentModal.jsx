import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Monitor } from 'lucide-react';

export default function UserAgentModal({ isOpen, onClose, userAgent }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Monitor size={18} /> Detail User Agent
                    </DialogTitle>
                    <DialogDescription>
                        Informasi lengkap mengenai perangkat, sistem operasi, dan browser.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="mt-2 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-sm text-zinc-700 dark:text-zinc-300 break-words">
                    {userAgent || 'Tidak ada data user agent yang terekam.'}
                </div>
            </DialogContent>
        </Dialog>
    );
}