import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Database,
  Eye,
  ClipboardList,
  BrainCircuit
} from 'lucide-react';
import { ScrollArea } from "./ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();

  const modules = [
    { id: 'add-dicom', label: 'Import DICOM', icon: Database, href: '/add-dicom' },
    { id: 'ai-image', label: 'AI Image', icon: BrainCircuit, href: '/ai-image' },
    { id: 'viewer', label: 'Viewer', icon: Eye, href: '/viewer' },
    { id: 'dicom', label: 'History', icon: FileText, href: '/dicom' },
    { id: 'reports', label: 'Reports', icon: ClipboardList, href: '/reports' },
  ];

  return (
    <div className="w-64 bg-[#2B2B2B] border-r border-[#3E3E42] flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              // Check if pathname starts with the module href to handle sub-routes if any
              const isActive = pathname?.startsWith(module.href);

              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isActive
                      ? 'bg-[#00A9E0] text-white'
                      : 'text-white/90 hover:bg-[#3E3E42]'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{module.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}