const fs = require('fs');

// SidebarContent.tsx
let h = fs.readFileSync('src/components/SidebarContent.tsx', 'utf8');
h = h.replace(/bg-zinc-950\/80/g, 'bg-white/70');
h = h.replace(/bg-zinc-900/g, 'bg-white');
h = h.replace(/border-white\/5/g, 'border-rose-100/50');
h = h.replace(/border-white\/10/g, 'border-rose-200');
h = h.replace(/bg-rose-500\/20/g, 'bg-rose-50');
h = h.replace(/text-e11d48/g, 'text-ignito-maroon'); 
h = h.replace(/text-rose-300/g, 'text-rose-800');
h = h.replace(/bg-white\/5/g, 'bg-rose-50');
h = h.replace(/text-zinc-400/g, 'text-gray-600');
h = h.replace(/text-zinc-200/g, 'text-gray-700');
h = h.replace(/text-zinc-500/g, 'text-gray-500');
h = h.replace(/text-rose-400/g, 'text-rose-600');
h = h.replace(/<Box className="h-full flex flex-col bg-zinc-950\/80 backdrop-blur-lg border-r border-white\/5 transition-all duration-300 /g, '<Box className="h-full flex flex-col bg-white/70 backdrop-blur-xl border-r border-rose-50 transition-all duration-300 ');
h = h.replace(/sx={{ background: "transparent" }}/g, 'sx={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 241, 240, 0.8))" }}');
fs.writeFileSync('src/components/SidebarContent.tsx', h);

// Dashboard.tsx
let d = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
d = d.replace(/bg-gradient-to-r from-rose-500 via-rose-400 to-transparent opacity-30/g, 'bg-gradient-to-r from-rose-200 via-rose-100 to-white');
d = d.replace(/text-white/g, 'text-gray-900');
d = d.replace(/text-zinc-400/g, 'text-gray-500');
d = d.replace(/text-rose-400/g, 'text-rose-700');
d = d.replace(/border-white\/10/g, 'border-white/60');
fs.writeFileSync('src/pages/Dashboard.tsx', d);

// LabGrid.tsx
let lg = fs.readFileSync('src/components/LabGrid.tsx', 'utf8');
lg = lg.replace(/text-zinc-100/g, 'text-gray-800');
lg = lg.replace(/text-rose-400/g, 'text-rose-600');
fs.writeFileSync('src/components/LabGrid.tsx', lg);

// SubLabGrid.tsx
let slg = fs.readFileSync('src/components/SubLabGrid.tsx', 'utf8');
slg = slg.replace(/bg-black\/20/g, 'bg-rose-50/60');
slg = slg.replace(/border-white\/5/g, 'border-rose-100');
slg = slg.replace(/text-rose-400/g, 'text-rose-700');
slg = slg.replace(/text-zinc-400/g, 'text-gray-500');
slg = slg.replace(/text-zinc-100/g, 'text-gray-800');
slg = slg.replace(/from-black\/40/g, 'from-white/60');
slg = slg.replace(/to-zinc-900\/40/g, 'to-rose-50/40');
fs.writeFileSync('src/components/SubLabGrid.tsx', slg);

// Header.tsx updates for light theme matching
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(/bg-zinc-900\/90/g, 'bg-white/90');
header = header.replace(/border-white\/10/g, 'border-rose-50');
header = header.replace(/text-zinc-100/g, 'text-gray-700');
header = header.replace(/text-rose-400/g, 'text-rose-600');
header = header.replace(/bg-gradient-to-b from-zinc-900 to-zinc-950/g, 'bg-gradient-to-b from-white to-rose-50/30');
header = header.replace(/text-white/g, 'text-gray-900');
header = header.replace(/bg-zinc-900/g, 'bg-white');
header = header.replace(/rgba\(24,24,27,0.85\)/g, 'rgba(255,255,255,0.85)');
header = header.replace(/rgba\(9,9,11,0.95\)/g, 'rgba(255,245,245,0.90)');
header = header.replace(/rgba\(0,0,0,0.40\)/g, 'rgba(190, 33, 38, 0.05)');
fs.writeFileSync('src/components/Header.tsx', header);
