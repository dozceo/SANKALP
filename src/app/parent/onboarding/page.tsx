import React from "react";
import Link from "next/link";

export default function ParentOnboardingPage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto rounded-full neumorphic-flat flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              family_restroom
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
            Welcome to SANKALP
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg mx-auto">
            We believe every student learns at their own pace. Let's connect you to your child's learning journey so we can support them together.
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="neumorphic-flat p-10 md:p-14 rounded-[3rem]">
          <div className="mb-8">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">
              Step 1 of 2
            </h2>
            <h3 className="text-2xl font-headline font-bold text-on-surface">
              Link Student Account
            </h3>
          </div>

          <form className="space-y-8">
            {/* Input Group */}
            <div className="space-y-3">
              <label htmlFor="inviteCode" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-2">
                Parent Invite Code
              </label>
              <div className="neumorphic-inset p-2 rounded-2xl flex items-center px-5 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <span className="material-symbols-outlined text-primary/50 text-xl mr-3">
                  vpn_key
                </span>
                <input
                  id="inviteCode"
                  type="text"
                  placeholder="e.g. SNK-8X92-PLM"
                  className="bg-transparent border-none focus:ring-0 text-base w-full py-4 placeholder:text-on-surface-variant/40 font-medium outline-none"
                  required
                />
              </div>
              <p className="text-xs text-on-surface-variant ml-2">
                You can find this code in the welcome email sent by your school.
              </p>
            </div>

            {/* Input Group */}
            <div className="space-y-3">
              <label htmlFor="relation" className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-2">
                Relationship to Student
              </label>
              <div className="neumorphic-inset p-2 rounded-2xl flex items-center px-5">
                <span className="material-symbols-outlined text-primary/50 text-xl mr-3">
                  group
                </span>
                <select
                  id="relation"
                  className="bg-transparent border-none focus:ring-0 text-base w-full py-4 text-on-surface font-medium outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled selected className="text-on-surface-variant/40">Select relationship...</option>
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="guardian">Legal Guardian</option>
                  <option value="other">Other</option>
                </select>
                <span className="material-symbols-outlined text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Link href="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">
                Cancel
              </Link>
              <Link href="/parent/dashboard" className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-primary to-primary-container text-white font-black text-sm tracking-widest hover:scale-[0.98] transition-all shadow-lg shadow-primary/20 uppercase text-center">
                Connect Account
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-on-surface-variant mt-10 font-medium">
          Your data is strictly protected. We never share personal information. <br/>
          <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}