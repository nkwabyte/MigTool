import { ProfileForm } from '@/src/components/profile/ProfileForm';
import { Separator } from '@/src/components/ui/separator';

export default function ProfilePage() {
    return (
        <div className="flex-1 bg-[#1E1E1E] p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
                    <p className="text-white/60">Manage your account settings and preferences.</p>
                </div>

                <Separator className="my-6 bg-[#3E3E42]" />

                <div className="bg-[#2B2B2B] border border-[#3E3E42] rounded-lg p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Personal Information</h2>
                    <ProfileForm />
                </div>
            </div>
        </div>
    );
}
