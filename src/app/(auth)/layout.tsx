import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Authentication',
    description: 'Sign in or create an account to continue.',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-muted/40 p-4 md:p-8">
            {children}
        </main>
    );
}
