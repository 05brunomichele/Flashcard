document.addEventListener('DOMContentLoaded', () => {
    // --- Riferimenti DOM ---
    const addCardForm = document.getElementById('add-card-form');
    const newCardQuestionInput = document.getElementById('new-card-question');
    const newCardAnswerInput = document.getElementById('new-card-answer');
    const addCardFeedback = document.getElementById('add-card-feedback');
    const addCardFolderSelect = document.getElementById('add-card-folder-select');
    const newFolderInputContainer = document.getElementById('new-folder-input-container');
    const newFolderPathInput = document.getElementById('new-folder-path');
    
    const advancedEditArea = document.getElementById('advanced-edit-area');
    const saveAdvancedEditBtn = document.getElementById('save-advanced-edit-btn');
    const advancedEditFeedback = document.getElementById('advanced-edit-feedback');
    const exportDbBtn = document.getElementById('export-db-btn');
    const importDbBtn = document.getElementById('import-db-btn');
    const importFileInput = document.getElementById('import-file-input');
    // --- NUOVI RIFERIMENTI DOM PER ESPORTAZIONE SELEZIONATA ---
    const exportSelectionBtn = document.getElementById('export-selection-btn');
    const exportSelectionModalOverlay = document.getElementById('export-selection-modal-overlay');
    const exportSelectionModal = document.getElementById('export-selection-modal');
    const exportFolderTree = document.getElementById('export-folder-tree');
    const confirmExportSelectionBtn = document.getElementById('confirm-export-selection-btn');
    const exportModalCloseBtn = exportSelectionModal.querySelector('.close-modal-btn');
    const exportModalCancelBtn = exportSelectionModal.querySelector('.cancel-export-btn');

    const explorerViewContainer = document.getElementById('explorer-view-container');
    const viewCardsFeedback = document.getElementById('view-cards-feedback');
    
    const modalOverlay = document.getElementById('modal-overlay');
    const editCardModal = document.getElementById('edit-card-modal');
    const editCardForm = document.getElementById('edit-card-form');
    const editCardIdInput = document.getElementById('edit-card-id');
    const editCardFolderSelect = document.getElementById('edit-card-folder-select');
    const editNewFolderContainer = document.getElementById('edit-new-folder-container');
    const editNewFolderPathInput = document.getElementById('edit-new-folder-path');
    const editReviewDateContainer = document.getElementById('edit-review-date-container');
    const editReviewDateInput = document.getElementById('edit-review-date-input');
    const editCardQuestionInput = document.getElementById('edit-card-question');
    const editCardAnswerInput = document.getElementById('edit-card-answer');
    const editCardFeedback = document.getElementById('edit-card-feedback');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const cancelEditBtn = document.querySelector('.cancel-edit-btn');
    
    const learnedCountSpan = document.getElementById('learned-count');
    const reviewCountSpan = document.getElementById('review-count');
    const totalCountSpan = document.getElementById('total-count');
    const reviewFolderSelect = document.getElementById('review-folder-select');
    const reviewCardCountSelect = document.getElementById('review-card-count'); // NUOVO
    const reviewIncludeSubfolders = document.getElementById('review-include-subfolders');
    const startReviewBtn = document.getElementById('start-review-btn');
    const reviewBtnCountSpan = document.getElementById('review-btn-count');
    const reviewPreviewList = document.getElementById('review-preview-list');
    const reviewStartFeedback = document.getElementById('review-start-feedback');
    const reviewSection = document.getElementById('review-section');
    const exitReviewBtn = document.getElementById('exit-review-btn');
    const showAnswerBtn = document.getElementById('show-answer-btn');
    const intervalButtons = document.querySelectorAll('#interval-buttons .interval-btn');
    const reviewModeRadios = document.querySelectorAll('input[name="order-mode"]');

    const nextReviewTimerSpan = document.getElementById('next-review-timer');
    const upcomingCardsListContainer = document.getElementById('elenco404');

    const handsFreeFolderSelect = document.getElementById('hands-free-folder-select');
    const handsFreeQADelaySelect = document.getElementById('hands-free-q-a-delay');
    const handsFreeNextCardDelaySelect = document.getElementById('hands-free-next-card-delay');
    const handsFreePreviewList = document.getElementById('hands-free-preview-list');
    const startHandsFreeBtn = document.getElementById('start-hands-free-btn');
    const handsFreeBtnCountSpan = document.getElementById('hands-free-btn-count');
    const handsFreeSection = document.getElementById('hands-free-section');
    const exitHandsFreeBtn = document.getElementById('exit-hands-free-btn');
    const handsFreePreviousList = document.getElementById('hands-free-previous-list');
    const handsFreeUpcomingList = document.getElementById('hands-free-upcoming-list');
    const handsFreeStatus = document.getElementById('hands-free-status');
    const handsFreeCardQuestion = document.getElementById('hands-free-card-question');
    const handsFreeCardAnswer = document.getElementById('hands-free-card-answer');
    
    let allCards = [];
    let reviewQueue = [];
    let handsFreeQueue = [];
    let currentCardIndex = -1;
    let currentHandsFreeIndex = 0;
    let isHandsFreeSessionActive = false;
    let handsFreeTimeoutId = null;
    let currentCard = null;
    let draggedCardId = null;
    let nextReviewIntervalId = null;
    
    const CARDS_STORAGE_KEY = 'flashcardsApp_cards_v9_separatorFix';
    const DEFAULT_FOLDER_PATH = "/Inbox/";
    const intervalSettings = {'15m':15,'30m':30,'45m':45,'1h':60,'2h':120,'3h':180,'4h':240,'5h':300,'6h':360,'8h':480,'10h':600,'12h':720,'14h':840,'16h':960,'18h':1080,'20h':1200,'22h':1320,'1d':1440,'2d':2880,'3d':4320,'4d':5760,'5d':7200,'6d':8640,'7d':10080,'10d':14400,'14d':20160,'17d':24480,'21d':30240,'24d':34560,'28d':40320,'31d':44640,'40d':57600,'50d':72000};

    const saveCardsState = () => localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(allCards));
    const loadCardsState = () => {
        const saved = localStorage.getItem(CARDS_STORAGE_KEY);
        allCards = saved ? JSON.parse(saved) : [];
        fullUiUpdate();
    };

    const normalizePath = (p) => { let path = (p||'').trim() || DEFAULT_FOLDER_PATH; if(!path.startsWith('/')) path='/'+path; if(path.length>1 && !path.endsWith('/')) path+='/'; return path.replace(/\/+/g,'/'); };
    const generateSimpleId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    const flashFeedback = (el, msg, type='info', dur=4000) => { if(!el) return; el.textContent=msg; el.className=`feedback ${type}`; el.style.display='block'; el.style.opacity=1; if(el.timeoutId) clearTimeout(el.timeoutId); el.timeoutId=setTimeout(()=>{el.style.opacity=0; setTimeout(()=>el.style.display='none', 300)}, dur); };
    const getPlainText = (html) => (new DOMParser().parseFromString(html, "text/html").body.textContent || "").trim();

    function fullUiUpdate() {
        buildAndRenderExplorer();
        updateAllFolderSelects();
        updateCounts();
        loadAdvancedEditText();
        updateNextReviewTimerAndList();
        updateHandsFreePreview();
    }

    function updateAllFolderSelects() {
        const uniquePaths = [...new Set(allCards.map(c => c.path || DEFAULT_FOLDER_PATH))].sort();
        const selects = [addCardFolderSelect, reviewFolderSelect, editCardFolderSelect, handsFreeFolderSelect];
        selects.forEach(select => {
            if (!select) return;
            const currentValue = select.value;
            const preservedOptions = Array.from(select.options)
                .filter(opt => opt.value.startsWith('__'))
                .map(opt => ({ value: opt.value, text: opt.textContent }));
            select.innerHTML = '';
            preservedOptions.forEach(pOpt => {
                const option = document.createElement('option');
                option.value = pOpt.value;
                option.textContent = pOpt.text;
                select.appendChild(option);
            });
            uniquePaths.forEach(path => {
                const option = document.createElement('option');
                option.value = path;
                option.textContent = path;
                const specialOption = select.querySelector('option[value^="__"]');
                if (specialOption) select.insertBefore(option, specialOption);
                else select.appendChild(option);
            });
            select.value = Array.from(select.options).some(opt => opt.value === currentValue) ? currentValue : (select.id === 'add-card-folder-select' ? '/Inbox/' : '__ALL__');
        });
    }
    
    function openEditModal(cardId, options = { showDateField: false }) {
        const card = allCards.find(c => c.id === cardId);
        if (!card) return;
        editCardIdInput.value = card.id;
        updateAllFolderSelects();
        editCardFolderSelect.value = card.path;
        editNewFolderContainer.style.display = 'none';
        if (options.showDateField) {
            const date = new Date(card.nextReviewDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            editReviewDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            editReviewDateContainer.style.display = 'block';
        } else {
            editReviewDateContainer.style.display = 'none';
        }
        editCardQuestionInput.innerHTML = card.question;
        editCardAnswerInput.innerHTML = card.answer;
        modalOverlay.style.display = 'block';
        editCardModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
    const closeEditModal = () => { modalOverlay.style.display='none'; editCardModal.style.display='none'; document.body.classList.remove('modal-open'); };

    function handleEditCardSave(e) {
        e.preventDefault();
        const cardIndex = allCards.findIndex(c => c.id === editCardIdInput.value);
        if (cardIndex === -1) return flashFeedback(editCardFeedback, 'Errore: Card non trovata.', 'error');
        let newPath = editCardFolderSelect.value;
        if (newPath === '__NEW__') {
            const pathInput = editNewFolderPathInput.value.trim();
            if (!pathInput) return flashFeedback(editCardFeedback, 'Il percorso non può essere vuoto.', 'error');
            newPath = normalizePath(pathInput);
        }
        allCards[cardIndex] = { ...allCards[cardIndex], path: newPath, question: editCardQuestionInput.innerHTML.trim(), answer: editCardAnswerInput.innerHTML.trim() };
        if (editReviewDateContainer.style.display === 'block') {
            const newReviewDate = new Date(editReviewDateInput.value).getTime();
            if (!isNaN(newReviewDate)) {
                allCards[cardIndex].nextReviewDate = newReviewDate;
            }
        }
        saveCardsState();
        fullUiUpdate();
        flashFeedback(editCardFeedback, 'Modifiche salvate!', 'success');
        setTimeout(closeEditModal, 1000);
    }
    
    function handlePaste(e){ e.preventDefault();const t=(e.clipboardData||window.clipboardData)?.items;if(t)for(let n of t)if(n.type.includes("image")){const e=n.getAsFile();if(e){const t=new FileReader;return t.onload=e=>document.execCommand("insertImage",!1,e.target.result),void t.readAsDataURL(e)}}const n=(e.clipboardData||window.clipboardData).getData("text/plain");document.execCommand("insertText",!1,n)}
    function handleAddCard(e){ e.preventDefault();const t=newCardQuestionInput.innerHTML.trim(),n=newCardAnswerInput.innerHTML.trim();if(!t||!n)return void flashFeedback(addCardFeedback,"Domanda e risposta sono obbligatorie.","error");let a=addCardFolderSelect.value;if("__NEW__"===a){const e=newFolderPathInput.value.trim();if(!e)return void flashFeedback(addCardFeedback,"Il percorso non può essere vuoto.","error");a=normalizePath(e)}allCards.push({id:generateSimpleId(),path:a,question:t,answer:n,nextReviewDate:Date.now(),intervalMinutes:0}),saveCardsState(),newCardQuestionInput.innerHTML="",newCardAnswerInput.innerHTML="",newFolderPathInput.value="",newFolderInputContainer.style.display="none",fullUiUpdate(),addCardFolderSelect.value=a,flashFeedback(addCardFeedback,`Card aggiunta in ${a}!`,"success"),newCardQuestionInput.focus()}
    
    function buildAndRenderExplorer() { const root = { type: 'folder', children: [] }; const foldersMap = {}; allCards.forEach(card => { const pathSegments = (card.path || DEFAULT_FOLDER_PATH).split('/').filter(p => p); let currentLevel = root; let cumulativePath = "/"; pathSegments.forEach(segment => { cumulativePath += segment + "/"; if (!foldersMap[cumulativePath]) { const newFolder = { name: segment, path: cumulativePath, type: 'folder', children: [] }; foldersMap[cumulativePath] = newFolder; currentLevel.children.push(newFolder); } currentLevel = foldersMap[cumulativePath]; }); currentLevel.children.push({ ...card, type: 'card' }); }); function sortChildrenRecursive(node) { if (node.children && node.children.length) { node.children.sort((a, b) => { if (a.type !== b.type) return a.type === 'folder' ? -1 : 1; const nameA = a.type === 'folder' ? a.name : getPlainText(a.question); const nameB = b.type === 'folder' ? b.name : getPlainText(b.question); return nameA.localeCompare(nameB); }); node.children.forEach(sortChildrenRecursive); } } sortChildrenRecursive(root); explorerViewContainer.innerHTML = ''; if (root.children.length === 0) { explorerViewContainer.innerHTML = '<p class="empty-list-message">Nessuna flashcard. Aggiungi la tua prima!</p>'; } else { const rootUl = document.createElement('ul'); rootUl.className = 'explorer-root'; root.children.forEach(childNode => rootUl.appendChild(renderExplorerNode(childNode, 0))); explorerViewContainer.appendChild(rootUl); } }
    function renderExplorerNode(node, level) { const li = document.createElement('li'); li.classList.add('explorer-item', `explorer-${node.type}`); li.style.paddingLeft = `${level * 20}px`; const contentDiv = document.createElement('div'); contentDiv.className = 'explorer-item-content'; if (node.type === 'folder') { li.setAttribute('data-path', node.path); contentDiv.innerHTML = `<span class="toggle-icon closed">▶</span><span class="folder-icon">📁</span><span class="item-name">${node.name}</span>`; li.appendChild(contentDiv); const ulChildren = document.createElement('ul'); ulChildren.className = 'explorer-children'; ulChildren.style.display = 'none'; if (node.children.length > 0) { node.children.forEach(child => ulChildren.appendChild(renderExplorerNode(child, level + 1))); } else { ulChildren.innerHTML = `<li class="explorer-item explorer-empty" style="padding-left: ${(level + 1) * 20}px;">(Vuota)</li>`; } li.appendChild(ulChildren); } else { li.setAttribute('data-card-id', node.id); li.draggable = true; contentDiv.innerHTML = `<span class="card-icon">${/<img/.test(node.question) ? "🖼️" : "📄"}</span><span class="item-name">${getPlainText(node.question)}</span><span class="card-actions"><button class="btn-delete-card-explorer" data-id="${node.id}" title="Elimina">🗑️</button></span>`; li.appendChild(contentDiv); } return li; }
    explorerViewContainer.addEventListener('click', (e) => { const folderContent = e.target.closest('.explorer-folder > .explorer-item-content'); const deleteButton = e.target.closest('.btn-delete-card-explorer'); if (deleteButton) { const cardId = deleteButton.dataset.id; if (confirm("Sei sicuro di voler eliminare questa flashcard?")) { allCards = allCards.filter(c => c.id !== cardId); saveCardsState(); fullUiUpdate(); flashFeedback(viewCardsFeedback, "Flashcard eliminata.", "info"); } return; } if (folderContent) { const childrenUl = folderContent.nextElementSibling; const icon = folderContent.querySelector('.toggle-icon'); if (childrenUl && icon) { const isClosed = childrenUl.style.display === 'none'; childrenUl.style.display = isClosed ? 'block' : 'none'; icon.classList.toggle('open', isClosed); } } });
    explorerViewContainer.addEventListener('dblclick', e => { const cardLi = e.target.closest('.explorer-card'); if (cardLi) openEditModal(cardLi.getAttribute('data-card-id'), { showDateField: false }); });
    explorerViewContainer.addEventListener('dragstart', e => { const cardLi = e.target.closest('.explorer-card'); if (cardLi) { draggedCardId = cardLi.getAttribute('data-card-id'); e.target.classList.add('dragging'); } });
    explorerViewContainer.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    explorerViewContainer.addEventListener('dragover', e => { e.preventDefault(); const folderLi = e.target.closest('.explorer-folder'); document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); if (folderLi) folderLi.querySelector('.explorer-item-content').classList.add('drag-over'); });
    explorerViewContainer.addEventListener('drop', e => { e.preventDefault(); document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over')); const folderLi = e.target.closest('.explorer-folder'); if (folderLi && draggedCardId) { const targetPath = folderLi.getAttribute('data-path'); const cardIndex = allCards.findIndex(c => c.id === draggedCardId); if (cardIndex > -1 && allCards[cardIndex].path !== targetPath) { allCards[cardIndex].path = targetPath; saveCardsState(); fullUiUpdate(); flashFeedback(viewCardsFeedback, `Carta spostata in ${targetPath}`, 'success'); } } draggedCardId = null; });

    function formatCardForAdvancedEdit(card){let e="";const t=new Date(card.nextReviewDate);return isNaN(t)||(e=`@@${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}T${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`),`${card.id}##${card.path}##${card.question}##${card.answer}${e}`}
    function loadAdvancedEditText(){const e=[...allCards].sort((e,t)=>(e.path||"").localeCompare(t.path||"")||e.id.localeCompare(t.id));advancedEditArea.value=e.map(formatCardForAdvancedEdit).join("\n")}
    function handleAdvancedSave(isImport = false) { if (!isImport && !confirm("ATTENZIONE! Sovrascriverà TUTTE le flashcard. Procedere?")) { return flashFeedback(advancedEditFeedback, "Salvataggio annullato.", "info"); } const rawLines = advancedEditArea.value.trim().split(/\r?\n/); const processedLines = []; let lineBuffer = ''; for (const line of rawLines) { const isNewCardLine = /^[a-zA-Z0-9]{10,}##\//.test(line.trim()); if (isNewCardLine && lineBuffer) { processedLines.push(lineBuffer); lineBuffer = line; } else { lineBuffer += (lineBuffer ? '\n' : '') + line; } } if (lineBuffer) { processedLines.push(lineBuffer); } const newCards = []; let errorMessage = null; for (const [index, lineContent] of processedLines.entries()) { let lineWithoutTimestamp = lineContent; let timestampStr = null; const timestampIndex = lineContent.lastIndexOf("@@"); if (timestampIndex > -1) { lineWithoutTimestamp = lineContent.substring(0, timestampIndex); timestampStr = lineContent.substring(timestampIndex + 2); } const parts = lineWithoutTimestamp.split("##"); if (parts.length < 4) { errorMessage = `Riga ${index + 1}: Formato non valido. Controlla che ogni card abbia ID, Percorso, Domanda e Risposta. Contenuto: "${lineContent.substring(0, 50)}..."`; break; } const id = parts[0].trim(); const path = normalizePath(parts[1].trim()); const question = parts[2]; const answer = parts.slice(3).join("##"); let nextReviewDate = Date.now(); if (timestampStr && !isNaN(new Date(timestampStr.trim()).getTime())) { nextReviewDate = new Date(timestampStr.trim()).getTime(); } newCards.push({ id: id, path: path, question: question, answer: answer, nextReviewDate: nextReviewDate, intervalMinutes: 0 }); } if (errorMessage) { flashFeedback(advancedEditFeedback, `Errore: ${errorMessage}`, "error", 12000); } else { allCards = newCards; saveCardsState(); fullUiUpdate(); flashFeedback(advancedEditFeedback, `${isImport ? "Importazione" : "Salvataggio"} completato! ${allCards.length} carte caricate.`, "success"); } }
    function exportDatabase(){loadAdvancedEditText();const e=advancedEditArea.value;if(!e)return flashFeedback(advancedEditFeedback,"Database vuoto.","info");const t=new Blob([e],{type:"text/plain;charset=utf-8"}),n=URL.createObjectURL(t),a=document.createElement("a");a.href=n,a.download=`flashcards_backup_${(new Date).toISOString().slice(0,10)}.txt`,a.click(),URL.revokeObjectURL(n),flashFeedback(advancedEditFeedback,"Database esportato!","success")}
    function handleFileImport(e){const t=e.target.files[0];if(!t)return;const n=new FileReader;n.onload=e=>{advancedEditArea.value=e.target.result,confirm("ATTENZIONE!\nQuesto sovrascriverà il database attuale. Procedere?")&&handleAdvancedSave(!0)},n.readAsText(t),e.target.value=""}

    // --- NUOVE FUNZIONI PER ESPORTAZIONE SELEZIONATA ---

    function buildExportFolderTree() {
        const root = { name: '/', path: '/', type: 'folder', children: [] };
        const foldersMap = { '/': root };

        allCards.forEach(card => {
            const pathSegments = (card.path || DEFAULT_FOLDER_PATH).split('/').filter(p => p);
            let currentLevel = root;
            let cumulativePath = "/";
            pathSegments.forEach(segment => {
                cumulativePath += segment + "/";
                if (!foldersMap[cumulativePath]) {
                    const newFolder = { name: segment, path: cumulativePath, type: 'folder', children: [] };
                    foldersMap[cumulativePath] = newFolder;
                    currentLevel.children.push(newFolder);
                }
                currentLevel = foldersMap[cumulativePath];
            });
        });

        const createNodeRecursive = (node) => {
            const li = document.createElement('li');
            const div = document.createElement('div');
            div.className = 'export-folder-item';
            const checkboxId = `export-check-${node.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
            div.innerHTML = `
                <input type="checkbox" id="${checkboxId}" data-path="${node.path}">
                <label for="${checkboxId}">${node.name}</label>
            `;
            li.appendChild(div);

            if (node.children && node.children.length > 0) {
                node.children.sort((a, b) => a.name.localeCompare(b.name));
                const ul = document.createElement('ul');
                node.children.forEach(child => ul.appendChild(createNodeRecursive(child)));
                li.appendChild(ul);
            }
            return li;
        };
        
        exportFolderTree.innerHTML = '';
        const rootUl = document.createElement('ul');
        root.children.sort((a, b) => a.name.localeCompare(b.name));
        root.children.forEach(child => rootUl.appendChild(createNodeRecursive(child)));
        exportFolderTree.appendChild(rootUl);
    }

    function openExportSelectionModal() {
        buildExportFolderTree();
        exportSelectionModal.style.display = 'block';
        exportSelectionModalOverlay.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    function closeExportSelectionModal() {
        exportSelectionModal.style.display = 'none';
        exportSelectionModalOverlay.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    function handleSelectiveExport() {
        const checkedBoxes = exportFolderTree.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) {
            flashFeedback(advancedEditFeedback, "Nessuna cartella selezionata.", "info");
            return;
        }

        const selectedPaths = Array.from(checkedBoxes).map(cb => cb.dataset.path);
        
        const cardsToExport = allCards.filter(card => {
            const cardPath = normalizePath(card.path);
            return selectedPaths.some(selectedPath => cardPath.startsWith(selectedPath));
        });

        if (cardsToExport.length === 0) {
            flashFeedback(advancedEditFeedback, "Nessuna card trovata nelle cartelle selezionate.", "info");
            closeExportSelectionModal();
            return;
        }

        const content = cardsToExport
            .sort((a, b) => (a.path || "").localeCompare(b.path || "") || a.id.localeCompare(b.id))
            .map(formatCardForAdvancedEdit)
            .join("\n");
        
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `flashcards_selection_${(new Date).toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        flashFeedback(advancedEditFeedback, `Esportate ${cardsToExport.length} card!`, "success");
        closeExportSelectionModal();
    }
    
    // --- FINE NUOVE FUNZIONI ---
    
    function updateNextReviewTimerAndList() { if (nextReviewIntervalId) clearInterval(nextReviewIntervalId); const now = Date.now(); const upcomingCards = allCards .filter(c => c.nextReviewDate > now) .sort((a, b) => a.nextReviewDate - b.nextReviewDate); upcomingCardsListContainer.innerHTML = ''; if (upcomingCards.length === 0) { upcomingCardsListContainer.innerHTML = '<p class="empty-list-message">Nessuna carta programmata per il futuro.</p>'; } else { upcomingCards.forEach(card => { const li = document.createElement('div'); li.className = 'upcoming-card-item'; li.dataset.cardId = card.id; const plainText = getPlainText(card.question); const date = new Date(card.nextReviewDate); const isToday = date.toDateString() === new Date().toDateString(); const isTomorrow = date.toDateString() === new Date(now + 86400000).toDateString(); let formattedDate; if (isToday) { formattedDate = `Oggi ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; } else if (isTomorrow) { formattedDate = `Domani ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; } else { formattedDate = `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; } li.innerHTML = `<span class="upcoming-card-question">${plainText}</span><span class="upcoming-card-date">${formattedDate}</span>`; upcomingCardsListContainer.appendChild(li); }); } if (upcomingCards.length > 0) { const nextCard = upcomingCards[0]; const updateTimer = () => { const diff = nextCard.nextReviewDate - Date.now(); if (diff <= 0) { nextReviewTimerSpan.textContent = "È ora!"; clearInterval(nextReviewIntervalId); setTimeout(fullUiUpdate, 1000); return; } const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000); let parts = []; if (d > 0) parts.push(`${d}g`); if (h > 0) parts.push(`${h}h`); if (m > 0) parts.push(`${m}m`); parts.push(`${s}s`); nextReviewTimerSpan.textContent = parts.slice(0, 3).join(' '); }; updateTimer(); nextReviewIntervalId = setInterval(updateTimer, 1000); } else { nextReviewTimerSpan.textContent = 'Nessuna carta in attesa.'; } }
    function updateCounts(){const e=Date.now();let t=0,n=0;allCards.forEach(c=>{c&&!isNaN(c.nextReviewDate)&&(c.nextReviewDate<=e?t++:n++)}),learnedCountSpan.textContent=n,reviewCountSpan.textContent=t,totalCountSpan.textContent=allCards.length,updateReviewButtonState()}
    function generateGuidedSequence(cards) { const n = cards.length; if (n === 0) return []; if (n === 1) return [cards[0], cards[0], cards[0]]; let sequence = []; for (let i = 0; i < n; i += 2) { const card1 = cards[i]; const card2 = cards[i + 1]; if (card2) { sequence.push(card1, card2, card1, card2); } else { sequence.push(card1, card1, card1); } if (i >= 4) { const reviewCard1 = cards[i - 4]; const reviewCard2 = cards[i - 3]; sequence.push(reviewCard1, reviewCard2, reviewCard1, reviewCard2); } if ((i + 2) % 8 === 0 && i > 0) { sequence.push(...cards.slice(0, i + 2)); } } sequence.push(...cards); if (n > 2) { for (let i = 0; i < n - 1; i++) { sequence.push(cards[i], cards[i+1]); } } sequence.push(cards[n - 1], cards[0], cards[n - 1], cards[0]); return sequence; }
    function updateReviewButtonState() { if (!startReviewBtn) return; const mode = document.querySelector('input[name="order-mode"]:checked').value; const baseCards = getReviewCardsForSelection(); let cardsForSession = []; if (mode === 'guided') { cardsForSession = generateGuidedSequence(baseCards); } else { cardsForSession = baseCards; } const count = cardsForSession.length; reviewBtnCountSpan.textContent = count; startReviewBtn.disabled = count === 0; reviewPreviewList.innerHTML = ''; if (count === 0) { reviewPreviewList.innerHTML = '<p class="empty-list-message">Nessuna carta da ripassare per questa selezione.</p>'; } else if (mode === 'guided') { const ol = document.createElement('ol'); cardsForSession.forEach((card, index) => { const li = document.createElement('li'); li.textContent = getPlainText(card.question); ol.appendChild(li); }); reviewPreviewList.appendChild(ol); } else { baseCards.forEach(card => { const item = document.createElement('div'); item.className = 'review-preview-item'; item.textContent = getPlainText(card.question); reviewPreviewList.appendChild(item); }); } }
    function getReviewCardsForSelection() { const selectedFolder = reviewFolderSelect.value; const includeSubfolders = reviewIncludeSubfolders.checked; const now = Date.now(); const limit = reviewCardCountSelect.value; let dueCards = ("__ALL__" === selectedFolder) ? allCards.filter(c => c && c.nextReviewDate <= now) : allCards.filter(c => { if (!c || c.nextReviewDate > now) return false; const cardPath = normalizePath(c.path); return includeSubfolders ? cardPath.startsWith(selectedFolder) : cardPath === selectedFolder; }); dueCards.sort((a, b) => a.nextReviewDate - b.nextReviewDate); if (limit !== '__ALL__') { return dueCards.slice(0, parseInt(limit, 10)); } return dueCards; }
    function startReview(){ const mode = document.querySelector('input[name="order-mode"]:checked').value; const baseCards = getReviewCardsForSelection(); if (baseCards.length === 0) return; if (mode === 'guided') { reviewQueue = generateGuidedSequence(baseCards); } else if (mode === 'random') { reviewQueue = baseCards.sort(() => .5 - Math.random()); } else { reviewQueue = baseCards; } if (reviewQueue.length === 0) return; currentCardIndex = 0; document.querySelectorAll("main > .container").forEach(e=>e.style.display="none"); reviewSection.style.display="block"; document.getElementById("review-total-in-session").textContent=reviewQueue.length; displayNextCard(); }
    function displayNextCard(){if(currentCardIndex>=reviewQueue.length)return void endReviewSession(!0);currentCard=reviewQueue[currentCardIndex],document.getElementById("review-remaining").textContent=reviewQueue.length-currentCardIndex,document.getElementById("review-current-num").textContent=currentCardIndex+1,document.getElementById("card-question").innerHTML=currentCard.question,document.getElementById("card-answer").innerHTML=currentCard.answer,document.getElementById("card-answer").style.display="none",document.getElementById("interval-buttons").style.display="none",showAnswerBtn.style.display="inline-block",showAnswerBtn.disabled=!1,intervalButtons.forEach(e=>e.disabled=!1)}
    function showAnswer(){if(!currentCard)return;document.getElementById("card-answer").style.display="block",document.getElementById("interval-buttons").style.display="grid",showAnswerBtn.style.display="none"}
    function handleIntervalChoice(e){if(!currentCard)return;intervalButtons.forEach(e=>e.disabled=!0),showAnswerBtn.disabled=!0;const t=e.currentTarget.dataset.key,n=allCards.findIndex(e=>e.id===currentCard.id);if(n===-1)return;const c=Date.now();if("subito"===t){const e=reviewQueue.splice(currentCardIndex,1)[0];reviewQueue.push(e),allCards[n].nextReviewDate=c}else{const e=intervalSettings[t];allCards[n].nextReviewDate=c+6e4*e,allCards[n].intervalMinutes=e,currentCardIndex++}saveCardsState(),setTimeout(displayNextCard,150)}
    function endReviewSession(e=!1){document.querySelectorAll("main > .container").forEach(e=>e.style.display="block"),reviewSection.style.display="none",fullUiUpdate(),e?flashFeedback(reviewStartFeedback,"Sessione completata!","success"):flashFeedback(reviewStartFeedback,"Ripasso interrotto.","info")}
    function generateSpecialHandsFreeSequence(baseCards) { if (baseCards.length !== 10) { return baseCards; } const indices = [1,2,1,2,3,4,3,4,1,2,1,2,5,6,5,6,3,4,3,4,7,8,7,8,1,2,3,4,5,6,7,8,9,10,9,10,2,3,2,3,4,5,4,5,6,7,6,7,8,9,8,9,10,1,10,1]; return indices.map(index => baseCards[index - 1]); }
    function getHandsFreeCardsForSelection() { const selectedFolder = handsFreeFolderSelect.value; const now = Date.now(); let dueCards = ("__ALL__" === selectedFolder) ? allCards.filter(c => c && c.nextReviewDate <= now) : allCards.filter(c => { if (!c || c.nextReviewDate > now) return false; const cardPath = normalizePath(c.path); return cardPath.startsWith(selectedFolder); }); dueCards.sort((a, b) => a.nextReviewDate - b.nextReviewDate); const count = 10; return dueCards.slice(0, count); }
    function updateHandsFreePreview() { const cards = getHandsFreeCardsForSelection(); const count = cards.length; handsFreeBtnCountSpan.textContent = count; startHandsFreeBtn.disabled = count === 0; handsFreePreviewList.innerHTML = ''; if (count === 0) { handsFreePreviewList.innerHTML = '<p class="empty-list-message">Nessuna carta scaduta per questa selezione.</p>'; } else { cards.forEach(card => { const item = document.createElement('div'); item.className = 'review-preview-item'; item.textContent = getPlainText(card.question); handsFreePreviewList.appendChild(item); }); } }
    function preprocessTextForSpeech(htmlContent) { const tempDiv = document.createElement('div'); tempDiv.innerHTML = htmlContent; tempDiv.querySelectorAll('img').forEach(img => { const span = document.createElement('span'); span.textContent = ' immagine '; img.parentNode.replaceChild(span, img); }); return tempDiv.textContent.trim() || ''; }
    function speak(text, onEndCallback) { if (!text) { if (onEndCallback) onEndCallback(); return; } speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'it-IT'; utterance.onend = onEndCallback; utterance.onerror = (e) => { console.error("Errore sintesi vocale:", e); if (onEndCallback) onEndCallback(); }; speechSynthesis.speak(utterance); }
    function runHandsFreeCycle() { if (!isHandsFreeSessionActive || currentHandsFreeIndex >= handsFreeQueue.length) { endHandsFreeSession(true); return; } const card = handsFreeQueue[currentHandsFreeIndex]; const questionText = preprocessTextForSpeech(card.question); const answerText = preprocessTextForSpeech(card.answer); const qaDelay = parseInt(handsFreeQADelaySelect.value, 10) * 1000; const nextCardDelay = parseInt(handsFreeNextCardDelaySelect.value, 10) * 1000; updateHandsFreeUI(); handsFreeCardQuestion.innerHTML = card.question; handsFreeCardAnswer.innerHTML = card.answer; handsFreeCardAnswer.style.display = 'none'; handsFreeStatus.textContent = `Leggendo domanda ${currentHandsFreeIndex + 1} di ${handsFreeQueue.length}...`; speak(questionText, () => { if (!isHandsFreeSessionActive) return; handsFreeStatus.textContent = `Pausa...`; handsFreeTimeoutId = setTimeout(() => { if (!isHandsFreeSessionActive) return; handsFreeCardAnswer.style.display = 'block'; handsFreeStatus.textContent = `Leggendo risposta...`; speak(answerText, () => { if (!isHandsFreeSessionActive) return; handsFreeStatus.textContent = `Prossima carta tra...`; handsFreeTimeoutId = setTimeout(() => { currentHandsFreeIndex++; runHandsFreeCycle(); }, nextCardDelay); }); }, qaDelay); }); }
    function updateHandsFreeUI() { handsFreePreviousList.innerHTML = ''; handsFreeUpcomingList.innerHTML = ''; handsFreeQueue.forEach((card, index) => { const item = document.createElement('div'); item.className = 'hands-free-list-item'; item.textContent = getPlainText(card.question); if (index < currentHandsFreeIndex) { handsFreePreviousList.appendChild(item); } else if (index > currentHandsFreeIndex) { if (index === currentHandsFreeIndex + 1) { item.classList.add('is-next'); } handsFreeUpcomingList.appendChild(item); } }); }
    function startHandsFreeSession() { const baseCards = getHandsFreeCardsForSelection(); if (baseCards.length === 0) return; handsFreeQueue = generateSpecialHandsFreeSequence(baseCards); isHandsFreeSessionActive = true; currentHandsFreeIndex = 0; document.body.classList.add('hands-free-open'); handsFreeSection.style.display = 'flex'; runHandsFreeCycle(); }
    function endHandsFreeSession(completed = false) { isHandsFreeSessionActive = false; if (handsFreeTimeoutId) clearTimeout(handsFreeTimeoutId); speechSynthesis.cancel(); document.body.classList.remove('hands-free-open'); handsFreeSection.style.display = 'none'; flashFeedback(reviewStartFeedback, completed ? "Sessione di ascolto completata!" : "Sessione di ascolto interrotta.", completed ? 'success' : 'info'); }

    // --- Inizializzazione e Listeners ---
    addCardForm.addEventListener('submit', handleAddCard);
    [newCardQuestionInput, newCardAnswerInput, editCardQuestionInput, editCardAnswerInput].forEach(el => el.addEventListener('paste', handlePaste));
    addCardFolderSelect.addEventListener('change', () => { newFolderInputContainer.style.display = addCardFolderSelect.value === '__NEW__' ? 'block' : 'none'; if(addCardFolderSelect.value==='__NEW__') newFolderPathInput.focus(); });
    editCardFolderSelect.addEventListener('change', () => { editNewFolderContainer.style.display = editCardFolderSelect.value === '__NEW__' ? 'block' : 'none'; if(editCardFolderSelect.value==='__NEW__') editNewFolderPathInput.focus(); });
    exportDbBtn.addEventListener('click', exportDatabase);
    importDbBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleFileImport);
    saveAdvancedEditBtn.addEventListener('click', () => handleAdvancedSave(false));
    
    // --- NUOVI LISTENER PER ESPORTAZIONE SELEZIONATA ---
    exportSelectionBtn.addEventListener('click', openExportSelectionModal);
    confirmExportSelectionBtn.addEventListener('click', handleSelectiveExport);
    [exportSelectionModalOverlay, exportModalCloseBtn, exportModalCancelBtn].forEach(el => {
        el.addEventListener('click', closeExportSelectionModal);
    });
    exportSelectionModal.addEventListener('click', e => e.stopPropagation());

    editCardForm.addEventListener('submit', handleEditCardSave);
    [closeModalBtn, cancelEditBtn, modalOverlay].forEach(el => el.addEventListener('click', closeEditModal));
    editCardModal.addEventListener('click', e => e.stopPropagation());
    startReviewBtn.addEventListener('click', startReview);
    showAnswerBtn.addEventListener('click', showAnswer);
    exitReviewBtn.addEventListener('click', () => endReviewSession(false));
    intervalButtons.forEach(btn => btn.addEventListener('click', handleIntervalChoice));
    reviewFolderSelect.addEventListener('change', updateReviewButtonState);
    reviewCardCountSelect.addEventListener('change', updateReviewButtonState);
    reviewIncludeSubfolders.addEventListener('change', updateReviewButtonState);
    reviewModeRadios.forEach(radio => radio.addEventListener('change', updateReviewButtonState));
    upcomingCardsListContainer.addEventListener('click', e => {
        const cardItem = e.target.closest('.upcoming-card-item');
        if (cardItem) {
            const cardId = cardItem.dataset.cardId;
            openEditModal(cardId, { showDateField: true });
        }
    });
    handsFreeFolderSelect.addEventListener('change', updateHandsFreePreview);
    startHandsFreeBtn.addEventListener('click', startHandsFreeSession);
    exitHandsFreeBtn.addEventListener('click', () => endHandsFreeSession(false));
    document.querySelectorAll('.editor-toolbar').forEach(toolbar => {
        toolbar.addEventListener('click', e => {
            const button = e.target.closest('.format-btn');
            if (!button) return;
            e.preventDefault();
            const command = button.dataset.command;
            const value = button.dataset.value || null;
            const editor = toolbar.closest('.form-group').querySelector('.editable-textarea');
            if (editor) {
                editor.focus();
                document.execCommand(command, false, value);
            }
        });
    });
    loadCardsState();
});