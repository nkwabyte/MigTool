export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-950">
            <div className="mx-auto w-full max-w-md p-6">
                {children}
            </div>
        </div>
    );
}
