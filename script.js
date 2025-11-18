// L'INDOVINO - script.js
// Tutta la logica dell'app: profili, temi, giochi, storico

(() => {
  // ====== COSTANTI & STORAGE ====================================
  const KEYS = {
    profiles: 'indovino_profiles_v2',
    currentProfile: 'indovino_current_profile_v2',
    theme: 'indovino_theme_v2',
    history: 'indovino_history_v2'
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Errore lettura storage', key, e);
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Errore salvataggio storage', key, e);
    }
  }

  // ====== STATO =================================================
  let profiles = loadJSON(KEYS.profiles, []);
  let currentProfileIndex = loadJSON(KEYS.currentProfile, null);
  let history = loadJSON(KEYS.history, []);
  let currentTheme = loadJSON(KEYS.theme, 'dark');

  // giochi state
  let jobState = null;
  let kidsState = null;
  let twentyQState = null;
  let lifeState = null;
  let whereState = null;

  // ====== DOM ===================================================
  const body = document.body;

  const splashScreen = document.getElementById('splashScreen');
  const startOverlay = document.getElementById('startOverlay');
  const btnStartWithProfile = document.getElementById('btnStartWithProfile');
  const btnStartWithoutProfile = document.getElementById('btnStartWithoutProfile');

  const navButtons = document.querySelectorAll('.nav-btn');
  const homeView = document.getElementById('homeView');
  const profilesView = document.getElementById('profilesView');
  const settingsView = document.getElementById('settingsView');

  const currentProfileLabel = document.getElementById('currentProfileLabel');

  const gamesMenu = document.getElementById('gamesMenu');
  const gameCards = document.querySelectorAll('.game-card');
  const gameViews = document.querySelectorAll('.game-view');

  // Profili
  const profilesBadge = document.getElementById('profilesBadge');
  const profilesList = document.getElementById('profilesList');
  const profilesEmpty = document.getElementById('profilesEmpty');

  const pfNome = document.getElementById('pfNome');
  const pfCognome = document.getElementById('pfCognome');
  const pfDob = document.getElementById('pfDob');
  const pfSesso = document.getElementById('pfSesso');
  const pfSposato = document.getElementById('pfSposato');
  const pfHaFigli = document.getElementById('pfHaFigli');
  const pfNumFigli = document.getElementById('pfNumFigli');
  const pfGuida = document.getElementById('pfGuida');
  const pfAnimali = document.getElementById('pfAnimali');
  const pfLavora = document.getElementById('pfLavora');
  const pfCasa = document.getElementById('pfCasa');
  const pfZona = document.getElementById('pfZona');
  const pfTrasferirsi = document.getElementById('pfTrasferirsi');
  const pfPiaceZona = document.getElementById('pfPiaceZona');

  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const clearProfileFormBtn = document.getElementById('clearProfileFormBtn');
  const noProfileBtn = document.getElementById('noProfileBtn');

  // Impostazioni
  const themeRow = document.getElementById('themeRow');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Giochi: Job
  const jobQuestionBox = document.getElementById('jobQuestionBox');
  const jobResult = document.getElementById('jobResult');

  // Giochi: Kids
  const kidsQuestionBox = document.getElementById('kidsQuestionBox');
  const kidsResult = document.getElementById('kidsResult');

  // Giochi: 20Q
  const twentyQBox = document.getElementById('twentyQBox');
  const twentyQResult = document.getElementById('twentyQResult');

  // Magic 8
  const magic8Question = document.getElementById('magic8Question');
  const magic8Ask = document.getElementById('magic8Ask');
  const magic8Clear = document.getElementById('magic8Clear');
  const magic8Text = document.getElementById('magic8Text');
  const magic8Inner = document.getElementById('magic8Inner');

  // Tarocchi
  const tarotDraw = document.getElementById('tarotDraw');
  const tarotReset = document.getElementById('tarotReset');
  const tarotResult = document.getElementById('tarotResult');

  // Pendolo
  const pendQuestion = document.getElementById('pendQuestion');
  const pendAsk = document.getElementById('pendAsk');
  const pendClear = document.getElementById('pendClear');
  const pendResult = document.getElementById('pendResult');
  const pendLine = document.getElementById('pendLine');
  const pendBob = document.getElementById('pendBob');

  // Vita
  const lifeBox = document.getElementById('lifeBox');
  const lifeResult = document.getElementById('lifeResult');

  // Dove vivrò
  const whereBox = document.getElementById('whereBox');
  const whereResult = document.getElementById('whereResult');

  // Fortuna settimanale
  const luckBox = document.getElementById('luckBox');

  // ====== UTILITY PROFILO =======================================

  function getActiveProfile() {
    if (currentProfileIndex == null) return null;
    if (!profiles[currentProfileIndex]) return null;
    return profiles[currentProfileIndex];
  }

  function getProfileName(pf) {
    if (!pf) return 'Standard';
    const nome = (pf.nome || '').trim();
    const cognome = (pf.cognome || '').trim();
    return (nome + ' ' + cognome).trim() || 'Profilo senza nome';
  }

  function calcAge(dob) {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  }

  // ====== NAVIGAZIONE ===========================================

  function showView(viewId) {
    [homeView, profilesView, settingsView].forEach(v => {
      v.classList.toggle('hidden', v.id !== viewId);
    });
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });
  }

  // mostra menu giochi, nasconde tutte le view giochi
  function showGamesMenu() {
    gamesMenu.classList.remove('hidden');
    gameViews.forEach(v => v.classList.add('hidden'));
  }

  function openGame(id) {
    gamesMenu.classList.add('hidden');
    gameViews.forEach(v => v.classList.add('hidden'));
    const view = document.getElementById('game' + capitalize(id));
    if (view) view.classList.remove('hidden');

    switch (id) {
      case 'job': startJobQuiz(); break;
      case 'kids': startKidsQuiz(); break;
      case 'twentyq': startTwentyQ(); break;
      case 'magic8': resetMagic8(); break;
      case 'tarot': resetTarot(false); break;
      case 'pendulum': resetPendulum(false); break;
      case 'life': startLifeQuiz(); break;
      case 'where': startWhereQuiz(); break;
      case 'luck': showWeeklyLuck(); break;
    }
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ====== TEMA ==================================================

  function applyTheme(theme) {
    currentTheme = theme;
    body.setAttribute('data-theme', theme);
    saveJSON(KEYS.theme, currentTheme);
    const pills = themeRow ? themeRow.querySelectorAll('.theme-pill') : [];
    pills.forEach(p => {
      p.classList.toggle('active', p.dataset.theme === currentTheme);
    });
  }

  // ====== STORICO ===============================================

  function addHistoryEntry(game, summary) {
    const pf = getActiveProfile();
    const entry = {
      game,
      summary,
      profile: getProfileName(pf),
      ts: new Date().toISOString()
    };
    history.unshift(entry);
    if (history.length > 50) history.length = 50;
    saveJSON(KEYS.history, history);
    renderHistory();
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (!history || !history.length) {
      const div = document.createElement('div');
      div.className = 'empty-text';
      div.textContent = 'Nessun risultato salvato finora.';
      historyList.appendChild(div);
      return;
    }
    history.forEach(h => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `
        <div class="history-main">
          <span class="history-game">${h.game}</span>
          <span class="history-profile">${h.profile}</span>
        </div>
        <div class="history-summary">${h.summary}</div>
        <div class="history-ts">${formatDateTime(h.ts)}</div>
      `;
      historyList.appendChild(item);
    });
  }

  // ====== PROFILI ===============================================

  function updateProfileLabel() {
    const pf = getActiveProfile();
    currentProfileLabel.textContent = getProfileName(pf);
  }

  function renderProfiles() {
    profilesList.innerHTML = '';
    if (!profiles.length) {
      profilesEmpty.classList.remove('hidden');
    } else {
      profilesEmpty.classList.add('hidden');
      profiles.forEach((pf, index) => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        const isActive = index === currentProfileIndex;
        card.innerHTML = `
          <div class="profile-main">
            <div class="avatar">${(pf.nome || '?').charAt(0).toUpperCase()}</div>
            <div>
              <div class="profile-name">${getProfileName(pf)}${isActive ? ' <span class="badge badge-small">Attivo</span>' : ''}</div>
              <div class="profile-meta">
                ${pf.dob ? `Nato il ${pf.dob}` : 'Data non indicata'} ·
                ${pf.zona ? pf.zona : 'zona non indicata'}
              </div>
            </div>
          </div>
          <div class="profile-actions">
            <button class="btn btn-ghost btn-xs" data-action="use" data-index="${index}">Usa</button>
            <button class="btn btn-ghost btn-xs danger" data-action="delete" data-index="${index}">🗑</button>
          </div>
        `;
        profilesList.appendChild(card);
      });
    }
    profilesBadge.textContent = `${profiles.length} / 5`;
    if (profiles.length >= 5) {
      saveProfileBtn.disabled = true;
      saveProfileBtn.classList.add('btn-disabled');
    } else {
      saveProfileBtn.disabled = false;
      saveProfileBtn.classList.remove('btn-disabled');
    }
  }

  function clearProfileForm() {
    pfNome.value = '';
    pfCognome.value = '';
    pfDob.value = '';
    pfSesso.value = '';
    pfSposato.value = '';
    pfHaFigli.value = '';
    pfNumFigli.value = '';
    pfGuida.value = '';
    pfAnimali.value = '';
    pfLavora.value = '';
    pfCasa.value = '';
    pfZona.value = '';
    pfTrasferirsi.value = '';
    pfPiaceZona.value = '';
  }

  function collectProfileFromForm() {
    const nome = pfNome.value.trim();
    const cognome = pfCognome.value.trim();
    if (!nome || !cognome) {
      alert('Inserisci almeno nome e cognome.');
      return null;
    }
    return {
      nome,
      cognome,
      dob: pfDob.value || null,
      sesso: pfSesso.value || null,
      sposato: pfSposato.value || null,
      haFigli: pfHaFigli.value || null,
      numFigli: pfNumFigli.value ? parseInt(pfNumFigli.value, 10) : 0,
      guida: pfGuida.value || null,
      animali: pfAnimali.value || null,
      lavora: pfLavora.value || null,
      casa: pfCasa.value || null,
      zona: pfZona.value || null,
      trasferirsi: pfTrasferirsi.value || null,
      piaceZona: pfPiaceZona.value || null
    };
  }

  // ====== GIOCO: LAVORO =========================================

  const jobCategories = [
    'Area tecnica / ingegneristica',
    'Area sanitaria / assistenziale',
    'Area educativa / sociale',
    'Area business / organizzativa',
    'Area creativa / digitale',
    'Area manuale / outdoor'
  ];

  const jobQuestions = [
    {
      q: 'Cosa ti dà più soddisfazione?',
      o: [
        { t: 'Risolvere problemi tecnici o logici complessi', s: [3,0,0,1,1,0] },
        { t: 'Aiutare concretamente le persone in difficoltà', s: [0,3,1,0,0,0] },
        { t: 'Spiegare le cose agli altri o guidare un gruppo', s: [0,0,3,1,0,0] },
        { t: 'Creare qualcosa di nuovo con le mani o con la fantasia', s: [0,0,0,0,3,2] }
      ]
    },
    {
      q: 'Come ti senti in un ambiente d’ufficio “classico”?',
      o: [
        { t: 'Bene, se posso gestire numeri, dati o progetti', s: [1,0,0,3,0,0] },
        { t: 'Mi annoia, preferisco muovermi e fare cose pratiche', s: [0,0,0,0,0,3] },
        { t: 'Preferisco un ambiente creativo/fluido', s: [0,0,0,0,3,0] },
        { t: 'Dipende dal team: mi interessa il lato umano', s: [0,1,2,1,0,0] }
      ]
    },
    {
      q: 'Come vivi la tecnologia?',
      o: [
        { t: 'Mi piace smontare/ capire come funziona tutto', s: [3,0,0,0,1,0] },
        { t: 'La uso per comunicare e aiutare gli altri', s: [1,1,2,0,0,0] },
        { t: 'È una tela dove esprimere creatività (foto, video, design…)', s: [0,0,0,0,3,0] },
        { t: 'La uso il minimo indispensabile', s: [0,0,0,0,0,2] }
      ]
    },
    {
      q: 'Che tipo di studio ti attrae di più?',
      o: [
        { t: 'Matematica, fisica, informatica', s: [3,0,0,0,0,0] },
        { t: 'Biologia, psicologia, scienze umane', s: [0,2,2,0,0,0] },
        { t: 'Economia, diritto, management', s: [0,0,0,3,0,0] },
        { t: 'Arte, musica, scrittura, design', s: [0,0,0,0,3,0] }
      ]
    },
    {
      q: 'Quanto ti piace stare a contatto con le persone?',
      o: [
        { t: 'Molto, mi viene naturale ascoltare e parlare', s: [0,1,3,1,0,0] },
        { t: 'Solo se necessario, preferisco concentrarmi su cose/strumenti', s: [3,0,0,0,0,1] },
        { t: 'Dipende dal contesto: mi piacciono i piccoli gruppi', s: [1,1,2,1,0,0] },
        { t: 'Preferisco stare all’aperto a fare cose pratiche', s: [0,0,0,0,0,3] }
      ]
    },
    {
      q: 'Quanto ti piace lavorare all’aperto?',
      o: [
        { t: 'Molto, mi sento meglio fuori che in ufficio', s: [0,0,0,0,0,3] },
        { t: 'Mi piace, ma posso anche stare in un laboratorio/ufficio', s: [1,0,0,0,0,2] },
        { t: 'Preferisco ambienti chiusi e controllati', s: [2,1,0,1,0,0] },
        { t: 'Mi interessa più ciò che faccio che il luogo', s: [1,1,1,1,1,1] }
      ]
    },
    {
      q: 'Come ti senti davanti a una persona malata o in difficoltà?',
      o: [
        { t: 'Mi viene naturale occuparmene e rassicurarla', s: [0,3,0,0,0,0] },
        { t: 'Mi dispiace molto ma faccio fatica a reggere lo stress', s: [0,1,1,0,0,0] },
        { t: 'Preferisco aiutare “da dietro le quinte”', s: [2,1,0,1,0,0] },
        { t: 'Non è il contesto in cui mi vedo', s: [1,0,0,1,1,0] }
      ]
    },
    {
      q: 'Il lavoro ideale per te dovrebbe essere…',
      o: [
        { t: 'Stabile e ben organizzato, con regole chiare', s: [1,1,0,3,0,0] },
        { t: 'Vario, con progetti e sfide diverse', s: [2,0,1,1,1,1] },
        { t: 'Creativo e poco ripetitivo', s: [0,0,0,0,3,1] },
        { t: 'Pratico, artigianale o manuale', s: [0,0,0,0,0,3] }
      ]
    },
    {
      q: 'Come ti vedi nel rapporto con i bambini o i ragazzi?',
      o: [
        { t: 'Potrei insegnare o seguirli in attività educative', s: [0,1,3,0,0,0] },
        { t: 'Mi piacciono ma non so se avrei pazienza', s: [1,1,1,0,0,0] },
        { t: 'Preferisco lavorare con adulti o con cose', s: [2,0,0,2,0,1] },
        { t: 'Li vedo più come parte della famiglia che del lavoro', s: [0,1,1,0,0,0] }
      ]
    },
    {
      q: 'Come vivi i numeri, i bilanci, i fogli Excel?',
      o: [
        { t: 'Mi piacciono: mi danno ordine e chiarezza', s: [2,0,0,3,0,0] },
        { t: 'Li uso, ma non sono la parte che preferisco', s: [1,0,0,1,0,0] },
        { t: 'Li evito se posso', s: [0,0,1,0,1,0] },
        { t: 'Preferisco misurare cose concrete (metri, pezzi, kg)', s: [0,0,0,0,0,3] }
      ]
    },
    {
      q: 'Se dovessi scegliere un progetto per un anno, cosa sceglieresti?',
      o: [
        { t: 'Costruire/automatizzare qualcosa (robot, impianto, software)', s: [3,0,0,0,1,1] },
        { t: 'Aprire un centro o servizio utile alla comunità', s: [0,2,2,0,0,0] },
        { t: 'Lavorare su un grande evento, brand o azienda', s: [0,0,0,3,1,0] },
        { t: 'Dedicarmi a un’opera artistica o artigianale', s: [0,0,0,0,3,2] }
      ]
    },
    {
      q: 'Quanto ti interessa la sicurezza economica?',
      o: [
        { t: 'Molto, è una priorità', s: [1,1,0,3,0,0] },
        { t: 'Mi interessa, ma voglio anche libertà', s: [2,0,1,1,1,0] },
        { t: 'Preferisco libertà/creatività alla stabilità', s: [0,0,0,0,3,1] },
        { t: 'Mi basta vivere serenamente, senza grandi eccessi', s: [1,1,1,1,0,2] }
      ]
    },
    {
      q: 'Ti piacerebbe lavorare di notte o su turni?',
      o: [
        { t: 'Se serve, sì', s: [1,2,0,0,0,1] },
        { t: 'Meglio orari regolari', s: [2,0,1,2,0,0] },
        { t: 'Mi sta bene se è per eventi/spettacoli', s: [0,0,0,0,3,1] },
        { t: 'Meglio orari diurni e lavoro manuale', s: [0,0,0,0,0,3] }
      ]
    },
    {
      q: 'Come ti senti a parlare in pubblico?',
      o: [
        { t: 'Mi viene abbastanza naturale', s: [0,0,2,2,1,0] },
        { t: 'Mi agita, ma posso farlo con preparazione', s: [1,1,1,1,0,0] },
        { t: 'Lo eviterei, preferisco stare “dietro le quinte”', s: [2,0,0,0,0,1] },
        { t: 'Preferisco comunicare con arte, video o testo', s: [0,0,0,1,3,0] }
      ]
    },
    {
      q: 'Che rapporto hai con il lavoro di squadra?',
      o: [
        { t: 'Mi piace coordinare e fare da riferimento', s: [1,0,1,3,0,0] },
        { t: 'Mi piace contribuire, senza dover guidare per forza', s: [2,1,2,1,0,1] },
        { t: 'Preferisco lavorare da solo', s: [2,0,0,0,1,1] },
        { t: 'Dipende dal tipo di squadra e dal progetto', s: [1,1,1,1,1,1] }
      ]
    },
    {
      q: 'Che tipo di risultati ti emozionano di più?',
      o: [
        { t: 'Vedere qualcosa funzionare grazie a me (impianto, software, macchina)', s: [3,0,0,0,1,2] },
        { t: 'Vedere qualcuno stare meglio grazie al mio lavoro', s: [0,3,1,0,0,0] },
        { t: 'Vedere persone capirci/organizzarsi meglio', s: [0,1,3,1,0,0] },
        { t: 'Vedere/creare qualcosa di bello o tangibile', s: [0,0,0,0,3,2] }
      ]
    },
    {
      q: 'Se ti dessero un budget per formarti, lo useresti per…',
      o: [
        { t: 'Corso tecnico avanzato (coding, meccanica, elettronica)', s: [3,0,0,0,1,0] },
        { t: 'Formazione sanitaria/psicologica/educativa', s: [0,3,2,0,0,0] },
        { t: 'Master in management/marketing/organizzazione', s: [0,0,0,3,1,0] },
        { t: 'Accademia o corso creativo/artigianale', s: [0,0,0,0,3,2] }
      ]
    },
    {
      q: 'Quanto contano per te le regole/procedure?',
      o: [
        { t: 'Molto: mi aiutano a lavorare meglio', s: [2,2,1,3,0,0] },
        { t: 'Mi servono, ma voglio anche margine personale', s: [2,1,2,1,1,1] },
        { t: 'Mi piacciono i contesti flessibili', s: [1,0,1,0,2,1] },
        { t: 'Preferisco “imparare facendo”, senza troppa burocrazia', s: [1,0,0,0,1,3] }
      ]
    },
    {
      q: 'Come vivi la manualità?',
      o: [
        { t: 'Mi piace costruire, riparare, usare attrezzi', s: [2,0,0,0,0,3] },
        { t: 'Sono più portato per la testa che per le mani', s: [3,1,1,1,1,0] },
        { t: 'Mi piace se legata ad arte/design', s: [1,0,0,0,3,2] },
        { t: 'La uso ma non è centrale', s: [1,0,1,1,0,1] }
      ]
    },
    {
      q: 'Se dovessi lavorare con persone fragili (anziani, disabili, ecc.)…',
      o: [
        { t: 'Potrei farlo, con formazione e sostegno adeguato', s: [0,3,2,0,0,0] },
        { t: 'Mi spaventa un po’, preferisco altro', s: [1,1,0,1,0,0] },
        { t: 'Preferisco aiutarli indirettamente (tecnica, organizzazione)', s: [2,2,0,2,0,0] },
        { t: 'Non mi vedo in questo contesto', s: [1,0,0,1,1,0] }
      ]
    },
    {
      q: 'Che bilanciamento vorresti tra mente e corpo nel lavoro?',
      o: [
        { t: 'Molto mentale, un po’ pratico', s: [3,1,1,2,1,0] },
        { t: 'Equilibrato tra testa e mani', s: [2,1,1,1,1,2] },
        { t: 'Più pratico/manuale che mentale', s: [1,0,0,0,0,3] },
        { t: 'Dipende: l’importante è il senso di ciò che faccio', s: [1,2,2,1,1,1] }
      ]
    }
  ];

  function startJobQuiz() {
    jobState = {
      index: 0,
      scores: [0, 0, 0, 0, 0, 0]
    };
    jobResult.classList.add('hidden');
    renderJobQuestion();
  }

  function renderJobQuestion() {
    const s = jobState;
    if (!s) return;
    if (s.index >= jobQuestions.length) {
      showJobResult();
      return;
    }
    const q = jobQuestions[s.index];
    jobQuestionBox.innerHTML = `
      <div class="question-title">Domanda ${s.index + 1} di ${jobQuestions.length}</div>
      <div class="question-text">${q.q}</div>
      <div class="answers"></div>
    `;
    const answersDiv = jobQuestionBox.querySelector('.answers');
    q.o.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn answer-btn';
      btn.textContent = opt.t;
      btn.addEventListener('click', () => {
        opt.s.forEach((v, i) => s.scores[i] += v);
        s.index++;
        renderJobQuestion();
      });
      answersDiv.appendChild(btn);
    });
  }

  function showJobResult() {
    jobQuestionBox.innerHTML = '';
    let max = -Infinity;
    let idx = 0;
    jobState.scores.forEach((v, i) => {
      if (v > max) {
        max = v;
        idx = i;
      }
    });
    const pf = getActiveProfile();
    const age = pf ? calcAge(pf.dob) : null;
    const cat = jobCategories[idx];

    let extra = '';
    if (pf) {
      extra += `\n\nProfilo considerato: ${getProfileName(pf)}.`;
      if (age != null) {
        extra += ` Età circa: ${age} anni.`;
      }
      if (pf.zona) {
        extra += ` Zona attuale: ${pf.zona}.`;
      }
    }

    const texts = [
      'Ti orienti bene tra problemi logici, sistemi e strumenti: una professione tecnica o ingegneristica potrebbe valorizzare il tuo modo di pensare.',
      'Hai una forte componente empatica e ti realizzi quando aiuti gli altri in modo concreto: ambiti sanitari o assistenziali potrebbero essere adatti.',
      'Ti viene naturale spiegare, guidare, accompagnare: ruoli educativi, formativi o sociali potrebbero darti soddisfazione.',
      'Ti piacciono strategia, organizzazione e visione d’insieme: potrebbero funzionare ruoli di business, gestione o coordinamento.',
      'Hai una componente creativa importante: arti, contenuti digitali, design o comunicazione visiva potrebbero essere il tuo terreno.',
      'Ti senti a tuo agio con la manualità e l’azione: lavori artigianali, tecnici sul campo o all’aria aperta potrebbero farti stare bene.'
    ];

    jobResult.classList.remove('hidden');
    jobResult.innerHTML = `
      <div class="result-title">Area suggerita: ${cat}</div>
      <div class="result-text">${texts[idx]}${extra}</div>
    `;

    addHistoryEntry('Che lavoro fa per me?', cat);
  }

  // ====== GIOCO: QUANTI FIGLI AVRÒ ==============================

  const kidsQuestions = [
    {
      q: 'Quanto ti piacciono i bambini in generale?',
      w: [0, 1, 2, 3]
    },
    {
      q: 'Quanto ti piace l’idea di una casa piena e un po’ caotica?',
      w: [0, 1, 2, 3]
    },
    {
      q: 'Quanto valore dai alla vita familiare rispetto al lavoro o al tempo libero?',
      w: [0, 1, 2, 3]
    },
    {
      q: 'Quanto ti pesa svegliarti di notte o dormire poco?',
      w: [3, 2, 1, 0] // qui meno è meglio
    },
    {
      q: 'Quanto spesso ti piace avere la casa in ordine perfetto?',
      w: [3, 2, 1, 0] // più precisione = meno figli
    },
    {
      q: 'Quanto sei disposto a rinunciare a uscite/spostamenti improvvisi?',
      w: [0, 1, 2, 3]
    },
    {
      q: 'Quanto ti piace organizzare e gestire impegni (scuola, sport, visite)?',
      w: [0, 1, 2, 3]
    },
    {
      q: 'Quanto ti senti supportato dalla tua rete (partner, famiglia, amici)?',
      w: [0, 1, 2, 3]
    },
    {
      q: 'Quanto ti spaventa la responsabilità economica di crescere figli?',
      w: [3, 2, 1, 0]
    },
    {
      q: 'Quanto ti immagini ancora “in movimento” nei prossimi 10–15 anni?',
      w: [3, 2, 1, 0] // molta voglia di cambiare = leggermente meno figli
    }
  ];

  const kidsAnswers = [
    'Per nulla',
    'Così così',
    'Abbastanza',
    'Molto'
  ];

  function startKidsQuiz() {
    kidsState = { index: 0, score: 0 };
    kidsResult.classList.add('hidden');
    renderKidsQuestion();
  }

  function renderKidsQuestion() {
    const s = kidsState;
    if (!s) return;
    if (s.index >= kidsQuestions.length) {
      showKidsResult();
      return;
    }
    const q = kidsQuestions[s.index];
    kidsQuestionBox.innerHTML = `
      <div class="question-title">Domanda ${s.index + 1} di ${kidsQuestions.length}</div>
      <div class="question-text">${q.q}</div>
      <div class="answers"></div>
    `;
    const answers = kidsQuestionBox.querySelector('.answers');
    kidsAnswers.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn answer-btn';
      btn.textContent = t;
      btn.addEventListener('click', () => {
        s.score += q.w[i];
        s.index++;
        renderKidsQuestion();
      });
      answers.appendChild(btn);
    });
  }

  function showKidsResult() {
    kidsQuestionBox.innerHTML = '';

    let score = kidsState.score;

    const pf = getActiveProfile();
    const age = pf ? calcAge(pf.dob) : null;

    // aggiustamenti profilo
    if (pf) {
      if (pf.sposato === 'si') score += 2;
      if (pf.haFigli === 'si') score += Math.min(4, pf.numFigli || 0);
      if (pf.casa === 'proprieta') score += 1;
      if (pf.piaceZona === 'no') score -= 1;
      if (pf.trasferirsi === 'si') score -= 1;
      if (age != null) {
        if (age < 25) score += 2;
        else if (age > 40) score -= 2;
      }
    }

    if (score < 0) score = 0;

    let fascia;
    if (score <= 6) fascia = '0–1';
    else if (score <= 11) fascia = '1–2';
    else if (score <= 16) fascia = '2–3';
    else if (score <= 21) fascia = '3–4';
    else fascia = '4+';

    let min, max;
    switch (fascia) {
      case '0–1': min = 0; max = 1; break;
      case '1–2': min = 1; max = 2; break;
      case '2–3': min = 2; max = 3; break;
      case '3–4': min = 3; max = 4; break;
      default: min = 4; max = 6; break;
    }
    const predicted = min + Math.floor(Math.random() * (max - min + 1));

    let extra = 'Ricorda: è solo un gioco statistico, non una previsione reale. La tua vita (e le tue scelte) contano più di qualsiasi algoritmo.';

    if (pf && pf.haFigli === 'si') {
      extra += `\n\nHai già indicato ${pf.numFigli || 0} figli nel profilo: il numero proposto considera anche la situazione attuale.`;
    }

    kidsResult.classList.remove('hidden');
    kidsResult.innerHTML = `
      <div class="result-title">Stima giocosa: ${predicted} figli</div>
      <div class="result-text">
        In base alle tue risposte, la fascia più probabile è <strong>${fascia}</strong> figli complessivi nella tua vita.
        Ho estratto un numero dentro quella fascia e ho ottenuto <strong>${predicted}</strong>.
        <br><br>${extra}
      </div>
    `;

    addHistoryEntry('Quanti figli avrò?', `${predicted} (fascia ${fascia})`);
  }

  // ====== GIOCO: 20 QUESTIONS ==================================

  const twentyQObjects = [
    { name: 'cane', animal: true, food: false, vehicle: false, tech: false, indoor: false, natural: false },
    { name: 'gatto', animal: true, food: false, vehicle: false, tech: false, indoor: true, natural: false },
    { name: 'pesce rosso', animal: true, food: false, vehicle: false, tech: false, indoor: true, natural: false },
    { name: 'pizza', animal: false, food: true, vehicle: false, tech: false, indoor: true, natural: false },
    { name: 'gelato', animal: false, food: true, vehicle: false, tech: false, indoor: true, natural: false },
    { name: 'auto', animal: false, food: false, vehicle: true, tech: true, indoor: false, natural: false },
    { name: 'bicicletta', animal: false, food: false, vehicle: true, tech: false, indoor: false, natural: false },
    { name: 'computer', animal: false, food: false, vehicle: false, tech: true, indoor: true, natural: false },
    { name: 'telefono', animal: false, food: false, vehicle: false, tech: true, indoor: true, natural: false },
    { name: 'albero', animal: false, food: false, vehicle: false, tech: false, indoor: false, natural: true },
    { name: 'montagna', animal: false, food: false, vehicle: false, tech: false, indoor: false, natural: true },
    { name: 'mare', animal: false, food: false, vehicle: false, tech: false, indoor: false, natural: true },
    { name: 'sedia', animal: false, food: false, vehicle: false, tech: false, indoor: true, natural: false },
    { name: 'libro', animal: false, food: false, vehicle: false, tech: false, indoor: true, natural: false },
    { name: 'chitarra', animal: false, food: false, vehicle: false, tech: false, indoor: true, natural: false }
  ];

  const twentyQQuestions = [
    { key: 'animal', text: 'È un animale?' },
    { key: 'food', text: 'Si mangia?' },
    { key: 'vehicle', text: 'Serve principalmente per spostarsi?' },
    { key: 'tech', text: 'È qualcosa di tecnologico o elettronico?' },
    { key: 'indoor', text: 'Di solito si trova soprattutto in casa?' },
    { key: 'natural', text: 'È qualcosa di naturale (non costruito dall’uomo)?' }
  ];

  function startTwentyQ() {
    twentyQState = {
      mode: 'question', // 'question' | 'guess' | 'end'
      questionIndex: 0,
      askedCount: 0,
      candidates: [...twentyQObjects],
      guessIndex: 0
    };
    twentyQResult.classList.add('hidden');
    renderTwentyQ();
  }

  function renderTwentyQ() {
    const s = twentyQState;
    if (!s) return;

    // se abbiamo candidato unico, andiamo diretto a guess
    if (s.candidates.length <= 3 && s.mode !== 'end') {
      s.mode = 'guess';
    }

    if (s.mode === 'question') {
      if (s.questionIndex >= twentyQQuestions.length || s.askedCount >= 40) {
        // passiamo alla modalità guess
        s.mode = 'guess';
        s.guessIndex = 0;
        renderTwentyQ();
        return;
      }

      const q = twentyQQuestions[s.questionIndex];
      twentyQBox.innerHTML = `
        <div class="question-title">Domanda ${s.askedCount + 1} (max 40)</div>
        <div class="question-text">${q.text}</div>
        <div class="answers"></div>
      `;
      const answers = twentyQBox.querySelector('.answers');

      ['Sì', 'No', 'Non lo so'].forEach((label, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn answer-btn';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          s.askedCount++;
          if (idx === 0) {
            // sì
            s.candidates = s.candidates.filter(o => o[q.key] === true);
          } else if (idx === 1) {
            // no
            s.candidates = s.candidates.filter(o => o[q.key] === false);
          } else {
            // non lo so -> non filtriamo
          }
          s.questionIndex++;
          renderTwentyQ();
        });
        answers.appendChild(btn);
      });

      twentyQResult.classList.add('hidden');
    } else if (s.mode === 'guess') {
      if (!s.candidates.length || s.askedCount >= 40 || s.guessIndex >= s.candidates.length) {
        showTwentyQFail();
        return;
      }

      const obj = s.candidates[s.guessIndex];
      twentyQBox.innerHTML = `
        <div class="question-title">Tentativo ${s.guessIndex + 1} di ${s.candidates.length}</div>
        <div class="question-text">Stai pensando a <strong>${obj.name}</strong>?</div>
        <div class="answers"></div>
      `;
      const answers = twentyQBox.querySelector('.answers');
      const btnYes = document.createElement('button');
      btnYes.className = 'btn answer-btn';
      btnYes.textContent = 'Sì, è proprio questo';
      btnYes.addEventListener('click', () => {
        showTwentyQSuccess(obj.name);
      });
      const btnNo = document.createElement('button');
      btnNo.className = 'btn answer-btn';
      btnNo.textContent = 'No, continua a provare';
      btnNo.addEventListener('click', () => {
        s.guessIndex++;
        s.askedCount++;
        renderTwentyQ();
      });
      answers.appendChild(btnYes);
      answers.appendChild(btnNo);
    } else {
      // end
    }
  }

  function showTwentyQSuccess(name) {
    twentyQState.mode = 'end';
    twentyQBox.innerHTML = `
      <div class="question-title">Risultato</div>
      <div class="question-text">Credo che tu stessi pensando a: <strong>${name}</strong>.</div>
    `;
    twentyQResult.classList.remove('hidden');
    twentyQResult.innerHTML = `
      <div class="result-title">Ti ho letto nella mente (quasi).</div>
      <div class="result-text">
        Ho usato una piccola base di oggetti e le tue risposte per restringere le possibilità.
        Con un database più grande potrei diventare ancora più preciso.
      </div>
    `;

    addHistoryEntry('Indovina a cosa sto pensando', name);
  }

  function showTwentyQFail() {
    twentyQState.mode = 'end';
    twentyQBox.innerHTML = `
      <div class="question-title">Mi arrendo!</div>
      <div class="question-text">
        Mi hai battuto, non riesco a leggere i tuoi pensieri! 🎩✨<br>
        O l’oggetto che hai scelto non è (ancora) nel mio piccolo archivio.
      </div>
    `;
    twentyQResult.classList.remove('hidden');
    twentyQResult.innerHTML = `
      <div class="result-title">Partita conclusa</div>
      <div class="result-text">
        Puoi riprovare con un oggetto molto comune (cane, auto, pizza, telefono, libro, mare…)
        oppure allargare la mia “enciclopedia” in una futura versione.
      </div>
    `;

    addHistoryEntry('Indovina a cosa sto pensando', 'Non sono riuscito a indovinare');
  }

  // ====== GIOCO: MAGIC 8 BALL ==================================

  const magic8Yes = [
    'Decisamente sì.',
    'Le prospettive sono buone.',
    'Se continui così, la risposta tende al sì.',
    'Tutto punta verso un esito positivo.'
  ];
  const magic8No = [
    'Per ora la risposta è no.',
    'Non sembra il momento giusto.',
    'Le probabilità non sono dalla tua parte.',
    'Meglio non farci troppo affidamento.'
  ];
  const magic8Maybe = [
    'È ancora troppo presto per dirlo.',
    'Dipende da alcune scelte che farai a breve.',
    'Le energie sono in equilibrio: potrebbe andare in entrambe le direzioni.',
    'Non tutto è scritto: il tuo libero arbitrio qui conta molto.'
  ];

  function resetMagic8() {
    magic8Question.value = '';
    magic8Text.classList.add('hidden');
    magic8Inner.textContent = 'Fai\nuna domanda';
  }

  function classifyQuestion(q) {
    const txt = q.toLowerCase();
    const positive = /(riuscir|andrà bene|ottenere|vincere|migliorer|funzioner)/;
    const negative = /(perder|fallir|andrà male|peggiorer|problemi)/;
    if (positive.test(txt)) return 'yes';
    if (negative.test(txt)) return 'no';
    return 'maybe';
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function handleMagic8() {
    const q = magic8Question.value.trim();
    if (!q) {
      alert('Scrivi una domanda chiusa (sì/no).');
      return;
    }
    const type = classifyQuestion(q);
    let answer;
    if (type === 'yes') answer = pickRandom(magic8Yes);
    else if (type === 'no') answer = pickRandom(magic8No);
    else answer = pickRandom(magic8Maybe);

    const pf = getActiveProfile();
    let note = '';
    if (pf) {
      const t = q.toLowerCase();
      if (t.includes('lavor') && pf.lavora === 'si') {
        note = ' (Considero anche il fatto che al momento lavori già.)';
      } else if (t.includes('figli') && pf.haFigli === 'si') {
        note = ' (Vedo che nel profilo hai già indicato dei figli.)';
      } else if (t.includes('casa') && pf.casa === 'proprieta') {
        note = ' (La stabilità della casa di proprietà pesa leggermente nella risposta.)';
      }
    }

    magic8Inner.textContent = answer;
    magic8Text.classList.remove('hidden');
    magic8Text.innerHTML = `
      <div class="result-title">Risposta della sfera</div>
      <div class="result-text">${answer}${note}</div>
    `;

    addHistoryEntry('Magic 8 Ball', answer);
  }

  // ====== GIOCO: TAROCCHI ======================================

  const tarotDeck = [
    { name: 'Il Mago', meaning: 'Inizio, iniziativa, risorse interiori e creatività pratica.' },
    { name: 'La Papessa', meaning: 'Intuizione, ascolto interiore, saggezza silenziosa.' },
    { name: 'L’Imperatrice', meaning: 'Fertilità, crescita, cura, abbondanza emotiva e materiale.' },
    { name: 'L’Imperatore', meaning: 'Struttura, responsabilità, autorità e confini.' },
    { name: 'Il Matto', meaning: 'Nuovo inizio, salto nel vuoto, fiducia e spontaneità.' },
    { name: 'La Ruota della Fortuna', meaning: 'Cambiamento di ciclo, occasioni, imprevisti che aprono strade.' },
    { name: 'La Forza', meaning: 'Coraggio gentile, tenacia, energia canalizzata.' },
    { name: 'La Temperanza', meaning: 'Equilibrio, armonizzazione, tempo giusto per ogni cosa.' }
  ];

  function drawTarotCards() {
    const deck = [...tarotDeck];
    const chosen = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * deck.length);
      chosen.push(deck.splice(idx, 1)[0]);
    }
    return chosen;
  }

  function tarotProfileNote(card, pf) {
    if (!pf) return '';
    switch (card.name) {
      case 'L’Imperatrice':
        if (pf.haFigli === 'si' || pf.numFigli > 0) {
          return ' Nel tuo profilo c’è già una componente familiare forte: questa carta amplifica la dimensione di cura.';
        }
        return ' Potrebbe parlare di progetti o relazioni da far crescere, non solo di famiglia.';
      case 'Il Matto':
        if (pf.trasferirsi === 'si') {
          return ' Hai già espresso desiderio di cambiamento: il Matto sembra confermare una spinta in quella direzione.';
        }
        return ' Invita a considerare strade nuove anche se non avevi in mente grandi cambiamenti.';
      case 'La Ruota della Fortuna':
        if (pf.casa === 'proprieta') {
          return ' Anche in situazioni stabili (come una casa di proprietà) possono arrivare giri di ruota inattesi.';
        }
        return ' I cambiamenti potrebbero riguardare soprattutto lavoro, luogo o relazioni.';
      default:
        return '';
    }
  }

  function handleTarotDraw() {
    const cards = drawTarotCards();
    const pf = getActiveProfile();
    const labels = ['Presente', 'Sfida', 'Possibile esito'];

    let html = '<div class="tarot-grid">';
    cards.forEach((c, i) => {
      html += `
        <div class="tarot-card">
          <div class="tarot-position">${labels[i]}</div>
          <div class="tarot-name">${c.name}</div>
          <div class="tarot-meaning">${c.meaning}${tarotProfileNote(c, pf)}</div>
        </div>
      `;
    });
    html += '</div><div class="tarot-note">Lettura simbolica: non è una previsione certa ma uno spunto di riflessione.\nUsala per farti domande, non per avere risposte assolute.</div>';

    tarotResult.classList.remove('hidden');
    tarotResult.innerHTML = html;

    addHistoryEntry('Tarocchi', cards.map(c => c.name).join(' · '));
  }

  function resetTarot(hide = true) {
    if (hide) {
      tarotResult.classList.add('hidden');
      tarotResult.innerHTML = '';
    }
  }

  // ====== GIOCO: PENDOLINO =====================================

  function resetPendulum(hide = true) {
    pendResult.classList[hide ? 'add' : 'remove']('hidden');
    if (hide) pendResult.innerHTML = '';
    pendBob.textContent = '?';
    pendLine.classList.remove('pend-yes', 'pend-no', 'pend-maybe');
    pendBob.classList.remove('pend-yes', 'pend-no', 'pend-maybe');
  }

  function pendulumAnswer(question) {
    const txt = question.toLowerCase();
    let base = 'maybe';
    if (/riuscir|andrà bene|funzioner|migliorer/.test(txt)) base = 'yes';
    if (/fallir|andrà male|perder|rischio/.test(txt)) base = 'no';

    const r = Math.random();
    if (base === 'yes') {
      if (r < 0.6) return 'yes';
      if (r < 0.8) return 'maybe';
      return 'no';
    }
    if (base === 'no') {
      if (r < 0.6) return 'no';
      if (r < 0.8) return 'maybe';
      return 'yes';
    }
    if (r < 0.33) return 'yes';
    if (r < 0.66) return 'no';
    return 'maybe';
  }

  function handlePendulum() {
    const q = pendQuestion.value.trim();
    if (!q) {
      alert('Scrivi una domanda per il pendolo.');
      return;
    }
    resetPendulum(false);

    const res = pendulumAnswer(q);
    pendLine.classList.add('pend-' + res);
    pendBob.classList.add('pend-' + res);

    let text;
    if (res === 'yes') text = 'Il pendolo tende verso il SÌ.';
    else if (res === 'no') text = 'Il pendolo tende verso il NO.';
    else text = 'Il pendolo rimane indeciso: FORSE.';

    pendBob.textContent = res === 'yes' ? 'S' : (res === 'no' ? 'N' : '?');

    pendResult.classList.remove('hidden');
    pendResult.innerHTML = `
      <div class="result-title">Risposta del pendolo</div>
      <div class="result-text">
        ${text}<br>
        Prendila come un gioco: la decisione finale resta comunque tua.
      </div>
    `;

    addHistoryEntry('Pendolino', text);
  }

  // ====== GIOCO: ASPETTATIVA DI VITA ===========================

  const lifeQuestions = [
    { q: 'Fumi sigarette o simili?', w: [-4, -2, -1, 0] },
    { q: 'Quanto spesso bevi alcolici?', w: [-3, -1, 0, 1] }, // più moderato = neutro
    { q: 'Quanta attività fisica fai?', w: [-1, 0, 1, 3] },
    { q: 'Come giudichi la tua alimentazione?', w: [-2, 0, 1, 3] },
    { q: 'Quanto ti senti stressato/a nella media?', w: [-3, -1, 0, 1] }, // meno stress = meglio
    { q: 'Quante ore dormi di solito a notte?', w: [-2, 0, 2, 1] }, // idealmente 7–8
    { q: 'Ogni quanto fai controlli medici di base?', w: [-1, 0, 1, 3] }
  ];

  const lifeOptions = [
    'Quasi mai / molto poco',
    'Ogni tanto',
    'Abbastanza regolarmente',
    'Molto / sempre'
  ];

  function startLifeQuiz() {
    lifeState = { index: 0, score: 0 };
    lifeResult.classList.add('hidden');
    renderLifeQuestion();
  }

  function renderLifeQuestion() {
    const s = lifeState;
    if (!s) return;
    if (s.index >= lifeQuestions.length) {
      showLifeResult();
      return;
    }
    const q = lifeQuestions[s.index];
    lifeBox.innerHTML = `
      <div class="question-title">Domanda ${s.index + 1} di ${lifeQuestions.length}</div>
      <div class="question-text">${q.q}</div>
      <div class="answers"></div>
    `;
    const answers = lifeBox.querySelector('.answers');
    lifeOptions.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn answer-btn';
      btn.textContent = t;
      btn.addEventListener('click', () => {
        s.score += q.w[i];
        s.index++;
        renderLifeQuestion();
      });
      answers.appendChild(btn);
    });
  }

  function showLifeResult() {
    lifeBox.innerHTML = '';

    const pf = getActiveProfile();
    const age = pf ? calcAge(pf.dob) : null;

    let base;
    if (pf && pf.sesso === 'F') base = 84;
    else base = 80;

    let adj = lifeState.score;

    if (pf) {
      if (pf.animali === 'si') adj += 1;
      if (pf.guida === 'si') adj -= 1;
      if (pf.zona === 'montagna') adj += 1;
      if (pf.zona === 'citta') adj -= 0.5;
    }

    let expectancy = Math.round(base + adj);
    if (expectancy < 55) expectancy = 55;
    if (expectancy > 95) expectancy = 95;

    let remaining = '';
    if (age != null) {
      remaining = expectancy - age;
      if (remaining < 0) remaining = 0;
    }

    lifeResult.classList.remove('hidden');
    lifeResult.innerHTML = `
      <div class="result-title">Stima giocosa: circa ${expectancy} anni</div>
      <div class="result-text">
        In base alle tue risposte e a una media statistica molto generica,
        la mia stima ludica di aspettativa di vita è di circa <strong>${expectancy}</strong> anni.
        ${
          age != null
            ? `<br>Considerando un’età attuale di circa ${age} anni, resterebbero all’incirca <strong>${remaining}</strong> anni.`
            : ''
        }
        <br><br><strong>Attenzione:</strong> questa non è una valutazione medica, ma un gioco basato su tendenze
        generiche. Per la tua salute reale conta ciò che fai ogni giorno e ciò che ti dirà un medico vero.
      </div>
    `;

    addHistoryEntry('Aspettativa di vita', `${expectancy} anni (gioco)`);
  }

  // ====== GIOCO: DOVE VIVRÒ TRA 10 ANNI ========================

  const whereQuestions = [
    { q: 'Quanto ti piace vivere vicino al mare?', w: [0, 1, 2, 3] },
    { q: 'Quanto ti attira l’idea di vivere in mezzo alla natura/montagna?', w: [0, 1, 2, 3] },
    { q: 'Quanto ti piace l’energia di una grande città?', w: [0, 1, 2, 3] },
    { q: 'Quanto ti attira l’idea di vivere all’estero?', w: [0, 1, 2, 3] }
  ];

  const whereOptions = ['Per nulla', 'Un po’', 'Abbastanza', 'Molto'];

  function startWhereQuiz() {
    whereState = { index: 0, scores: { mare: 0, montagna: 0, citta: 0, estero: 0 } };
    whereResult.classList.add('hidden');
    renderWhereQuestion();
  }

  function renderWhereQuestion() {
    const s = whereState;
    if (!s) return;
    if (s.index >= whereQuestions.length) {
      showWhereResult();
      return;
    }
    const q = whereQuestions[s.index];
    whereBox.innerHTML = `
      <div class="question-title">Domanda ${s.index + 1} di ${whereQuestions.length}</div>
      <div class="question-text">${q.q}</div>
      <div class="answers"></div>
    `;
    const answers = whereBox.querySelector('.answers');
    whereOptions.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn answer-btn';
      btn.textContent = t;
      btn.addEventListener('click', () => {
        const val = q.w[i];
        if (s.index === 0) s.scores.mare += val;
        if (s.index === 1) s.scores.montagna += val;
        if (s.index === 2) s.scores.citta += val;
        if (s.index === 3) s.scores.estero += val;
        s.index++;
        renderWhereQuestion();
      });
      answers.appendChild(btn);
    });
  }

  function showWhereResult() {
    whereBox.innerHTML = '';
    const pf = getActiveProfile();
    if (pf) {
      if (pf.zona === 'mare') whereState.scores.mare += 1;
      if (pf.zona === 'montagna') whereState.scores.montagna += 1;
      if (pf.zona === 'citta') whereState.scores.citta += 1;
      if (pf.trasferirsi === 'si') {
        whereState.scores.estero += 1;
      }
      if (pf.piaceZona === 'no') {
        // meno probabile restare dove si è
        if (pf.zona === 'mare') whereState.scores.mare -= 1;
        if (pf.zona === 'montagna') whereState.scores.montagna -= 1;
        if (pf.zona === 'citta') whereState.scores.citta -= 1;
      }
    }

    const entries = Object.entries(whereState.scores);
    entries.sort((a, b) => b[1] - a[1]);
    const best = entries[0][0];

    let text;
    switch (best) {
      case 'mare':
        text = 'vicino al mare, magari in una zona dove puoi respirare aria salmastra e vedere l’acqua spesso.';
        break;
      case 'montagna':
        text = 'in montagna o comunque in mezzo alla natura, con più silenzio e spazi verdi.';
        break;
      case 'citta':
        text = 'in una città o in un contesto urbano vivace, con molti servizi e movimento.';
        break;
      case 'estero':
      default:
        text = 'in un’altra nazione o comunque fuori dal contesto in cui vivi ora.';
        break;
    }

    whereResult.classList.remove('hidden');
    whereResult.innerHTML = `
      <div class="result-title">Tendenza: ${best === 'citta' ? 'città' : best}</div>
      <div class="result-text">
        Guardando le tue risposte e alcuni dati del profilo, sembra più probabile che tra circa 10 anni tu viva
        <strong>${text}</strong>
        <br><br>Ovviamente la scelta reale dipenderà da opportunità, relazioni e decisioni che prenderai nel tempo.
      </div>
    `;

    addHistoryEntry('Dove vivrò tra 10 anni?', best);
  }

  // ====== GIOCO: FORTUNA DELLA SETTIMANA ========================

  function weekId(d = new Date()) {
    // ISO week
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${weekNo}`;
  }

  function seededRandom(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    const x = Math.sin(h) * 10000;
    return x - Math.floor(x);
  }

  function showWeeklyLuck() {
    const pf = getActiveProfile();
    const name = getProfileName(pf);
    const wk = weekId();
    const seed = name + '|' + wk;
    const r = seededRandom(seed);
    const val = Math.floor(r * 10) + 1; // 1..10

    let desc;
    if (val <= 3) desc = 'Settimana un po’ impegnativa: niente di tragico, ma meglio non forzare troppo le cose.';
    else if (val <= 6) desc = 'Settimana nella norma: qualche piccolo ostacolo e qualche piccolo colpo di fortuna.';
    else if (val <= 8) desc = 'Buona settimana: occasioni e sincronie positive sono più probabili.';
    else desc = 'Settimana molto favorevole: se devi fare un passo importante, potresti considerare questi giorni.';

    luckBox.innerHTML = `
      <div class="result-title">Indice di fortuna: ${val} / 10</div>
      <div class="result-text">
        Questo valore è calcolato in modo deterministico sul tuo profilo e sulla settimana corrente (<strong>${wk}</strong>):
        se riapri l’app durante la stessa settimana, resterà lo stesso.
        <br><br>${desc}
      </div>
    `;

    addHistoryEntry('Fortuna della settimana', `${val}/10 (${wk})`);
  }

  // ====== EVENT LISTENERS =======================================

  // Splash
  window.addEventListener('load', () => {
    setTimeout(() => {
      splashScreen.classList.add('hidden');
      startOverlay.classList.remove('hidden');
    }, 1500);
  });

  // Modale start
  btnStartWithProfile.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    showView('profilesView');
  });

  btnStartWithoutProfile.addEventListener('click', () => {
    currentProfileIndex = null;
    saveJSON(KEYS.currentProfile, currentProfileIndex);
    updateProfileLabel();
    startOverlay.classList.add('hidden');
    showView('homeView');
  });

  // Nav
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      showView(view);
      if (view === 'homeView') showGamesMenu();
    });
  });

  // Game cards
  gameCards.forEach(card => {
    card.addEventListener('click', () => {
      openGame(card.dataset.game);
    });
  });

  // Back buttons nei giochi
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      showGamesMenu();
    });
  });

  // Profili - click lista
  profilesList.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (btn.dataset.action === 'use') {
      currentProfileIndex = index;
      saveJSON(KEYS.currentProfile, currentProfileIndex);
      updateProfileLabel();
      renderProfiles();
    } else if (btn.dataset.action === 'delete') {
      if (confirm('Vuoi davvero eliminare questo profilo?')) {
        profiles.splice(index, 1);
        if (currentProfileIndex === index) currentProfileIndex = null;
        else if (currentProfileIndex > index) currentProfileIndex--;
        saveJSON(KEYS.profiles, profiles);
        saveJSON(KEYS.currentProfile, currentProfileIndex);
        updateProfileLabel();
        renderProfiles();
      }
    }
  });

  // Profili - pulsanti form
  saveProfileBtn.addEventListener('click', () => {
    if (profiles.length >= 5) {
      alert('Hai già 5 profili. Elimina un profilo per crearne un altro.');
      return;
    }
    const pf = collectProfileFromForm();
    if (!pf) return;
    profiles.push(pf);
    saveJSON(KEYS.profiles, profiles);
    currentProfileIndex = profiles.length - 1;
    saveJSON(KEYS.currentProfile, currentProfileIndex);
    updateProfileLabel();
    renderProfiles();
    clearProfileForm();
  });

  clearProfileFormBtn.addEventListener('click', clearProfileForm);

  noProfileBtn.addEventListener('click', () => {
    currentProfileIndex = null;
    saveJSON(KEYS.currentProfile, currentProfileIndex);
    updateProfileLabel();
  });

  // Temi
  themeRow.addEventListener('click', e => {
    const pill = e.target.closest('.theme-pill');
    if (!pill) return;
    applyTheme(pill.dataset.theme);
  });

  // Storico
  clearHistoryBtn.addEventListener('click', () => {
    if (!history.length) return;
    if (confirm('Vuoi davvero cancellare lo storico dei risultati?')) {
      history = [];
      saveJSON(KEYS.history, history);
      renderHistory();
    }
  });

  // Magic 8
  magic8Ask.addEventListener('click', handleMagic8);
  magic8Clear.addEventListener('click', resetMagic8);

  // Tarocchi
  tarotDraw.addEventListener('click', handleTarotDraw);
  tarotReset.addEventListener('click', () => resetTarot(true));

  // Pendolino
  pendAsk.addEventListener('click', handlePendulum);
  pendClear.addEventListener('click', () => {
    pendQuestion.value = '';
    resetPendulum(true);
  });

  // ====== INIT ==================================================

  function init() {
    applyTheme(currentTheme || 'dark');
    updateProfileLabel();
    renderProfiles();
    renderHistory();
    showView('homeView');
    showGamesMenu();
  }

  init();
})();
