// Apply saved preferences before the page paints.
(()=>{
  const root=document.documentElement;
  let theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  let tablet=false;
  try{const saved=localStorage.getItem('recall-theme');if(saved==='dark'||saved==='light')theme=saved;tablet=localStorage.getItem('recall-tablet')==='on';}catch{}
  root.dataset.theme=theme;
  root.classList.toggle('tablet-mode',tablet);
  window.addEventListener('DOMContentLoaded',()=>{
    const dark=document.querySelector('#theme-toggle'),pen=document.querySelector('#tablet-toggle');
    const update=()=>{
      dark.textContent=`Dark mode: ${theme==='dark'?'on':'off'}`;
      dark.setAttribute('aria-pressed',String(theme==='dark'));
      pen.textContent=`Tablet pen: ${tablet?'on':'off'}`;
      pen.setAttribute('aria-pressed',String(tablet));
      document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#151c18':'#224c3c';
    };
    dark.onclick=()=>{theme=theme==='dark'?'light':'dark';root.dataset.theme=theme;try{localStorage.setItem('recall-theme',theme);}catch{}update();};
    pen.onclick=()=>{tablet=!tablet;root.classList.toggle('tablet-mode',tablet);try{localStorage.setItem('recall-tablet',tablet?'on':'off');}catch{}update();};
    update();
  });
})();
