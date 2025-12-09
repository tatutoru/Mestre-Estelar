// equip-window.js
// Carrega templates (equip-window.html) e disponibiliza renderEquipProgressions()

async function loadEquipTemplates() {
  try {
    const response = await fetch('./equip-window.html'); // relativo à pasta /equip/
    if (!response.ok) {
      console.error('Erro ao carregar equip-window.html:', response.status);
      return false;
    }

    const html = await response.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    const windowTemplate = wrapper.querySelector('#equip-window-template');
    const slotTemplate = wrapper.querySelector('#equip-slot-row-template');

    if (!windowTemplate || !slotTemplate) {
      console.error('Templates NÃO encontrados dentro de equip-window.html');
      return false;
    }

    // anexa os <template> ao documento para permitir cloneNode via getElementById
    // se já existirem, substitui
    const existingWindowTpl = document.getElementById('equip-window-template');
    if (existingWindowTpl) existingWindowTpl.remove();
    const existingSlotTpl = document.getElementById('equip-slot-row-template');
    if (existingSlotTpl) existingSlotTpl.remove();

    document.body.appendChild(windowTemplate);
    document.body.appendChild(slotTemplate);

    return true;
  } catch (err) {
    console.error('Erro ao carregar templates:', err);
    return false;
  }
}

function createEquipWindow(config) {
  const windowTemplate = document.getElementById('equip-window-template');
  const slotTemplate = document.getElementById('equip-slot-row-template');

  if (!windowTemplate || !slotTemplate) {
    console.error('Templates de window/slot não estão disponíveis.');
    return null;
  }

  // clone a template de janela
  const frag = windowTemplate.content.cloneNode(true);
  const windowRoot = frag.querySelector('.equip-window');
  if (!windowRoot) {
    console.error('equip-window template sem .equip-window');
    return null;
  }
  windowRoot.dataset.progression = config.id || '';

  // cria uma linha de slot a partir do template
  function createSlotRow(slotData = {}) {
    const slotFrag = slotTemplate.content.cloneNode(true);
    const row = slotFrag.querySelector('.slot-row');
    const labelEl = slotFrag.querySelector('.slot-label');
    const itemEl = slotFrag.querySelector('.item');
    const icon = slotFrag.querySelector('.slot-icon');
    const collectionImg = slotFrag.querySelector('.slot-collection-img');
    const title = slotFrag.querySelector('.ro-tooltip-title');
    const desc = slotFrag.querySelector('.slot-description');

    if (labelEl) labelEl.textContent = slotData.slotLabel || '';

    // placeholder
    if (slotData.type === 'placeholder') {
      if (icon) {
        icon.classList.add('placeholder');
        icon.src = 'https://raw.githubusercontent.com/tatutoru/Mestre-Estelar/main/assets/ui/slot-placeholder.png';
        icon.alt = '';
      }
      if (title) title.textContent = '—';
      if (desc) desc.innerHTML = '';
      return row;
    }

    // dados do item
    if (itemEl && slotData.id) itemEl.setAttribute('data-id', slotData.id);

    if (icon && slotData.iconUrl) {
      icon.src = slotData.iconUrl;
      icon.alt = slotData.nome || '';
    }

    if (collectionImg && slotData.collectionUrl) {
      collectionImg.src = slotData.collectionUrl;
      collectionImg.alt = slotData.nome || '';
    }

    if (title && slotData.nome) title.textContent = slotData.nome;
    if (desc && slotData.descricao) desc.innerHTML = slotData.descricao || '';

    return row;
  }

  function fillColumn(selector, slots) {
    const col = frag.querySelector(selector);
    if (!col) return;
    (slots || []).forEach(slotData => {
      const row = createSlotRow(slotData);
      if (row) col.appendChild(row);
    });
  }

  // popula as colunas
  fillColumn('.equip-left', config.equip?.slotsLeft);
  fillColumn('.equip-right', config.equip?.slotsRight);
  fillColumn('.visual-left', config.visual?.slotsLeft);
  fillColumn('.visual-right', config.visual?.slotsRight);
  fillColumn('.cards-left', config.cards?.slotsLeft);
  fillColumn('.cards-right', config.cards?.slotsRight);

  // devolve o elemento pronto (não está anexado ao DOM ainda)
  return windowRoot;
}

async function renderEquipProgressions(progressionsConfig = {}) {
  const ok = await loadEquipTemplates();
  if (!ok) return;

  const container = document.getElementById('equip-windows-container');
  if (!container) {
    console.error('#equip-windows-container não encontrado.');
    return;
  }

  // limpa container previo (se houver)
  // (opcional, evita duplicar ao reiniciar)
  container.innerHTML = '';

  Object.values(progressionsConfig).forEach(prog => {
    const winEl = createEquipWindow(prog);
    if (winEl) {
      // inicialmente oculto; a página controlará qual mostrar
      winEl.style.display = 'none';
      container.appendChild(winEl);
    }
  });
}

// expõe a função globalmente
window.renderEquipProgressions = renderEquipProgressions;
