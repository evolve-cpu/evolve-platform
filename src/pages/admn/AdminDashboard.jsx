// import React, { useEffect, useMemo, useState } from "react";
// import { supabase } from "../../supabaseClient";
// import { useNavigate } from "react-router-dom";

// export default function AdminDashboard() {
//   const navigate = useNavigate();

//   const [profiles, setProfiles] = useState([]);
//   const [activations, setActivations] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [activeTab, setActiveTab] = useState("overview"); // overview | profiles | activations | insights
//   const [search, setSearch] = useState("");

//   const [selectedRow, setSelectedRow] = useState(null); // activation row modal
//   const [error, setError] = useState("");

//   const handleLogout = () => {
//     sessionStorage.removeItem("admin_access");
//     navigate("/admin");
//   };

//   // ✅ Fetch all data
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         setError("");
//         setLoading(true);

//         const [{ data: pData, error: pErr }, { data: aData, error: aErr }] =
//           await Promise.all([
//             supabase
//               .from("profiles")
//               .select("*")
//               .order("created_at", { ascending: false }),

//             supabase
//               .from("college_activations")
//               .select("*")
//               .order("updated_at", { ascending: false })
//           ]);

//         if (pErr) throw pErr;
//         if (aErr) throw aErr;

//         setProfiles(pData || []);
//         setActivations(aData || []);
//       } catch (err) {
//         console.log("admin fetch error:", err.message);
//         setError(err.message || "Failed to load admin data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAll();
//   }, []);

//   // ✅ Overview stats
//   const stats = useMemo(() => {
//     const totalProfiles = profiles.length;
//     const totalActivations = activations.length;

//     const selfReflectionDone = activations.filter(
//       (x) => x?.self_reflection_answers?.completed
//     ).length;

//     const realityCheckDone = activations.filter(
//       (x) => x?.reality_check_answers?.completed
//     ).length;

//     const totalCompletedBoth = activations.filter(
//       (x) =>
//         x?.self_reflection_answers?.completed &&
//         x?.reality_check_answers?.completed
//     ).length;

//     return {
//       totalProfiles,
//       totalActivations,
//       selfReflectionDone,
//       realityCheckDone,
//       totalCompletedBoth
//     };
//   }, [profiles, activations]);

//   // ✅ Search filtering
//   const filteredProfiles = useMemo(() => {
//     if (!search.trim()) return profiles;
//     const q = search.toLowerCase();

//     return profiles.filter((p) => {
//       return (
//         (p.username || "").toLowerCase().includes(q) ||
//         (p.id || "").toLowerCase().includes(q)
//       );
//     });
//   }, [profiles, search]);

//   const filteredActivations = useMemo(() => {
//     if (!search.trim()) return activations;
//     const q = search.toLowerCase();

//     return activations.filter((a) => {
//       return (
//         (a.name || "").toLowerCase().includes(q) ||
//         (a.email || "").toLowerCase().includes(q) ||
//         (a.college || "").toLowerCase().includes(q) ||
//         (a.id || "").toLowerCase().includes(q)
//       );
//     });
//   }, [activations, search]);

//   // ✅ Insights
//   const collegeStats = useMemo(() => {
//     const map = {};
//     activations.forEach((a) => {
//       const c = a.college || "Unknown";
//       map[c] = (map[c] || 0) + 1;
//     });
//     return Object.entries(map).sort((a, b) => b[1] - a[1]);
//   }, [activations]);

//   const topInterests = useMemo(() => {
//     const map = {};

//     activations.forEach((a) => {
//       const fields = a?.self_reflection_answers?.fields || [];
//       fields.forEach((f) => {
//         const key = (f.area || "").trim().toLowerCase();
//         if (!key) return;
//         map[key] = (map[key] || 0) + 1;
//       });
//     });

//     return Object.entries(map)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 15);
//   }, [activations]);

//   return (
//     <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
//       <div className="max-w-[1300px] mx-auto">
//         {/* HEADER */}
//         <div className="flex items-center justify-between gap-4">
//           <h1 className="text-black font-extrabold text-[28px] md:text-[48px] tracking-[-0.04em]">
//             admin dashboard
//           </h1>

//           <button
//             onClick={handleLogout}
//             className="text-black font-extrabold underline"
//           >
//             logout
//           </button>
//         </div>

//         {/* ERROR */}
//         {error && (
//           <p className="mt-4 text-evolve-pink font-bold text-[16px]">{error}</p>
//         )}

//         {/* SEARCH */}
//         <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
//           <div className="flex gap-2">
//             {["overview", "profiles", "activations", "insights"].map((t) => (
//               <button
//                 key={t}
//                 onClick={() => setActiveTab(t)}
//                 className={`
//                   px-4 py-2 rounded-full border-2 border-black
//                   font-extrabold text-[14px] md:text-[16px]
//                   ${
//                     activeTab === t
//                       ? "bg-black text-white"
//                       : "bg-transparent text-black"
//                   }
//                 `}
//               >
//                 {t}
//               </button>
//             ))}
//           </div>

//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="search by name / email / college / id..."
//             className="
//               w-full md:w-[420px]
//               rounded-2xl
//               border-[3px] border-black/40
//               bg-transparent
//               px-5 py-3
//               text-black
//               outline-none
//               placeholder-black/50
//               font-bold
//             "
//           />
//         </div>

//         {/* LOADING */}
//         {loading && (
//           <p className="mt-10 text-black font-semibold text-[18px]">
//             loading admin data...
//           </p>
//         )}

//         {!loading && (
//           <>
//             {/* OVERVIEW */}
//             {activeTab === "overview" && (
//               <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <StatCard title="total profiles" value={stats.totalProfiles} />
//                 <StatCard
//                   title="total activations"
//                   value={stats.totalActivations}
//                 />
//                 <StatCard
//                   title="self reflection completed"
//                   value={stats.selfReflectionDone}
//                 />
//                 <StatCard
//                   title="reality check completed"
//                   value={stats.realityCheckDone}
//                 />
//                 <StatCard
//                   title="completed both"
//                   value={stats.totalCompletedBoth}
//                 />
//               </div>
//             )}

//             {/* PROFILES */}
//             {activeTab === "profiles" && (
//               <div className="mt-10">
//                 <h2 className="text-black font-extrabold text-[22px] md:text-[28px]">
//                   profiles ({filteredProfiles.length})
//                 </h2>

//                 <div className="mt-6 overflow-x-auto">
//                   <table className="w-full min-w-[900px] border-collapse">
//                     <thead>
//                       <tr className="text-left bg-black/10">
//                         <th className="p-4 font-extrabold">username</th>
//                         <th className="p-4 font-extrabold">is_guest</th>
//                         <th className="p-4 font-extrabold">id</th>
//                         <th className="p-4 font-extrabold">created</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {filteredProfiles.map((p) => (
//                         <tr key={p.id} className="border-t border-black/20">
//                           <td className="p-4 font-bold">{p.username || "-"}</td>
//                           <td className="p-4">{p.is_guest ? "✅" : "—"}</td>
//                           <td className="p-4 text-[12px]">{p.id}</td>
//                           <td className="p-4 text-[12px]">
//                             {p.created_at
//                               ? new Date(p.created_at).toLocaleString()
//                               : "-"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* ACTIVATIONS */}
//             {activeTab === "activations" && (
//               <div className="mt-10">
//                 <h2 className="text-black font-extrabold text-[22px] md:text-[28px]">
//                   college activations ({filteredActivations.length})
//                 </h2>

//                 <div className="mt-6 overflow-x-auto">
//                   <table className="w-full min-w-[1100px] border-collapse">
//                     <thead>
//                       <tr className="text-left bg-black/10">
//                         <th className="p-4 font-extrabold">name</th>
//                         <th className="p-4 font-extrabold">email</th>
//                         <th className="p-4 font-extrabold">college</th>
//                         <th className="p-4 font-extrabold">self reflection</th>
//                         <th className="p-4 font-extrabold">reality check</th>
//                         <th className="p-4 font-extrabold">details</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {filteredActivations.map((a) => (
//                         <tr key={a.id} className="border-t border-black/20">
//                           <td className="p-4 font-bold">{a.name || "-"}</td>
//                           <td className="p-4">{a.email || "-"}</td>
//                           <td className="p-4">{a.college || "-"}</td>

//                           <td className="p-4">
//                             {a?.self_reflection_answers?.completed
//                               ? "✅ done"
//                               : "—"}
//                           </td>

//                           <td className="p-4">
//                             {a?.reality_check_answers?.completed
//                               ? "✅ done"
//                               : "—"}
//                           </td>

//                           <td className="p-4">
//                             <button
//                               onClick={() => setSelectedRow(a)}
//                               className="font-extrabold underline text-black"
//                             >
//                               view
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* INSIGHTS */}
//             {activeTab === "insights" && (
//               <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="bg-black/10 rounded-3xl border-2 border-black p-6">
//                   <h3 className="text-black font-extrabold text-[22px]">
//                     college distribution
//                   </h3>

//                   <div className="mt-4 space-y-2">
//                     {collegeStats.map(([name, count]) => (
//                       <div
//                         key={name}
//                         className="flex justify-between font-bold"
//                       >
//                         <span>{name}</span>
//                         <span>{count}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="bg-black/10 rounded-3xl border-2 border-black p-6">
//                   <h3 className="text-black font-extrabold text-[22px]">
//                     top interests (self reflection)
//                   </h3>

//                   <div className="mt-4 space-y-2">
//                     {topInterests.length ? (
//                       topInterests.map(([key, count]) => (
//                         <div
//                           key={key}
//                           className="flex justify-between font-bold"
//                         >
//                           <span className="capitalize">{key}</span>
//                           <span>{count}</span>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="font-bold text-black/70">
//                         no self reflection submissions yet
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         {/* DETAILS MODAL */}
//         {selectedRow && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
//             <div
//               className="absolute inset-0 bg-black/40"
//               onClick={() => setSelectedRow(null)}
//             />

//             <div
//               className="
//                 relative z-10
//                 w-full max-w-[900px]
//                 bg-evolve-yellow
//                 border-2 border-black
//                 rounded-3xl
//                 shadow-[10px_10px_0px_rgba(0,0,0,0.25)]
//                 p-8
//                 max-h-[85vh]
//                 overflow-y-auto
//               "
//             >
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <p className="text-black font-extrabold text-[24px] tracking-[-0.04em]">
//                     {selectedRow.name || "-"}
//                   </p>
//                   <p className="text-black font-bold">{selectedRow.email}</p>
//                   <p className="text-black/70 font-bold">
//                     {selectedRow.college}
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => setSelectedRow(null)}
//                   className="text-black font-extrabold text-[26px]"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="h-[2px] bg-black/20 my-6" />

//               {/* Self Reflection */}
//               <h3 className="text-black font-extrabold text-[20px]">
//                 self reflection
//               </h3>

//               <pre className="mt-3 text-[13px] bg-black/10 p-4 rounded-2xl overflow-x-auto">
//                 {JSON.stringify(
//                   selectedRow.self_reflection_answers || {},
//                   null,
//                   2
//                 )}
//               </pre>

//               <div className="h-[2px] bg-black/20 my-6" />

//               {/* Reality Check */}
//               <h3 className="text-black font-extrabold text-[20px]">
//                 reality check
//               </h3>

//               <pre className="mt-3 text-[13px] bg-black/10 p-4 rounded-2xl overflow-x-auto">
//                 {JSON.stringify(
//                   selectedRow.reality_check_answers || {},
//                   null,
//                   2
//                 )}
//               </pre>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value }) {
//   return (
//     <div className="bg-black/10 rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
//       <p className="text-black font-extrabold text-[18px] tracking-[-0.04em]">
//         {title}
//       </p>
//       <p className="mt-2 text-black font-extrabold text-[42px] tracking-[-0.04em]">
//         {value}
//       </p>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { supabaseAdmin } from "../../supabaseAdminClient"; // Import admin client
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState("");

  const handleLogout = () => {
    sessionStorage.removeItem("admin_access");
    navigate("/admin");
  };

  // ✅ Fetch all data - FIXED to use auth.admin.listUsers
  const fetchAll = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch users from Supabase Auth using ADMIN client
      const { data: authData, error: authErr } =
        await supabaseAdmin.auth.admin.listUsers();

      const { data: aData, error: aErr } = await supabase
        .from("college_activations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (authErr) throw authErr;
      if (aErr) throw aErr;

      // Transform auth users to profiles format
      // Filter out users without emails (anonymous/guest users)
      const transformedProfiles =
        authData?.users
          ?.filter((user) => user.email) // Only include users with valid emails
          ?.map((user) => ({
            id: user.id,
            username:
              user.user_metadata?.username ||
              user.user_metadata?.display_name ||
              user.email?.split("@")[0] ||
              "Unknown",
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url || null,
            is_guest: user.user_metadata?.is_guest || false,
            created_at: user.created_at,
            last_sign_in: user.last_sign_in_at,
            provider: user.app_metadata?.provider || "email"
          })) || [];

      setProfiles(transformedProfiles);
      setActivations(aData || []);
    } catch (err) {
      console.log("admin fetch error:", err.message);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ Overview stats
  const stats = useMemo(() => {
    const totalProfiles = profiles.length;
    const totalActivations = activations.length;
    const guestProfiles = profiles.filter((p) => p.is_guest).length;
    const realProfiles = totalProfiles - guestProfiles;

    const selfReflectionDone = activations.filter(
      (x) => x?.self_reflection_answers?.completed
    ).length;

    const realityCheckDone = activations.filter(
      (x) => x?.reality_check_answers?.completed
    ).length;

    const totalCompletedBoth = activations.filter(
      (x) =>
        x?.self_reflection_answers?.completed &&
        x?.reality_check_answers?.completed
    ).length;

    return {
      totalProfiles,
      realProfiles,
      guestProfiles,
      totalActivations,
      selfReflectionDone,
      realityCheckDone,
      totalCompletedBoth
    };
  }, [profiles, activations]);

  // ✅ Search filtering
  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.trim().toLowerCase();

    return profiles.filter((p) => {
      return (
        (p.username || "").toLowerCase().includes(q) ||
        (p.id || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
      );
    });
  }, [profiles, search]);

  const filteredActivations = useMemo(() => {
    if (!search.trim()) return activations;
    const q = search.trim().toLowerCase();

    return activations.filter((a) => {
      return (
        (a.name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q) ||
        (a.college || "").toLowerCase().includes(q) ||
        (a.user_id || "").toLowerCase().includes(q) ||
        (a.id || "").toLowerCase().includes(q)
      );
    });
  }, [activations, search]);

  // ✅ Insights
  const collegeStats = useMemo(() => {
    const map = {};
    activations.forEach((a) => {
      const c = a.college || "Unknown";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [activations]);

  const topInterests = useMemo(() => {
    const map = {};

    activations.forEach((a) => {
      const fields = a?.self_reflection_answers?.fields || [];
      fields.forEach((f) => {
        const key = (f.area || "").trim().toLowerCase();
        if (!key) return;
        map[key] = (map[key] || 0) + 1;
      });
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [activations]);

  return (
    <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-black font-extrabold text-[28px] md:text-[48px] tracking-[-0.04em]">
            admin dashboard
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="
                bg-black text-white font-extrabold
                px-6 py-3 rounded-full
                border-2 border-black
                shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
                hover:translate-x-[2px] hover:translate-y-[2px]
                hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
                disabled:opacity-50
                transition-all duration-200
              "
            >
              {refreshing ? "refreshing..." : "🔄 refresh"}
            </button>

            <button
              onClick={handleLogout}
              className="text-black font-extrabold underline"
            >
              logout
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <p className="mt-4 text-evolve-pink font-bold text-[16px]">{error}</p>
        )}

        {/* TABS + SEARCH */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {["overview", "profiles", "activations", "insights"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`
                  px-4 py-2 rounded-full border-2 border-black
                  font-extrabold text-[14px] md:text-[16px]
                  transition-all duration-200
                  ${
                    activeTab === t
                      ? "bg-black text-white"
                      : "bg-transparent text-black hover:bg-black/10"
                  }
                `}
              >
                {t}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by name / email / college / id..."
            className="
              w-full md:w-[420px]
              rounded-2xl
              border-[3px] border-black/40
              bg-transparent
              px-5 py-3
              text-black
              outline-none
              placeholder-black/50
              font-bold
            "
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-10 text-center">
            <div className="inline-block animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full" />
            <p className="mt-4 text-black font-semibold text-[18px]">
              loading admin data...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="total profiles" value={stats.totalProfiles} />
                <StatCard title="real profiles" value={stats.realProfiles} />
                <StatCard title="guest profiles" value={stats.guestProfiles} />
                <StatCard
                  title="total activations"
                  value={stats.totalActivations}
                />
                <StatCard
                  title="self reflection done"
                  value={stats.selfReflectionDone}
                />
                <StatCard
                  title="reality check done"
                  value={stats.realityCheckDone}
                />
                <StatCard
                  title="completed both"
                  value={stats.totalCompletedBoth}
                />
              </div>
            )}

            {/* PROFILES */}
            {activeTab === "profiles" && (
              <div className="mt-10">
                <h2 className="text-black font-extrabold text-[22px] md:text-[28px]">
                  profiles ({filteredProfiles.length} / {profiles.length})
                </h2>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse border-2 border-black">
                    <thead>
                      <tr className="text-left bg-black text-white">
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          username
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          email
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          is_guest
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          provider
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          id
                        </th>
                        <th className="p-4 font-extrabold">created</th>
                      </tr>
                    </thead>

                    <tbody className="bg-black/10">
                      {filteredProfiles.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center">
                            <p className="text-black/70 font-bold">
                              no profiles found
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredProfiles.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t-2 border-black hover:bg-evolve-yellow/30 transition-colors"
                          >
                            <td className="p-4 font-bold text-black border-r-2 border-black">
                              {p.username || "-"}
                            </td>
                            <td className="p-4 text-black border-r-2 border-black">
                              {p.email || "-"}
                            </td>
                            <td className="p-4 text-black border-r-2 border-black">
                              {p.is_guest ? "✅ yes" : "❌ no"}
                            </td>
                            <td className="p-4 text-black border-r-2 border-black">
                              {p.provider || "email"}
                            </td>
                            <td className="p-4 text-black text-[11px] font-mono border-r-2 border-black">
                              {p.id}
                            </td>
                            <td className="p-4 text-black text-[13px]">
                              {p.created_at
                                ? new Date(p.created_at).toLocaleString()
                                : "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ACTIVATIONS */}
            {activeTab === "activations" && (
              <div className="mt-10">
                <h2 className="text-black font-extrabold text-[22px] md:text-[28px]">
                  college activations ({filteredActivations.length} /{" "}
                  {activations.length})
                </h2>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[1200px] border-collapse border-2 border-black">
                    <thead>
                      <tr className="text-left bg-black text-white">
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          name
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          email
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          college
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          self reflection
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          reality check
                        </th>
                        <th className="p-4 font-extrabold border-r-2 border-black">
                          updated
                        </th>
                        <th className="p-4 font-extrabold">details</th>
                      </tr>
                    </thead>

                    <tbody className="bg-black/10">
                      {filteredActivations.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center">
                            <p className="text-black/70 font-bold">
                              no activations found
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredActivations.map((a) => (
                          <tr
                            key={a.id}
                            className="border-t-2 border-black hover:bg-evolve-yellow/30 transition-colors"
                          >
                            <td className="p-4 font-bold text-black border-r-2 border-black">
                              {a.name || "-"}
                            </td>
                            <td className="p-4 text-black border-r-2 border-black">
                              {a.email || "-"}
                            </td>
                            <td className="p-4 text-black border-r-2 border-black">
                              {a.college || "-"}
                            </td>

                            <td className="p-4 text-black border-r-2 border-black">
                              {a?.self_reflection_answers?.completed
                                ? "✅ done"
                                : "❌ pending"}
                            </td>

                            <td className="p-4 text-black border-r-2 border-black">
                              {a?.reality_check_answers?.completed
                                ? "✅ done"
                                : "❌ pending"}
                            </td>

                            <td className="p-4 text-black text-[13px] border-r-2 border-black">
                              {a.updated_at
                                ? new Date(a.updated_at).toLocaleString()
                                : "-"}
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => setSelectedRow(a)}
                                className="font-extrabold underline text-black hover:text-evolve-pink"
                              >
                                view
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INSIGHTS */}
            {activeTab === "insights" && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
                  <h3 className="text-black font-extrabold text-[22px]">
                    college distribution
                  </h3>

                  <div className="mt-4 space-y-2">
                    {collegeStats.length === 0 ? (
                      <p className="text-black/70 font-bold">no data yet</p>
                    ) : (
                      collegeStats.map(([name, count]) => (
                        <div
                          key={name}
                          className="flex justify-between font-bold text-black border-b border-black/10 pb-2"
                        >
                          <span>{name}</span>
                          <span className="bg-black text-white px-3 py-1 rounded-full text-[14px]">
                            {count}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
                  <h3 className="text-black font-extrabold text-[22px]">
                    top interests (self reflection)
                  </h3>

                  <div className="mt-4 space-y-2">
                    {topInterests.length === 0 ? (
                      <p className="text-black/70 font-bold">
                        no self reflection submissions yet
                      </p>
                    ) : (
                      topInterests.map(([key, count]) => (
                        <div
                          key={key}
                          className="flex justify-between font-bold text-black border-b border-black/10 pb-2"
                        >
                          <span className="capitalize">{key}</span>
                          <span className="bg-black text-white px-3 py-1 rounded-full text-[14px]">
                            {count}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* DETAILS MODAL */}
        {selectedRow && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSelectedRow(null)}
            />

            <div
              className="
                relative z-10
                w-full max-w-[1000px]
                bg-white
                border-4 border-black
                rounded-3xl
                shadow-[12px_12px_0px_rgba(0,0,0,0.4)]
                p-8
                max-h-[85vh]
                overflow-y-auto
              "
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-black font-extrabold text-[28px] tracking-[-0.04em]">
                    {selectedRow.name || "-"}
                  </p>
                  <p className="text-black font-bold text-[16px] mt-1">
                    {selectedRow.email}
                  </p>
                  <p className="text-black/70 font-bold">
                    {selectedRow.college}
                  </p>
                  <p className="text-black/50 text-[12px] font-mono mt-2">
                    ID: {selectedRow.id}
                  </p>
                  <p className="text-black/50 text-[12px] mt-1">
                    Updated:{" "}
                    {selectedRow.updated_at
                      ? new Date(selectedRow.updated_at).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRow(null)}
                  className="text-black font-extrabold text-[32px] hover:text-evolve-pink transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="h-[3px] bg-black/20 mb-6" />

              {/* Self Reflection */}
              <div className="mb-8">
                <h3 className="text-black font-extrabold text-[22px] mb-3">
                  📝 self reflection
                </h3>

                {selectedRow.self_reflection_answers?.completed ? (
                  <div className="bg-evolve-yellow/50 border-2 border-black p-5 rounded-2xl">
                    <pre className="text-[13px] text-black whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(
                        selectedRow.self_reflection_answers,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <p className="text-black/70 font-bold bg-black/5 p-4 rounded-2xl border-2 border-black/20">
                    ❌ not completed yet
                  </p>
                )}
              </div>

              <div className="h-[3px] bg-black/20 mb-6" />

              {/* Reality Check */}
              <div>
                <h3 className="text-black font-extrabold text-[22px] mb-3">
                  🔍 reality check
                </h3>

                {selectedRow.reality_check_answers?.completed ? (
                  <div className="bg-evolve-yellow/50 border-2 border-black p-5 rounded-2xl">
                    <pre className="text-[13px] text-black whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(
                        selectedRow.reality_check_answers,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <p className="text-black/70 font-bold bg-black/5 p-4 rounded-2xl border-2 border-black/20">
                    ❌ not completed yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.3)] transition-all duration-200">
      <p className="text-black font-extrabold text-[16px] tracking-[-0.04em] uppercase">
        {title}
      </p>
      <p className="mt-3 text-black font-extrabold text-[48px] tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}
