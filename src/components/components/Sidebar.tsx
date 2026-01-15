import { 
  FileText, 
  Database, 
  Eye,
  ClipboardList
} from 'lucide-react';
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const modules = [
    { id: 'add-dicom', label: 'Add DICOM Data', icon: Database },
    { id: 'viewer', label: 'Image Viewer', icon: Eye },
    { id: 'dicom', label: 'DICOM Data', icon: FileText },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
  ];

  return (
    <div className="w-64 bg-[#2B2B2B] border-r border-[#3E3E42] flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Main Modules */}
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <div
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-[#00A9E0] text-white' 
                      : 'text-white/90 hover:bg-[#3E3E42]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{module.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}