'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BrainCircuit, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pass empty additional data as we will collect it during onboarding
      await signUp(email, password, name, role, {});

      toast({
        title: 'Account created!',
        description: 'Welcome to SANKALP.',
      });

      // Redirect to onboarding based on role
      if (role === 'teacher') {
        router.push('/teacher-onboarding');
      } else {
        router.push('/onboarding');
      }
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-md border-border/60">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            <BrainCircuit className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-headline tracking-tight">Create an Account</CardTitle>
        <CardDescription className="text-base">Enter your information to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label>I am a</Label>
            <RadioGroup value={role} onValueChange={(val) => setRole(val as 'student' | 'teacher')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="font-normal cursor-pointer">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher" className="font-normal cursor-pointer">Teacher</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              placeholder="Alex Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
