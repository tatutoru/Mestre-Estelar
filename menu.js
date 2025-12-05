// menu.js - busca menu.html relativo a si mesmo, injeta, normaliza links e aplica comportamento
const isIndex = (pagePath === menuIndexPath || pagePath === '/' || pagePath === menuIndexPath.replace(/\/$/, ''));


// Se não for index, adiciona classe collapsed
if(!isIndex){ nav.classList.add('ms-menu--collapsed'); }


// Toggle behavior
const toggle = nav.querySelector('.ms-menu__toggle');
const list = nav.querySelector('.ms-menu__list');


function openMenu(){
nav.classList.add('ms-menu--open');
toggle.setAttribute('aria-expanded','true');
// add backdrop
const backdrop = document.createElement('div');
backdrop.className = 'ms-menu-backdrop';
backdrop.style.position = 'fixed'; backdrop.style.inset = '0'; backdrop.style.background = 'rgba(0,0,0,0.18)'; backdrop.style.zIndex = '1100';
document.body.appendChild(backdrop);
backdrop.addEventListener('click', closeMenu);
// trap focus on first link
const firstLink = list.querySelector('a'); if(firstLink) firstLink.focus();
}


function closeMenu(){
nav.classList.remove('ms-menu--open');
toggle.setAttribute('aria-expanded','false');
const bd = document.querySelector('.ms-menu-backdrop'); if(bd) bd.remove();
toggle.focus();
}


if(toggle){
toggle.addEventListener('click', e => {
const isOpen = nav.classList.toggle('ms-menu--open');
toggle.setAttribute('aria-expanded', String(isOpen));
if(isOpen) openMenu(); else closeMenu();
});
}


// close on Esc
document.addEventListener('keydown', e => { if(e.key === 'Escape') { if(nav.classList.contains('ms-menu--open')) closeMenu(); } });


// close when clicking a link (on mobile/overlay)
list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if(nav.classList.contains('ms-menu--open')) closeMenu(); }));


// acessibilidade: se o menu estiver fixo no topo e for aberto, rolar o foco para lá


})
.catch(err => console.error('Erro ao carregar menu:', err));
})();
