export function StatusBar() {
  return (
    <div className="h-6 bg-[#2B2B2B] border-t border-[#3E3E42] flex items-center justify-between px-3 text-xs text-white/60">
      {/* Left Side - Patient Information */}
      <div className="flex items-center gap-4">
        <span>Patient: John Smith</span>
        <span>PID: 123456789</span>
        <span>DOB: 01-Jan-1960</span>
        <span>Study: CT Abdomen/Pelvis</span>
      </div>

      {/* Right Side - Application Status */}
      <div className="flex items-center gap-4">
        <span>Status: Ready</span>
        <div className="flex items-center gap-1.5">
          <span>Connection:</span>
          <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
          <span>Connected</span>
        </div>
        <span>Server: PACS_PROD</span>
      </div>
    </div>
  );
}
