"use client";

import { useState } from "react";
import RegisterUserTab from "../components/RegisterUserTab";
import SegmentedTabs from "../components/SegmentedTabs";
import VerifyUserTab from "../components/VerifyUserTab";

const TABS = {
  REGISTER: "register",
  VERIFY: "verify",
};

const tabOptions = [
  { value: TABS.REGISTER, label: "Register User" },
  { value: TABS.VERIFY, label: "Verify User" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(TABS.REGISTER);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#eef2ff_100%)] px-8 py-6">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl shadow-slate-400 backdrop-blur sm:p-8">
        <h1 className="text-center text-2xl font-bold text-indigo-700">
          Face Verification
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Register and verify users with camera or image upload.
        </p>

        <div className="mt-6">
          <SegmentedTabs
            value={activeTab}
            onChange={setActiveTab}
            options={tabOptions}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-inner sm:p-6">
          {activeTab === TABS.REGISTER ? <RegisterUserTab /> : <VerifyUserTab />}
        </div>
      </div>
    </main>
  );
}
