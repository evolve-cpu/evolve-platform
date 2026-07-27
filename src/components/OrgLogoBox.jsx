export default function OrgLogoBox({ org, size = 56, rounded = "rounded-2xl" }) {
  return (
    <div
      className={`${rounded} overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {org.logo_url ? (
        <img
          src={org.logo_url}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{org.org_type === "institute" ? "🎓" : "🏢"}</span>
      )}
    </div>
  );
}
