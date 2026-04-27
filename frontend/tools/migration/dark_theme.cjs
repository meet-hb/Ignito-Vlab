const fs = require('fs');

// SidebarContent.tsx
let h = fs.readFileSync('src/components/SidebarContent.tsx', 'utf8');
h = h.replace(/bg-white\/80/g, 'bg-zinc-950/80');
h = h.replace(/bg-white/g, 'bg-zinc-900');
h = h.replace(/border-rose-100/g, 'border-white/5');
h = h.replace(/border-rose-200/g, 'border-white/10');
h = h.replace(/bg-rose-100/g, 'bg-rose-500/20');
h = h.replace(/text-rose-700/g, 'text-e11d48'); // Keep consistent with brand maroon
h = h.replace(/text-rose-800/g, 'text-rose-300');
h = h.replace(/bg-rose-50/g, 'bg-white/5');
h = h.replace(/text-gray-600/g, 'text-zinc-400');
h = h.replace(/text-gray-700/g, 'text-zinc-200');
h = h.replace(/text-gray-500/g, 'text-zinc-500');
h = h.replace(/<Box className="h-full flex flex-col bg-zinc-950\/80 backdrop-blur-lg border-r border-white\/5 transition-all duration-300 /g, '<Box className="h-full flex flex-col bg-zinc-950/80 backdrop-blur-lg border-r border-white/5 transition-all duration-300 ');
h = h.replace(/sx={{ background: 'linear-gradient\(180deg, rgba\(255, 255, 255, 0.72\), rgba\(251, 241, 240, 0.75\)\)' }}/g, 'sx={{ background: "transparent" }}');
fs.writeFileSync('src/components/SidebarContent.tsx', h);

// Dashboard.tsx
let d = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
d = d.replace(/bg-gradient-to-r from-rose-200 via-rose-100 to-white/g, 'bg-gradient-to-r from-rose-500 via-rose-400 to-transparent opacity-30');
d = d.replace(/text-gray-800/g, 'text-white');
d = d.replace(/text-gray-900/g, 'text-white');
d = d.replace(/text-gray-500/g, 'text-zinc-400');
d = d.replace(/text-rose-700/g, 'text-rose-400');
d = d.replace(/border-rose-100/g, 'border-white/10');
fs.writeFileSync('src/pages/Dashboard.tsx', d);

// LabGrid.tsx
let lg = fs.readFileSync('src/components/LabGrid.tsx', 'utf8');
lg = lg.replace(/text-gray-800/g, 'text-zinc-100');
lg = lg.replace(/text-rose-600/g, 'text-rose-400');
fs.writeFileSync('src/components/LabGrid.tsx', lg);

// SubLabGrid.tsx
let slg = fs.readFileSync('src/components/SubLabGrid.tsx', 'utf8');
slg = slg.replace(/bg-rose-50/g, 'bg-black/20');
slg = slg.replace(/border-rose-100/g, 'border-white/5');
slg = slg.replace(/text-rose-700/g, 'text-rose-400');
slg = slg.replace(/text-gray-600/g, 'text-zinc-400');
slg = slg.replace(/text-gray-800/g, 'text-zinc-100');
slg = slg.replace(/from-rose-50/g, 'from-black/40');
slg = slg.replace(/to-zinc-900\/40/g, 'to-zinc-900/40'); // if already replaced
slg = slg.replace(/to-white/g, 'to-zinc-900/40');
fs.writeFileSync('src/components/SubLabGrid.tsx', slg);

// Header.tsx updates for dark theme matching
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(/bg-white\/90/g, 'bg-zinc-900/90');
header = header.replace(/border-rose-100/g, 'border-white/10');
header = header.replace(/text-gray-700/g, 'text-zinc-100');
header = header.replace(/text-rose-500/g, 'text-rose-400');
header = header.replace(/text-rose-600/g, 'text-rose-400');
header = header.replace(/bg-gradient-to-b from-white to-white/g, 'bg-gradient-to-b from-zinc-900 to-zinc-950');
header = header.replace(/text-gray-900/g, 'text-white');
header = header.replace(/bg-white/g, 'bg-zinc-900');
fs.writeFileSync('src/components/Header.tsx', header);
