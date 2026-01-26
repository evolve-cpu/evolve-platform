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

// import React, { useEffect, useMemo, useState } from "react";
// import { supabase } from "../../supabaseClient";
// import { supabaseAdmin } from "../../supabaseAdminClient"; // Import admin client
// import { useNavigate } from "react-router-dom";

// export default function AdminDashboard() {
//   const navigate = useNavigate();

//   const [profiles, setProfiles] = useState([]);
//   const [activations, setActivations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const [activeTab, setActiveTab] = useState("overview");
//   const [search, setSearch] = useState("");

//   const [selectedRow, setSelectedRow] = useState(null);
//   const [error, setError] = useState("");

//   const handleLogout = () => {
//     sessionStorage.removeItem("admin_access");
//     navigate("/admin");
//   };

//   // ✅ Fetch all data - FIXED to use auth.admin.listUsers
//   const fetchAll = async (isRefresh = false) => {
//     try {
//       setError("");
//       if (isRefresh) setRefreshing(true);
//       else setLoading(true);

//       // Fetch users from Supabase Auth using ADMIN client
//       const { data: authData, error: authErr } =
//         await supabaseAdmin.auth.admin.listUsers();

//       const { data: aData, error: aErr } = await supabase
//         .from("college_activations")
//         .select("*")
//         .order("updated_at", { ascending: false });

//       if (authErr) throw authErr;
//       if (aErr) throw aErr;

//       // Transform auth users to profiles format
//       // Filter out users without emails (anonymous/guest users)
//       const transformedProfiles =
//         authData?.users
//           ?.filter((user) => user.email) // Only include users with valid emails
//           ?.map((user) => ({
//             id: user.id,
//             username:
//               user.user_metadata?.username ||
//               user.user_metadata?.display_name ||
//               user.email?.split("@")[0] ||
//               "Unknown",
//             email: user.email,
//             avatar_url: user.user_metadata?.avatar_url || null,
//             is_guest: user.user_metadata?.is_guest || false,
//             created_at: user.created_at,
//             last_sign_in: user.last_sign_in_at,
//             provider: user.app_metadata?.provider || "email"
//           })) || [];

//       setProfiles(transformedProfiles);
//       setActivations(aData || []);
//     } catch (err) {
//       console.log("admin fetch error:", err.message);
//       setError(err.message || "Failed to load admin data");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   // ✅ Overview stats
//   const stats = useMemo(() => {
//     const totalProfiles = profiles.length;
//     const totalActivations = activations.length;
//     const guestProfiles = profiles.filter((p) => p.is_guest).length;
//     const realProfiles = totalProfiles - guestProfiles;

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
//       realProfiles,
//       guestProfiles,
//       totalActivations,
//       selfReflectionDone,
//       realityCheckDone,
//       totalCompletedBoth
//     };
//   }, [profiles, activations]);

//   // ✅ Search filtering
//   const filteredProfiles = useMemo(() => {
//     if (!search.trim()) return profiles;
//     const q = search.trim().toLowerCase();

//     return profiles.filter((p) => {
//       return (
//         (p.username || "").toLowerCase().includes(q) ||
//         (p.id || "").toLowerCase().includes(q) ||
//         (p.email || "").toLowerCase().includes(q)
//       );
//     });
//   }, [profiles, search]);

//   const filteredActivations = useMemo(() => {
//     if (!search.trim()) return activations;
//     const q = search.trim().toLowerCase();

//     return activations.filter((a) => {
//       return (
//         (a.name || "").toLowerCase().includes(q) ||
//         (a.email || "").toLowerCase().includes(q) ||
//         (a.college || "").toLowerCase().includes(q) ||
//         (a.user_id || "").toLowerCase().includes(q) ||
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
//       <div className="max-w-[1400px] mx-auto">
//         {/* HEADER */}
//         <div className="flex items-center justify-between gap-4 flex-wrap">
//           <h1 className="text-black font-extrabold text-[28px] md:text-[48px] tracking-[-0.04em]">
//             admin dashboard
//           </h1>

//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => fetchAll(true)}
//               disabled={refreshing}
//               className="
//                 bg-black text-white font-extrabold
//                 px-6 py-3 rounded-full
//                 border-2 border-black
//                 shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
//                 hover:translate-x-[2px] hover:translate-y-[2px]
//                 hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
//                 disabled:opacity-50
//                 transition-all duration-200
//               "
//             >
//               {refreshing ? "refreshing..." : "🔄 refresh"}
//             </button>

//             <button
//               onClick={handleLogout}
//               className="text-black font-extrabold underline"
//             >
//               logout
//             </button>
//           </div>
//         </div>

//         {/* ERROR */}
//         {error && (
//           <p className="mt-4 text-evolve-pink font-bold text-[16px]">{error}</p>
//         )}

//         {/* TABS + SEARCH */}
//         <div className="mt-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
//           <div className="flex gap-2 flex-wrap">
//             {["overview", "profiles", "activations", "insights"].map((t) => (
//               <button
//                 key={t}
//                 onClick={() => setActiveTab(t)}
//                 className={`
//                   px-4 py-2 rounded-full border-2 border-black
//                   font-extrabold text-[14px] md:text-[16px]
//                   transition-all duration-200
//                   ${
//                     activeTab === t
//                       ? "bg-black text-white"
//                       : "bg-transparent text-black hover:bg-black/10"
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
//           <div className="mt-10 text-center">
//             <div className="inline-block animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full" />
//             <p className="mt-4 text-black font-semibold text-[18px]">
//               loading admin data...
//             </p>
//           </div>
//         )}

//         {!loading && (
//           <>
//             {/* OVERVIEW */}
//             {activeTab === "overview" && (
//               <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <StatCard title="total profiles" value={stats.totalProfiles} />
//                 <StatCard title="real profiles" value={stats.realProfiles} />
//                 <StatCard title="guest profiles" value={stats.guestProfiles} />
//                 <StatCard
//                   title="total activations"
//                   value={stats.totalActivations}
//                 />
//                 <StatCard
//                   title="self reflection done"
//                   value={stats.selfReflectionDone}
//                 />
//                 <StatCard
//                   title="reality check done"
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
//                   profiles ({filteredProfiles.length} / {profiles.length})
//                 </h2>

//                 <div className="mt-6 overflow-x-auto">
//                   <table className="w-full min-w-[1000px] border-collapse border-2 border-black">
//                     <thead>
//                       <tr className="text-left bg-black text-white">
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           username
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           email
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           is_guest
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           provider
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           id
//                         </th>
//                         <th className="p-4 font-extrabold">created</th>
//                       </tr>
//                     </thead>

//                     <tbody className="bg-black/10">
//                       {filteredProfiles.length === 0 ? (
//                         <tr>
//                           <td colSpan="6" className="p-8 text-center">
//                             <p className="text-black/70 font-bold">
//                               no profiles found
//                             </p>
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredProfiles.map((p) => (
//                           <tr
//                             key={p.id}
//                             className="border-t-2 border-black hover:bg-evolve-yellow/30 transition-colors"
//                           >
//                             <td className="p-4 font-bold text-black border-r-2 border-black">
//                               {p.username || "-"}
//                             </td>
//                             <td className="p-4 text-black border-r-2 border-black">
//                               {p.email || "-"}
//                             </td>
//                             <td className="p-4 text-black border-r-2 border-black">
//                               {p.is_guest ? "✅ yes" : "❌ no"}
//                             </td>
//                             <td className="p-4 text-black border-r-2 border-black">
//                               {p.provider || "email"}
//                             </td>
//                             <td className="p-4 text-black text-[11px] font-mono border-r-2 border-black">
//                               {p.id}
//                             </td>
//                             <td className="p-4 text-black text-[13px]">
//                               {p.created_at
//                                 ? new Date(p.created_at).toLocaleString()
//                                 : "-"}
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* ACTIVATIONS */}
//             {activeTab === "activations" && (
//               <div className="mt-10">
//                 <h2 className="text-black font-extrabold text-[22px] md:text-[28px]">
//                   college activations ({filteredActivations.length} /{" "}
//                   {activations.length})
//                 </h2>

//                 <div className="mt-6 overflow-x-auto">
//                   <table className="w-full min-w-[1200px] border-collapse border-2 border-black">
//                     <thead>
//                       <tr className="text-left bg-black text-white">
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           name
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           email
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           college
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           self reflection
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           reality check
//                         </th>
//                         <th className="p-4 font-extrabold border-r-2 border-black">
//                           updated
//                         </th>
//                         <th className="p-4 font-extrabold">details</th>
//                       </tr>
//                     </thead>

//                     <tbody className="bg-black/10">
//                       {filteredActivations.length === 0 ? (
//                         <tr>
//                           <td colSpan="7" className="p-8 text-center">
//                             <p className="text-black/70 font-bold">
//                               no activations found
//                             </p>
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredActivations.map((a) => (
//                           <tr
//                             key={a.id}
//                             className="border-t-2 border-black hover:bg-evolve-yellow/30 transition-colors"
//                           >
//                             <td className="p-4 font-bold text-black border-r-2 border-black">
//                               {a.name || "-"}
//                             </td>
//                             <td className="p-4 text-black border-r-2 border-black">
//                               {a.email || "-"}
//                             </td>
//                             <td className="p-4 text-black border-r-2 border-black">
//                               {a.college || "-"}
//                             </td>

//                             <td className="p-4 text-black border-r-2 border-black">
//                               {a?.self_reflection_answers?.completed
//                                 ? "✅ done"
//                                 : "❌ pending"}
//                             </td>

//                             <td className="p-4 text-black border-r-2 border-black">
//                               {a?.reality_check_answers?.completed
//                                 ? "✅ done"
//                                 : "❌ pending"}
//                             </td>

//                             <td className="p-4 text-black text-[13px] border-r-2 border-black">
//                               {a.updated_at
//                                 ? new Date(a.updated_at).toLocaleString()
//                                 : "-"}
//                             </td>

//                             <td className="p-4">
//                               <button
//                                 onClick={() => setSelectedRow(a)}
//                                 className="font-extrabold underline text-black hover:text-evolve-pink"
//                               >
//                                 view
//                               </button>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* INSIGHTS */}
//             {activeTab === "insights" && (
//               <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="bg-white rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
//                   <h3 className="text-black font-extrabold text-[22px]">
//                     college distribution
//                   </h3>

//                   <div className="mt-4 space-y-2">
//                     {collegeStats.length === 0 ? (
//                       <p className="text-black/70 font-bold">no data yet</p>
//                     ) : (
//                       collegeStats.map(([name, count]) => (
//                         <div
//                           key={name}
//                           className="flex justify-between font-bold text-black border-b border-black/10 pb-2"
//                         >
//                           <span>{name}</span>
//                           <span className="bg-black text-white px-3 py-1 rounded-full text-[14px]">
//                             {count}
//                           </span>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
//                   <h3 className="text-black font-extrabold text-[22px]">
//                     top interests (self reflection)
//                   </h3>

//                   <div className="mt-4 space-y-2">
//                     {topInterests.length === 0 ? (
//                       <p className="text-black/70 font-bold">
//                         no self reflection submissions yet
//                       </p>
//                     ) : (
//                       topInterests.map(([key, count]) => (
//                         <div
//                           key={key}
//                           className="flex justify-between font-bold text-black border-b border-black/10 pb-2"
//                         >
//                           <span className="capitalize">{key}</span>
//                           <span className="bg-black text-white px-3 py-1 rounded-full text-[14px]">
//                             {count}
//                           </span>
//                         </div>
//                       ))
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
//               className="absolute inset-0 bg-black/60"
//               onClick={() => setSelectedRow(null)}
//             />

//             <div
//               className="
//                 relative z-10
//                 w-full max-w-[1000px]
//                 bg-white
//                 border-4 border-black
//                 rounded-3xl
//                 shadow-[12px_12px_0px_rgba(0,0,0,0.4)]
//                 p-8
//                 max-h-[85vh]
//                 overflow-y-auto
//               "
//             >
//               <div className="flex items-start justify-between gap-4 mb-6">
//                 <div>
//                   <p className="text-black font-extrabold text-[28px] tracking-[-0.04em]">
//                     {selectedRow.name || "-"}
//                   </p>
//                   <p className="text-black font-bold text-[16px] mt-1">
//                     {selectedRow.email}
//                   </p>
//                   <p className="text-black/70 font-bold">
//                     {selectedRow.college}
//                   </p>
//                   <p className="text-black/50 text-[12px] font-mono mt-2">
//                     ID: {selectedRow.id}
//                   </p>
//                   <p className="text-black/50 text-[12px] mt-1">
//                     Updated:{" "}
//                     {selectedRow.updated_at
//                       ? new Date(selectedRow.updated_at).toLocaleString()
//                       : "-"}
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => setSelectedRow(null)}
//                   className="text-black font-extrabold text-[32px] hover:text-evolve-pink transition-colors"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="h-[3px] bg-black/20 mb-6" />

//               {/* Self Reflection */}
//               <div className="mb-8">
//                 <h3 className="text-black font-extrabold text-[22px] mb-3">
//                   📝 self reflection
//                 </h3>

//                 {selectedRow.self_reflection_answers?.completed ? (
//                   <div className="bg-evolve-yellow/50 border-2 border-black p-5 rounded-2xl">
//                     <pre className="text-[13px] text-black whitespace-pre-wrap overflow-x-auto">
//                       {JSON.stringify(
//                         selectedRow.self_reflection_answers,
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                 ) : (
//                   <p className="text-black/70 font-bold bg-black/5 p-4 rounded-2xl border-2 border-black/20">
//                     ❌ not completed yet
//                   </p>
//                 )}
//               </div>

//               <div className="h-[3px] bg-black/20 mb-6" />

//               {/* Reality Check */}
//               <div>
//                 <h3 className="text-black font-extrabold text-[22px] mb-3">
//                   🔍 reality check
//                 </h3>

//                 {selectedRow.reality_check_answers?.completed ? (
//                   <div className="bg-evolve-yellow/50 border-2 border-black p-5 rounded-2xl">
//                     <pre className="text-[13px] text-black whitespace-pre-wrap overflow-x-auto">
//                       {JSON.stringify(
//                         selectedRow.reality_check_answers,
//                         null,
//                         2
//                       )}
//                     </pre>
//                   </div>
//                 ) : (
//                   <p className="text-black/70 font-bold bg-black/5 p-4 rounded-2xl border-2 border-black/20">
//                     ❌ not completed yet
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value }) {
//   return (
//     <div className="bg-white rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.3)] transition-all duration-200">
//       <p className="text-black font-extrabold text-[16px] tracking-[-0.04em] uppercase">
//         {title}
//       </p>
//       <p className="mt-3 text-black font-extrabold text-[48px] tracking-[-0.04em]">
//         {value}
//       </p>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
// import { supabaseAdmin } from "../../supabaseAdminClient";
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

  // ✅ Gemini AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiInsight, setAiInsight] = useState("");

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // ✅ allow text selection ONLY on this route
  useEffect(() => {
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = "text";
    return () => {
      document.body.style.userSelect = prev || "";
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_access");
    navigate("/admin");
  };

  // =========================================================
  // ✅ HELPERS
  // =========================================================
  const safeParseJson = (val) => {
    if (!val) return null;
    if (typeof val === "object") return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return null;
  };

  const getCompleted = (maybeJson) => {
    const obj = safeParseJson(maybeJson);
    if (!obj) return false;

    const c = obj.completed;

    if (typeof c === "boolean") return c;
    if (typeof c === "string") return c.toLowerCase() === "true";

    return false;
  };

  const getRealityMajor = (activationRow) => {
    if (activationRow?.reality_check_major)
      return activationRow.reality_check_major;

    const rcObj = safeParseJson(activationRow?.reality_check_answers);
    if (rcObj?.major) return rcObj.major;
    if (rcObj?.reality_check_major) return rcObj.reality_check_major;

    return "-";
  };

  const downloadCSV = (rows, filename = "export.csv") => {
    if (!rows || !rows.length) return;

    const keys = Object.keys(rows[0]);

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const str =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csv = [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => escapeCSV(r[k])).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  // =========================================================
  // ✅ AUTH USERS (pagination fix)
  // =========================================================
  // const fetchAllAuthUsers = async () => {
  //   const allUsers = [];
  //   let page = 1;
  //   const perPage = 200;

  //   while (true) {
  //     const { data, error } = await supabaseAdmin.auth.admin.listUsers({
  //       page,
  //       perPage
  //     });

  //     if (error) throw error;

  //     const users = data?.users || [];
  //     allUsers.push(...users);

  //     if (users.length < perPage) break;
  //     page += 1;
  //   }

  //   return allUsers;
  // };

  // =========================================================
  // ✅ Fetch all data (Auth Users + activations)
  // =========================================================
  const fetchAll = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // ✅ FETCH PROFILES (REAL USERS ONLY)
      const { data: pData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        // .or("is_guest.is.null,is_guest.eq.false")
        .order("created_at", { ascending: false });

      if (pErr) throw pErr;

      // ✅ FETCH ACTIVATIONS
      const { data: aData, error: aErr } = await supabase
        .from("college_activations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (aErr) throw aErr;

      setProfiles(pData || []);
      setActivations(aData || []);
    } catch (err) {
      console.error("admin fetch error:", err.message);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // useEffect(() => {
  //   const test = async () => {
  //     const { data, error } = await supabase.from("profiles").select("*");

  //     console.log("PROFILES TABLE RAW 👉", data, error);
  //   };

  //   test();
  // }, []);

  // =========================================================
  // ✅ Stats
  // =========================================================
  const stats = useMemo(() => {
    const totalProfiles = profiles.length;
    const totalActivations = activations.length;

    const guestProfiles = profiles.filter((p) => p.is_guest).length;
    const realProfiles = totalProfiles - guestProfiles;

    const selfReflectionDone = activations.filter((x) =>
      getCompleted(x?.self_reflection_answers)
    ).length;

    const realityCheckDone = activations.filter((x) =>
      getCompleted(x?.reality_check_answers)
    ).length;

    const totalCompletedBoth = activations.filter(
      (x) =>
        getCompleted(x?.self_reflection_answers) &&
        getCompleted(x?.reality_check_answers)
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

  // =========================================================
  // ✅ Search filtering
  // =========================================================
  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.trim().toLowerCase();

    return profiles.filter((p) => {
      return (
        (p.username || "").toLowerCase().includes(q) ||
        (p.id || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.provider || "").toLowerCase().includes(q)
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

  // =========================================================
  // ✅ Insights (manual)
  // =========================================================
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
      const sr = safeParseJson(a?.self_reflection_answers);
      const fields = sr?.fields || [];

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

  const realityCheckWordInsights = useMemo(() => {
    const map = {};

    activations.forEach((a) => {
      const rc = safeParseJson(a?.reality_check_answers);
      const answersObj = rc?.answers || {};

      Object.values(answersObj).forEach((entry) => {
        if (entry?.responses && Array.isArray(entry.responses)) {
          entry.responses.forEach((r) => {
            String(r)
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .split(/\s+/)
              .filter(Boolean)
              .filter((w) => w.length >= 4)
              .forEach((w) => {
                map[w] = (map[w] || 0) + 1;
              });
          });
        }
      });
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [activations]);

  // =========================================================
  // ✅ Gemini AI Insights (frontend-only POC)
  // =========================================================
  const generateAiInsights = async () => {
    try {
      setAiError("");
      setAiInsight("");

      if (!GEMINI_API_KEY) {
        setAiError("Missing VITE_GEMINI_API_KEY in .env");
        return;
      }

      setAiLoading(true);

      const compactDataset = activations.slice(0, 40).map((a) => {
        const sr = safeParseJson(a?.self_reflection_answers);
        const rc = safeParseJson(a?.reality_check_answers);

        return {
          name: a.name,
          college: a.college,
          reality_check_major: getRealityMajor(a),
          self_reflection_completed: !!sr,
          reality_check_completed: !!rc,
          self_reflection_fields: sr?.fields || [],
          reality_check_answers: rc?.answers || {}
        };
      });

      const prompt = `
      You are an admin analyst for a design education platform called EVOLVE.
      Dataset: ${JSON.stringify(compactDataset)}
      
      Generate insights:
      1) Overall summary (2 lines)
      2) College-wise trends (top 3)
      3) Common interests (top 5)
      4) Worries + motivations (top 5)
      5) Suggestions (3 bullet points)
    `;

      // 2026 Updated Model: gemini-2.5-flash is the stable workhorse
      // Note: If you want the absolute newest, you can try gemini-3-flash-preview
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      const raw = await res.json();

      if (!res.ok) {
        console.error("Gemini raw error:", raw);
        throw new Error(raw?.error?.message || "Gemini request failed");
      }

      const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No AI insights returned");

      setAiInsight(text);
    } catch (e) {
      console.error("Gemini AI error:", e.message);
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-evolve-yellow px-6 md:px-16 py-10">
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mt-10 flex-wrap">
          <h1 className="text-black font-extrabold text-[28px] md:text-[48px] tracking-[-0.04em]">
            admin dashboard
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              className="
                bg-black text-white font-extrabold
                px-5 py-2.5 rounded-full
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
              onClick={() =>
                downloadCSV(
                  filteredProfiles,
                  `auth_users_${new Date().toISOString().slice(0, 10)}.csv`
                )
              }
              className="
                bg-black/10 text-black font-extrabold
                px-5 py-2.5 rounded-full
                border-2 border-black
                shadow-[4px_4px_0px_rgba(0,0,0,0.18)]
                hover:bg-black/20
                transition-all duration-200
              "
            >
              ⬇️ profiles CSV
            </button>

            <button
              onClick={() =>
                downloadCSV(
                  filteredActivations.map((a) => ({
                    id: a.id,
                    user_id: a.user_id,
                    name: a.name,
                    email: a.email,
                    college: a.college,
                    reality_check_major: getRealityMajor(a),
                    self_reflection_completed: getCompleted(
                      a?.self_reflection_answers
                    ),
                    reality_check_completed: getCompleted(
                      a?.reality_check_answers
                    ),
                    updated_at: a.updated_at
                  })),
                  `college_activations_${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`
                )
              }
              className="
                bg-black/10 text-black font-extrabold
                px-5 py-2.5 rounded-full
                border-2 border-black
                shadow-[4px_4px_0px_rgba(0,0,0,0.18)]
                hover:bg-black/20
                transition-all duration-200
              "
            >
              ⬇️ activations CSV
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
                      : "bg-black/10 text-black hover:bg-black/20"
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
              bg-black/10
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
                <StatCard
                  title="total auth users"
                  value={stats.totalProfiles}
                />
                <StatCard title="real users" value={stats.realProfiles} />
                <StatCard title="guest users" value={stats.guestProfiles} />
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
                  authentication users ({filteredProfiles.length} /{" "}
                  {profiles.length})
                </h2>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse border-2 border-black text-[13px] md:text-[14px]">
                    <thead>
                      <tr className="text-left bg-black text-white">
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          username
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          email
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          provider
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          last sign in
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          id
                        </th>
                        <th className="p-3 font-extrabold whitespace-nowrap">
                          created
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-black/10">
                      {filteredProfiles.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center">
                            <p className="text-black/70 font-bold">
                              no users found
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredProfiles.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t-2 border-black hover:bg-black/20 transition-colors"
                          >
                            <td className="p-3 font-bold text-black border-r-2 border-black whitespace-nowrap">
                              {p.username || "-"}
                            </td>

                            <td className="p-3 text-black border-r-2 border-black break-all">
                              {p.email || "-"}
                            </td>

                            <td className="p-3 text-black border-r-2 border-black whitespace-nowrap font-bold">
                              {p.provider || "email"}
                            </td>

                            <td className="p-3 text-black border-r-2 border-black text-[12px] whitespace-nowrap">
                              {p.last_sign_in_at && p.last_sign_in_at !== "-"
                                ? new Date(p.last_sign_in_at).toLocaleString()
                                : "-"}
                            </td>

                            <td className="p-3 text-black text-[11px] font-mono border-r-2 border-black break-all">
                              {p.id}
                            </td>

                            <td className="p-3 text-black text-[12px] whitespace-nowrap">
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
                  <table className="w-full min-w-[1100px] border-collapse border-2 border-black text-[13px] md:text-[14px]">
                    <thead>
                      <tr className="text-left bg-black text-white">
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          name
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          email
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          college
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          major
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          self reflection
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          reality check
                        </th>
                        <th className="p-3 font-extrabold border-r-2 border-black whitespace-nowrap">
                          updated
                        </th>
                        <th className="p-3 font-extrabold whitespace-nowrap">
                          details
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-black/10">
                      {filteredActivations.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center">
                            <p className="text-black/70 font-bold">
                              no activations found
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredActivations.map((a) => {
                          const srDone = getCompleted(
                            a?.self_reflection_answers
                          );
                          const rcDone = getCompleted(a?.reality_check_answers);

                          return (
                            <tr
                              key={a.id}
                              className="border-t-2 border-black hover:bg-black/20 transition-colors"
                            >
                              <td className="p-3 font-bold text-black border-r-2 border-black whitespace-nowrap">
                                {a.name || "-"}
                              </td>

                              <td className="p-3 text-black border-r-2 border-black break-all">
                                {a.email || "-"}
                              </td>

                              <td className="p-3 text-black border-r-2 border-black whitespace-nowrap">
                                {a.college || "-"}
                              </td>

                              <td className="p-3 text-black border-r-2 border-black font-bold whitespace-nowrap">
                                {getRealityMajor(a)}
                              </td>

                              <td className="p-3 text-black border-r-2 border-black font-bold whitespace-nowrap">
                                {srDone
                                  ? "✅ done"
                                  : rcDone
                                    ? "✅ done (auto)"
                                    : "❌ pending"}
                              </td>

                              <td className="p-3 text-black border-r-2 border-black font-bold whitespace-nowrap">
                                {rcDone ? "✅ done" : "❌ pending"}
                              </td>

                              <td className="p-3 text-black text-[12px] border-r-2 border-black whitespace-nowrap">
                                {a.updated_at
                                  ? new Date(a.updated_at).toLocaleString()
                                  : "-"}
                              </td>

                              <td className="p-3">
                                <button
                                  onClick={() => setSelectedRow(a)}
                                  className="font-extrabold underline text-black hover:text-evolve-pink"
                                >
                                  view
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INSIGHTS */}
            {activeTab === "insights" && (
              <div className="mt-10">
                {/* ✅ AI Insights Section */}
                <div className="bg-black/10 rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-black font-extrabold text-[22px]">
                      ✨ ai insights (gemini)
                    </h3>

                    <button
                      onClick={generateAiInsights}
                      disabled={aiLoading}
                      className="
                        bg-black text-white font-extrabold
                        px-6 py-3 rounded-full
                        border-2 border-black
                        shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
                        disabled:opacity-50
                      "
                    >
                      {aiLoading ? "generating..." : "generate ai report"}
                    </button>
                  </div>

                  {aiError && (
                    <p className="mt-4 text-evolve-pink font-bold">{aiError}</p>
                  )}

                  {!aiError && !aiInsight && (
                    <p className="mt-4 text-black/70 font-bold">
                      click the button to generate a report from your activity
                      data.
                    </p>
                  )}

                  {/* {aiInsight && (
                    <pre className="mt-4 text-black whitespace-pre-wrap text-[14px] font-semibold">
                      {aiInsight}
                    </pre>
                  )} */}
                  {aiInsight && <AiReport text={aiInsight} />}
                </div>

                {/* ✅ Existing Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-black/10 rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
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

                  <div className="bg-black/10 rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)]">
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

                  {/* <div className="bg-black/10 rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] md:col-span-2">
                    <h3 className="text-black font-extrabold text-[22px]">
                      top reality check words
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {realityCheckWordInsights.length === 0 ? (
                        <p className="text-black/70 font-bold">
                          no reality check submissions yet
                        </p>
                      ) : (
                        realityCheckWordInsights.map(([word, count]) => (
                          <span
                            key={word}
                            className="bg-black text-white px-4 py-2 rounded-full font-extrabold text-[14px]"
                          >
                            {word} · {count}
                          </span>
                        ))
                      )}
                    </div>
                  </div> */}
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
                bg-evolve-yellow
                border-4 border-black
                rounded-3xl
                shadow-[12px_12px_0px_rgba(0,0,0,0.4)]
                p-8
                max-h-[85vh]
                overflow-y-auto
                select-text
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

                  <p className="text-black font-bold mt-2">
                    major: {getRealityMajor(selectedRow)}
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

                {getCompleted(selectedRow.self_reflection_answers) ? (
                  <div className="bg-black/10 border-2 border-black p-5 rounded-2xl">
                    <pre className="text-[13px] text-black whitespace-pre-wrap overflow-x-auto select-text">
                      {JSON.stringify(
                        safeParseJson(selectedRow.self_reflection_answers),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <p className="text-black/70 font-bold bg-black/10 p-4 rounded-2xl border-2 border-black/20">
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

                {getCompleted(selectedRow.reality_check_answers) ? (
                  <div className="bg-black/10 border-2 border-black p-5 rounded-2xl">
                    <pre className="text-[13px] text-black whitespace-pre-wrap overflow-x-auto select-text">
                      {JSON.stringify(
                        safeParseJson(selectedRow.reality_check_answers),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <p className="text-black/70 font-bold bg-black/10 p-4 rounded-2xl border-2 border-black/20">
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
    <div className="bg-black/10 rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.3)] transition-all duration-200">
      <p className="text-black font-extrabold text-[16px] tracking-[-0.04em] uppercase">
        {title}
      </p>
      <p className="mt-3 text-black font-extrabold text-[48px] tracking-[-0.04em]">
        {value}
      </p>
    </div>
  );
}

function AiReport({ text }) {
  const [copied, setCopied] = useState(false);
  const reportRef = React.useRef(null);

  // normalize
  const cleaned = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const blocks = cleaned.includes("**")
    ? cleaned.split(/\n(?=\*\*)/g)
    : cleaned.split(/\n\n+/g);

  // ✅ ONLY highlight HIGH-VALUE tokens (reduced pink)
  const highlightImportant = (input) => {
    const str = String(input || "");

    // ✅ BALANCED highlight words (not too much, not too less)
    const keywords = [
      // completion & status
      "completed",
      "done",
      "pending",
      "not completed",

      // career / student pain points
      "career",
      "job",
      "jobs",
      "portfolio",
      "internship",
      "internships",
      "placement",
      "placements",
      "salary",
      "competition",
      "confidence",
      "anxiety",
      "confusion",
      "guidance",
      "mentor",
      "mentorship",
      "skills",
      "learning",
      "growth",
      "future",
      "direction",

      // education / decision points
      "roi",
      "fees",
      "financial",
      "money",
      "sustainability",
      "happiness",

      // AI / market
      "ai",
      "impact",

      // action terms
      "recommendation",
      "recommendations",
      "suggestion",
      "suggestions",
      "next steps",
      "strategy",
      "plan",

      // colleges (add your own here)
      "mit wpu",
      "mit adtu",
      "symbiosis",
      "flame",

      // common majors (add your own here)
      "ui",
      "ux",
      "security",
      "graphic design",
      "product design",
      "interaction design",
      "industrial design",
      "photography"
    ];

    // ✅ build regex dynamically (escape words)
    const escaped = keywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((a, b) => b.length - a.length); // longest first (important!)

    // ✅ highlight:
    // - numbers
    // - "top 3" type
    // - the keywords list
    const regex = new RegExp(
      `(${[
        "\\b\\d+\\b", // numbers
        "\\btop\\s*\\d+\\b", // "top 3"
        ...escaped.map((w) => `\\b${w}\\b`)
      ].join("|")})`,
      "gi"
    );

    const parts = str.split(regex).filter(Boolean);

    return parts.map((t, i) => {
      const lower = t.toLowerCase();

      const isNumber = /^\d+$/.test(t);
      const isTop = /top\s*\d+/i.test(t);

      const isKeyword = keywords.some((k) => lower === k.toLowerCase());

      // ✅ if highlight conditions
      const shouldHighlight = isNumber || isTop || isKeyword;

      return (
        <span
          key={i}
          className={shouldHighlight ? "text-evolve-pink font-extrabold" : ""}
        >
          {t}
        </span>
      );
    });
  };

  const renderInline = (line) => {
    // ✅ bold: **text**
    const parts = String(line)
      .split(/(\*\*.*?\*\*)/g)
      .filter(Boolean);

    return parts.map((p, idx) => {
      // ✅ keep bold as BLACK (not pink)
      if (p.startsWith("**") && p.endsWith("**")) {
        const boldText = p.replace(/\*\*/g, "");
        return (
          <span key={idx} className="font-extrabold text-black">
            {highlightImportant(boldText)}
          </span>
        );
      }

      return <span key={idx}>{highlightImportant(p)}</span>;
    });
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const downloadPDF = async () => {
    try {
      const el = reportRef.current;
      if (!el) return;

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`ai_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.log("PDF error:", err);
      alert("PDF download failed.");
    }
  };

  return (
    <div className="mt-5">
      {/* ✅ ACTIONS */}
      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={copyReport}
          className="
            bg-black/10 text-black font-extrabold
            px-5 py-2.5 rounded-full
            border-2 border-black
            shadow-[4px_4px_0px_rgba(0,0,0,0.18)]
            hover:bg-black/20
            transition-all duration-200
          "
        >
          {copied ? "✅ copied!" : "📋 copy report"}
        </button>

        <button
          onClick={downloadPDF}
          className="
            bg-black text-white font-extrabold
            px-5 py-2.5 rounded-full
            border-2 border-black
            shadow-[4px_4px_0px_rgba(0,0,0,0.25)]
            hover:translate-x-[2px] hover:translate-y-[2px]
            hover:shadow-[2px_2px_0px_rgba(0,0,0,0.25)]
            transition-all duration-200
          "
        >
          ⬇️ download PDF
        </button>
      </div>

      {/* ✅ REPORT CONTENT */}
      <div ref={reportRef} className="space-y-4">
        {blocks.map((block, i) => {
          const lines = block.split("\n").filter(Boolean);

          const first = lines[0] || "";
          const isHeading = first.includes("**") || /^\d+\)/.test(first);

          const title = isHeading
            ? first.replace(/\*\*/g, "").trim()
            : `Insight ${i + 1}`;

          const bodyLines = isHeading ? lines.slice(1) : lines;

          const bullets = bodyLines.filter((l) => /^\s*[*-]\s+/.test(l));
          const normal = bodyLines.filter((l) => !/^\s*[*-]\s+/.test(l));

          return (
            <div
              key={i}
              className="
                bg-black/10
                border-2 border-black
                rounded-3xl
                p-5
                shadow-[4px_4px_0px_rgba(0,0,0,0.18)]
              "
            >
              {/* ✅ HEADING BLACK */}
              <h4 className="text-black font-extrabold text-[18px] md:text-[20px] tracking-[-0.03em]">
                {title}
              </h4>

              {normal.length > 0 && (
                <div className="mt-3 space-y-2 text-black text-[14px] md:text-[15px] leading-[1.7] font-semibold">
                  {normal.map((l, idx) => (
                    <p key={idx}>{renderInline(l)}</p>
                  ))}
                </div>
              )}

              {bullets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {bullets.map((b, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-black text-[14px] md:text-[15px] leading-[1.7] font-semibold"
                    >
                      {/* bullet black */}
                      <span className="mt-[2px] font-extrabold text-black">
                        •
                      </span>

                      <span>{renderInline(b.replace(/^\s*[*-]\s+/, ""))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
