import {
  Users,
  ZoomIn,
  Hand,
  CircleDot,
  Ruler,
  Grid2X2,
  User,
  LogOut,
  Settings,
  Mail
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "./ui/menubar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useUser } from './UserProvider';
import { logout } from '../actions/auth';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setViewerLayout } from '../store/slices/uiSlice';

export function TopMenuBar() {
  const { user } = useUser();
  const currentLayout = useAppSelector((state) => state.ui.viewerLayout);
  const dispatch = useAppDispatch();
  const onLayoutChange = (layout: '1x1' | '1x2' | '2x2') => dispatch(setViewerLayout(layout));
  return (
    <div className="h-10 bg-[#2B2B2B] border-b border-[#3E3E42] flex items-center justify-between px-3">
      {/* Left Side - Text Menus */}
      <Menubar className="bg-transparent border-none h-auto">
        <MenubarMenu>
          <MenubarTrigger className="text-white/80 hover:bg-[#3E3E42] cursor-pointer text-sm h-7 px-2">
            File
          </MenubarTrigger>
          <MenubarContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Open Study...
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Import...
            </MenubarItem>
            <MenubarSeparator className="bg-[#3E3E42]" />
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Export...
            </MenubarItem>
            <MenubarSeparator className="bg-[#3E3E42]" />
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Exit
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-white/80 hover:bg-[#3E3E42] cursor-pointer text-sm h-7 px-2">
            Edit
          </MenubarTrigger>
          <MenubarContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Undo
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Redo
            </MenubarItem>
            <MenubarSeparator className="bg-[#3E3E42]" />
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Preferences...
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-white/80 hover:bg-[#3E3E42] cursor-pointer text-sm h-7 px-2">
            View
          </MenubarTrigger>
          <MenubarContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Zoom In
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Zoom Out
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Fit to Window
            </MenubarItem>
            <MenubarSeparator className="bg-[#3E3E42]" />
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Full Screen
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-white/80 hover:bg-[#3E3E42] cursor-pointer text-sm h-7 px-2">
            Tools
          </MenubarTrigger>
          <MenubarContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Measure
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Angle
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              ROI
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Annotate
            </MenubarItem>
            <MenubarSeparator className="bg-[#3E3E42]" />
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Window/Level
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-white/80 hover:bg-[#3E3E42] cursor-pointer text-sm h-7 px-2">
            Window
          </MenubarTrigger>
          <MenubarContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <MenubarItem
              className={`text-white/90 hover:bg-[#3E3E42] cursor-pointer ${currentLayout === '1x1' ? 'bg-[#00A9E0]/20 text-[#00A9E0]' : ''}`}
              onClick={() => onLayoutChange('1x1')}
            >
              1x1 Layout
            </MenubarItem>
            <MenubarItem
              className={`text-white/90 hover:bg-[#3E3E42] cursor-pointer ${currentLayout === '1x2' ? 'bg-[#00A9E0]/20 text-[#00A9E0]' : ''}`}
              onClick={() => onLayoutChange('1x2')}
            >
              1x2 Layout
            </MenubarItem>
            <MenubarItem
              className={`text-white/90 hover:bg-[#3E3E42] cursor-pointer ${currentLayout === '2x2' ? 'bg-[#00A9E0]/20 text-[#00A9E0]' : ''}`}
              onClick={() => onLayoutChange('2x2')}
            >
              2x2 Layout
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-white/80 hover:bg-[#3E3E42] cursor-pointer text-sm h-7 px-2">
            Help
          </MenubarTrigger>
          <MenubarContent className="bg-[#2B2B2B] border-[#3E3E42]">
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Documentation
            </MenubarItem>
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarSeparator className="bg-[#3E3E42]" />
            <MenubarItem className="text-white/90 hover:bg-[#3E3E42]">
              About mig tool
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Right Side - Icon Toolbar */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
          title="Patient List"
        >
          <Users className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
          title="Zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
          title="Pan"
        >
          <Hand className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
          title="Window/Level"
        >
          <CircleDot className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
          title="Measure"
        >
          <Ruler className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-[#3E3E42] mx-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-[#3E3E42]"
              title="User Profile"
            >
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#2B2B2B] border-[#3E3E42] w-56"
          >
            <DropdownMenuLabel className="text-white/90">
              <div className="flex flex-col space-y-1">
                <p className="text-sm truncate">{user?.name || 'Guest'}</p>
                <p className="text-xs text-white/60 flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" />
                  {user?.email || 'Not logged in'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#3E3E42]" />
            <Link href="/profile">
              <DropdownMenuItem className="text-white/90 hover:bg-[#3E3E42] cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-white/90 hover:bg-[#3E3E42] cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#3E3E42]" />
            <form action={logout}>
              <button type="submit" className="w-full">
                <DropdownMenuItem className="text-red-400 hover:bg-[#3E3E42] cursor-pointer w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}