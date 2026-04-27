const fs = require('fs');

function replaceAll() {
  // Dashboard.tsx
  let d = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
  d = d.replace(/className= flex-1 flex flex-col min-w-0 app-shell/g, 'className="flex-1 flex flex-col min-w-0 app-shell"');
  d = d.replace(/component=main className=flex-1 p-4 sm:p-6 lg:p-10 overflow-auto/g, 'component="main" className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto"');
  d = d.replace(/className=max-w-\[1700px\] mx-auto space-y-6/g, 'className="max-w-[1700px] mx-auto space-y-6"');
  d = d.replace(/className=grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5/g, 'className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"');
  d = d.replace(/className=glass-panel p-4 md:p-5 border border-rose-100/g, 'className="glass-panel p-4 md:p-5 border border-rose-100"');
  d = d.replace(/className=text-xs uppercase tracking-\[0.2em\] font-black text-rose-700/g, 'className="text-xs uppercase tracking-[0.2em] font-black text-rose-700"');
  d = d.replace(/className=text-3xl font-black text-gray-800 mt-2/g, 'className="text-3xl font-black text-gray-800 mt-2"');
  d = d.replace(/className=h-1 rounded-full bg-gradient-to-r from-rose-200 via-rose-100 to-white/g, 'className="h-1 rounded-full bg-gradient-to-r from-rose-200 via-rose-100 to-white"');
  d = d.replace(/className=space-y-6/g, 'className="space-y-6"');
  d = d.replace(/className=flex flex-col md:flex-row md:items-center md:justify-between gap-4/g, 'className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"');
  d = d.replace(/separator=\{<MdChevronRight size=\{18\} \/>\} className=text-sm font-semibold text-gray-500/g, 'separator={<MdChevronRight size={18} />} className="text-sm font-semibold text-gray-500"');
  d = d.replace(/underline=hover color=inherit onClick=\{\(\) => setSelectedLab\(null\)\} className=cursor-pointer/g, 'underline="hover" color="inherit" onClick={() => setSelectedLab(null)} className="cursor-pointer"');
  d = d.replace(/className=text-rose-700/g, 'className="text-rose-700"');
  d = d.replace(/variant=h3 className=text-3xl md:text-4xl font-black text-gray-900/g, 'variant="h3" className="text-3xl md:text-4xl font-black text-gray-900"');
  d = d.replace(/className=flex flex-col md:flex-row md:items-center md:justify-between gap-3/g, 'className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"');
  d = d.replace(/variant=h2 className=text-3xl md:text-5xl font-black text-gray-900/g, 'variant="h2" className="text-3xl md:text-5xl font-black text-gray-900"');
  d = d.replace(/className=text-ignito-maroon/g, 'className="text-ignito-maroon"');
  d = d.replace(/className=text-sm text-gray-500 uppercase tracking-wider font-bold/g, 'className="text-sm text-gray-500 uppercase tracking-wider font-bold"');
  fs.writeFileSync('src/pages/Dashboard.tsx', d);

  // LabGrid.tsx
  let l = fs.readFileSync('src/components/LabGrid.tsx', 'utf8');
  l = l.replace(/className= grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 font-sans/g, 'className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 font-sans"');
  l = l.replace(/className=cursor-pointer/g, 'className="cursor-pointer"');
  l = l.replace(/elevation=\{0\} className=frosted-card overflow-hidden h-full/g, 'elevation={0} className="frosted-card overflow-hidden h-full"');
  l = l.replace(/className=p-5 md:p-6/g, 'className="p-5 md:p-6"');
  l = l.replace(/className=relative h-28 md:h-32 w-full rounded-xl card-accent flex items-center justify-center overflow-hidden shadow-inner/g, 'className="relative h-28 md:h-32 w-full rounded-xl card-accent flex items-center justify-center overflow-hidden shadow-inner"');
  l = l.replace(/component=img/g, 'component="img"');
  l = l.replace(/className=max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110/g, 'className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"');
  l = l.replace(/referrerPolicy=no-referrer/g, 'referrerPolicy="no-referrer"');
  l = l.replace(/variant=h6 className=text-gray-800 font-black text-base md:text-lg mt-4 text-center uppercase tracking-wider/g, 'variant="h6" className="text-gray-800 font-black text-base md:text-lg mt-4 text-center uppercase tracking-wider"');
  l = l.replace(/className=mt-4 flex items-center justify-center gap-1 text-rose-600 font-bold text-sm/g, 'className="mt-4 flex items-center justify-center gap-1 text-rose-600 font-bold text-sm"');
  fs.writeFileSync('src/components/LabGrid.tsx', l);

  // SubLabGrid.tsx
  let s = fs.readFileSync('src/components/SubLabGrid.tsx', 'utf8');
  s = s.replace(/className= grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5"');
  s = s.replace(/className=cursor-pointer/g, 'className="cursor-pointer"');
  s = s.replace(/elevation=\{0\} className=frosted-card h-full/g, 'elevation={0} className="frosted-card h-full"');
  s = s.replace(/className=px-4 md:px-5 py-4 md:py-5 bg-rose-50 border-b border-rose-100/g, 'className="px-4 md:px-5 py-4 md:py-5 bg-rose-50 border-b border-rose-100"');
  s = s.replace(/className=text-xs font-black tracking-widest uppercase text-rose-700/g, 'className="text-xs font-black tracking-widest uppercase text-rose-700"');
  s = s.replace(/className=p-4 md:p-5 flex flex-col gap-3/g, 'className="p-4 md:p-5 flex flex-col gap-3"');
  s = s.replace(/className=h-20 md:h-24 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-r from-rose-50 to-white/g, 'className="h-20 md:h-24 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-r from-rose-50 to-white"');
  s = s.replace(/className=max-h-full max-w-full object-contain referrerPolicy=no-referrer/g, 'className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer"');
  s = s.replace(/className=text-sm text-gray-600/g, 'className="text-sm text-gray-600"');
  s = s.replace(/className=font-bold text-gray-800/g, 'className="font-bold text-gray-800"');
  s = s.replace(/className=flex items-center justify-between mt-auto text-rose-700 font-black/g, 'className="flex items-center justify-between mt-auto text-rose-700 font-black"');
  s = s.replace(/className=flex items-center gap-1/g, 'className="flex items-center gap-1"');
  s = s.replace(/className=text-yellow-500/g, 'className="text-yellow-500"');
  s = s.replace(/className=text-xs uppercase tracking-widest/g, 'className="text-xs uppercase tracking-widest"');
  s = s.replace(/onClick=\{\(\) => navigate\(\/admin\/labs\/view\/\)\}/g, 'onClick={() => navigate("/admin/labs/view/")}');
  fs.writeFileSync('src/components/SubLabGrid.tsx', s);

  // Header.tsx (retry to ensure any missed)
  let h = fs.readFileSync('src/components/Header.tsx', 'utf8');
  h = h.replace(/<div className=rounded-2xl px-3 py-1 glass-panel flex items-center gap-2>/g, '<div className=\"rounded-2xl px-3 py-1 glass-panel flex items-center gap-2\">');
  fs.writeFileSync('src/components/Header.tsx', h);
}

replaceAll();
console.log("Fixed files!")
