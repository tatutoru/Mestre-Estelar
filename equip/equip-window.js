// equip-window.js

async function loadEquipTemplates() {
  const response = await fetch('equip-window.html');
  if (!response.ok) {
    console.error('Erro ao carregar equip-window.html:', response.status);
    return;
  }

  const html = await response.text();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const windowTemplate = wrapper.querySelector('#equip-window-template');
  const slotTemplate = wrapper.querySelector('#equip-slot-row-template');

  if (!windowTemplate || !slotTemplate) {
    console.error('Templates NÃO encontrados dentro de equip-window.html');
    return;
  }

  document.body.appendChild(windowTemplate);
  document.body.appendChild(slotTemplate);
}

function createEquipWindow(config) {
  const windowTemplate = document.getElementById('equip-window-template');
  const slotTemplate = document.getElementById('equip-slot-row-template');

  if (!windowTemplate || !slotTemplate) {
    console.error('Templates de window/slot não estão disponíveis.');
    return null;
  }

  const windowFrag = windowTemplate.content.cloneNode(true);
  const windowRoot = windowFrag.querySelector('.equip-window');

  windowRoot.dataset.progression = config.id || '';

function createSlotRow(slotData) {
  const frag = slotTemplate.content.cloneNode(true);

  const row = frag.querySelector('.slot-row');
  const labelEl = frag.querySelector('.slot-label');
  const itemEl = frag.querySelector('.item');
  const icon = frag.querySelector('.slot-icon');
  const collectionImg = frag.querySelector('.slot-collection-img');
  const title = frag.querySelector('.ro-tooltip-title');
  const desc = frag.querySelector('.slot-description');

  labelEl.textContent = slotData.slotLabel || '';

  // PLACEHOLDER ----------------------------------------------
  if (slotData.type === 'placeholder') {
    icon.classList.add('placeholder');
    icon.src = 'https://raw.githubusercontent.com/tatutoru/Mestre-Estelar/main/assets/ui/slot-placeholder.png';
    icon.alt = '';
    title.textContent = '—';
    desc.innerHTML = '';
    return row;
  }

  // ITEM NORMAL -----------------------------------------------
  if (itemEl && slotData.id) {
    itemEl.dataset.id = slotData.id;
  }

  if (icon && slotData.iconUrl) {
    icon.src = slotData.iconUrl;
    icon.alt = slotData.nome || '';
  }

  if (collectionImg && slotData.collectionUrl) {
    collectionImg.src = slotData.collectionUrl;
    collectionImg.alt = slotData.nome || '';
  }

  if (title && slotData.nome) {
    title.textContent = slotData.nome;
  }

  if (desc && slotData.descricao) {
    desc.innerHTML = slotData.descricao;
  }

  return row;
}


  // helper pra popular qualquer coluna
  function fillColumn(selector, slots) {
    const col = windowFrag.querySelector(selector);
    if (!col) return;
    (slots || []).forEach(slotData => {
      col.appendChild(createSlotRow(slotData));
    });
  }

  // EQUIP
  fillColumn('.equip-left',  (config.equip  && config.equip.slotsLeft));
  fillColumn('.equip-right', (config.equip  && config.equip.slotsRight));

  // VISUAL
  fillColumn('.visual-left',  (config.visual && config.visual.slotsLeft));
  fillColumn('.visual-right', (config.visual && config.visual.slotsRight));

  // CARTAS
  fillColumn('.cards-left',  (config.cards && config.cards.slotsLeft));
  fillColumn('.cards-right', (config.cards && config.cards.slotsRight));

  return windowRoot;
}

async function renderEquipProgressions(progressionsConfig) {
  await loadEquipTemplates();

  const container = document.getElementById('equip-windows-container');
  if (!container) {
    console.error('#equip-windows-container não encontrado.');
    return;
  }

  Object.values(progressionsConfig).forEach(prog => {
    const winEl = createEquipWindow(prog);
    if (winEl) {
      winEl.style.display = 'none';
      container.appendChild(winEl);
    }
  });
}

window.renderEquipProgressions = renderEquipProgressions;
