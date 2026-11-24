/* global bootstrap */
const suchfeld = document.getElementById('suchfeld');
const typFilter = document.getElementById('typ-filter');
const genFilter = document.getElementById('gen-filter');
const spracheFilter = document.getElementById('sprache-filter');
const sortierButton = document.getElementById('sortier-button');
const kartenRaster = document.getElementById('karten-raster');
const statusMeldung = document.getElementById('status-meldung');
const trainerFilter = document.getElementById('trainer-filter');

let aktuellePokemonDaten = [];
let alphabetischSortiert = false;
let aktuelleSprache = 'de';

// Lokales Wörterbuch (Index) für die globale Suche (E4 & E8)
const pokemonLexikon = {
    "bisasam": 1, "glumanda": 4, "schiggy": 7, "pikachu": 25,
    "garados": 130, "evoli": 133, "mewtu": 150, "nachtara": 197, "lucario": 448,
    "feelinara": 700, "akkup": 736, "donarion": 737, "bauz": 722,
    "felori": 906, "felios": 907, "maskagato": 908, "krokel": 909, "kwaks": 912
};

const typUebersetzung = {
    grass: 'Pflanze', fire: 'Feuer', water: 'Wasser', electric: 'Elektro',
    poison: 'Gift', bug: 'Käfer', flying: 'Flug', normal: 'Normal',
    ground: 'Boden', rock: 'Gestein', fighting: 'Kampf', psychic: 'Psycho',
    ghost: 'Geist', ice: 'Eis', dragon: 'Drache', fairy: 'Fee',
    dark: 'Unlicht', steel: 'Stahl'
};

// Beispiel-Gegner pro Typ für direktes Aufploppen im Modal (verhindert unnötige API-Anfragen)
const typBeispielGegner = {
    normal:   { api: 'snorlax',   de: 'Relaxo',   en: 'Snorlax' },
    fire:     { api: 'charizard', de: 'Glurak',   en: 'Charizard' },
    water:    { api: 'blastoise', de: 'Turtok',   en: 'Blastoise' },
    grass:    { api: 'venusaur',  de: 'Bisaflor', en: 'Venusaur' },
    electric: { api: 'pikachu',   de: 'Pikachu',  en: 'Pikachu' },
    ice:      { api: 'lapras',    de: 'Lapras',   en: 'Lapras' },
    fighting: { api: 'machamp',   de: 'Machomei', en: 'Machamp' },
    poison:   { api: 'arbok',     de: 'Arbok',    en: 'Arbok' },
    ground:   { api: 'dugtrio',   de: 'Digdri',   en: 'Dugtrio' },
    flying:   { api: 'pidgeot',   de: 'Tauboss',  en: 'Pidgeot' },
    psychic:  { api: 'mewtwo',    de: 'Mewtu',    en: 'Mewtwo' },
    bug:      { api: 'butterfree',de: 'Smettbo',  en: 'Butterfree' },
    rock:     { api: 'onix',      de: 'Onix',     en: 'Onix' },
    ghost:    { api: 'gengar',    de: 'Gengar',   en: 'Gengar' },
    dragon:   { api: 'dragonite', de: 'Dragoran', en: 'Dragonite' },
    dark:     { api: 'umbreon',   de: 'Nachtara', en: 'Umbreon' },
    steel:    { api: 'steelix',   de: 'Stahlos',  en: 'Steelix' },
    fairy:    { api: 'sylveon',   de: 'Feelinara',en: 'Sylveon' }
};

// Erklärungen & Kampf-Nutzen für alle 18 Pokémon-Typen (DE & EN)
const typErklaerungen = {
    normal:   { de: 'Vielseitige Allrounder ohne komplexe Elementarkräfte. Nutzen: Kaum Schwächen (nur Kampf) und oft extrem flexibel bei den Attacken.', en: 'Versatile all-rounders without elemental powers. Utility: Only weak to Fighting and often learn a wide variety of moves.' },
    fire:     { de: 'Meister der Hitze und Flammen. Nutzen: Sehr offensivstark, können Gegner verbrennen und deren physischen Angriff halbieren.', en: 'Masters of heat and flames. Utility: High offense, can burn opponents to halve their physical attack.' },
    water:    { de: 'Anpassungsfähige Meeres- und Flussbewohner. Nutzen: Sehr ausgewogene Defensive und offensiv stark gegen Feuer, Boden und Gestein.', en: 'Adaptable aquatic Pokémon. Utility: Balanced defense and strong offense against Fire, Ground, and Rock.' },
    grass:    { de: 'Nutzen Sonnenlicht, Ranken und Sporen. Nutzen: Stark bei Status-Effekten (Schlaf, Egelsamen) und Selbstheilung im Kampf.', en: 'Use sunlight, vines, and spores. Utility: Great at status effects (Sleep, Leech Seed) and healing.' },
    electric: { de: 'Blitzschnelle Energie-Nutzer. Nutzen: Sehr hohe Initiative, können Gegner paralysieren und haben nur eine einzige Schwäche (Boden).', en: 'Lightning-fast energy users. Utility: High speed, can paralyze foes, and only have one weakness (Ground).' },
    ice:      { de: 'Beherrschen Frost und Kälte. Nutzen: Extrem effektiv gegen mächtige Drachen-, Flug- und Boden-Pokémon, defensiv aber zerbrechlich.', en: 'Command frost and cold. Utility: Super effective against Dragon, Flying, and Ground, though defensively fragile.' },
    fighting: { de: 'Disziplinierte Nahkämpfer. Nutzen: Hoher physischer Schaden und das beste Mittel gegen defensive Normal-, Stahl- und Gestein-Pokémon.', en: 'Disciplined martial artists. Utility: High physical damage and the best counter to Normal, Steel, and Rock.' },
    poison:   { de: 'Arbeiten mit Toxinen und Säuren. Nutzen: Können Gegner vergiften, um über mehrere Runden stetig Schaden zu verursachen; stark gegen Fee.', en: 'Use toxins and acids. Utility: Inflict poison for steady damage over time; strong counter to Fairy.' },
    ground:   { de: 'Beherrschen Erde und Beben. Nutzen: Komplett immun gegen Elektro-Attacken und offensiv gegen fünf verschiedene Typen sehr effektiv.', en: 'Control earth and quakes. Utility: Completely immune to Electric moves and super effective against five types.' },
    flying:   { de: 'Beherrschen den Luftraum. Nutzen: Immun gegen Boden-Attacken und meist sehr schnell, um zuerst anzugreifen.', en: 'Rule the skies. Utility: Immune to Ground moves and usually very fast to strike first.' },
    psychic:  { de: 'Nutzen Telekinese und Geisteskraft. Nutzen: Extrem stark bei Spezial-Angriffen und ideal, um Kampf- und Gift-Pokémon schnell auszuschalten.', en: 'Use telekinesis and mind power. Utility: High special attack, ideal for countering Fighting and Poison.' },
    bug:      { de: 'Insektenähnliche Pokémon, die sich oft früh entwickeln. Nutzen: Stark gegen Psycho- und Unlicht-Pokémon sowie nützlich für schnelle Wechsel-Attacken.', en: 'Insect-like Pokémon that often evolve early. Utility: Effective against Psychic and Dark, great for pivoting.' },
    rock:     { de: 'Gepanzert wie Felsen. Nutzen: Sehr hohe physische Verteidigung und stark gegen Feuer- sowie Flug-Pokémon.', en: 'Armored like stone. Utility: High physical defense and strong against Fire and Flying Pokémon.' },
    ghost:    { de: 'Geisterhafte Wesen aus der Schattenwelt. Nutzen: Komplett immun gegen Normal- und Kampf-Attacken – perfekt für taktische Einwechslungen.', en: 'Spectral beings. Utility: Completely immune to Normal and Fighting moves—great for tactical switches.' },
    dragon:   { de: 'Legendäre und besonders mächtige Wesen. Nutzen: Hohe Basiswerte und resistent gegen alle vier Grundelemente (Feuer, Wasser, Pflanze, Elektro).', en: 'Mythical and powerful creatures. Utility: High base stats and resistant to Fire, Water, Grass, and Electric.' },
    dark:     { de: 'Listige Kämpfer der Nacht. Nutzen: Komplett immun gegen Psycho-Attacken und stark darin, gegnerische Taktiken zu stören.', en: 'Cunning fighters of the night. Utility: Immune to Psychic moves and great at disrupting enemy strategies.' },
    steel:    { de: 'Metallisch gepanzert. Nutzen: Der beste Defensiv-Typ im Spiel – resistent gegen die meisten anderen Typen und immun gegen Gift.', en: 'Armored in metal. Utility: The best defensive type in the game, resisting most types and immune to Poison.' },
    fairy:    { de: 'Magische Wesen mit mystischer Kraft. Nutzen: Komplett immun gegen Drachen-Attacken und das effektivste Mittel gegen Drachen und Unlicht.', en: 'Magical beings. Utility: Completely immune to Dragon moves and the best counter to Dragon and Dark.' }
};

const trainerTeams = {
    ash:        [25, 1, 6, 7, 18, 143],
    teamRocket: [52, 24, 110, 71, 202],
    misty:      [120, 121, 54, 175, 130],
    rocko:      [95, 74, 37, 41, 205],
    gary:       [9, 133, 59, 197, 34],
    cynthia:    [445, 448, 350, 442, 468, 407],
    siegfried:  [149, 130, 142, 6, 230],
    red:        [25, 3, 6, 9, 131, 143],
    maike:      [257, 267, 300, 471, 446],
    lucia:      [393, 427, 417, 473, 155],
    sabrina:    [65, 122, 196, 94],
    giovanni:   [53, 34, 31, 112, 150]
};

// Steckbriefe, Regionen, Spezialtypen & Zitate der Trainer (DE & EN)
const trainerInfos = {
    ash: {
        name: 'Ash Ketchum',
        region: { de: 'Kanto (Alabastia)', en: 'Kanto (Pallet Town)' },
        spezial: { de: 'Allrounder & Teamgeist', en: 'All-Rounder & Teamwork' },
        typKey: null,
        zitat: { de: '„Ich will der Allerbeste sein, wie keiner vor mir war!“', en: '“I wanna be the very best, like no one ever was!”' }
    },
    teamRocket: {
        name: 'Team Rocket (Jessie & James)',
        region: { de: 'Kanto', en: 'Kanto' },
        spezial: { de: 'Gift & List', en: 'Poison & Trickery' },
        typKey: 'poison',
        zitat: { de: '„Jetzt gibt es Ärger – und es kommt noch härter!“', en: '“Prepare for trouble – and make it double!”' }
    },
    misty: {
        name: 'Misty',
        region: { de: 'Kanto (Azuria City)', en: 'Kanto (Cerulean City)' },
        spezial: { de: 'Wasser', en: 'Water' },
        typKey: 'water',
        zitat: { de: '„Wasser-Pokémon sind die stärksten und schönsten der Welt!“', en: '“Water-type Pokémon are the strongest and most beautiful in the world!”' }
    },
    rocko: {
        name: 'Rocko / Brock',
        region: { de: 'Kanto (Marmoria City)', en: 'Kanto (Pewter City)' },
        spezial: { de: 'Gestein', en: 'Rock' },
        typKey: 'rock',
        zitat: { de: '„Meine Verteidigung ist so hart wie ein Fels!“', en: '“My rock-hard willpower is evident even in my Pokémon!”' }
    },
    gary: {
        name: 'Gary Eich / Oak',
        region: { de: 'Kanto (Alabastia)', en: 'Kanto (Pallet Town)' },
        spezial: { de: 'Strategie & Forschung', en: 'Strategy & Research' },
        typKey: null,
        zitat: { de: '„Bis später, Schnarchnase!“', en: '“Smell ya later!”' }
    },
    cynthia: {
        name: 'Cynthia',
        region: { de: 'Sinnoh (Champ)', en: 'Sinnoh (Champion)' },
        spezial: { de: 'Allrounder & Drache', en: 'All-Rounder & Dragon' },
        typKey: 'dragon',
        zitat: { de: '„Wenn zwei Trainer aufeinandertreffen, entsteht eine neue Geschichte.“', en: '“When two trainers meet, a new story begins.”' }
    },
    siegfried: {
        name: 'Siegfried / Lance',
        region: { de: 'Kanto / Johto (Champ)', en: 'Kanto / Johto (Champion)' },
        spezial: { de: 'Drache', en: 'Dragon' },
        typKey: 'dragon',
        zitat: { de: '„Drachen sind mythische Pokémon – schwer zu fangen und unbezwingbar!“', en: '“Dragons are mythical Pokémon—hard to catch and impossible to beat!”' }
    },
    red: {
        name: 'Rot / Red',
        region: { de: 'Kanto (Silberberg)', en: 'Kanto (Mt. Silver)' },
        spezial: { de: 'Legende / Allrounder', en: 'Legend / All-Rounder' },
        typKey: null,
        zitat: { de: '„... ... ...!“', en: '“... ... ...!”' }
    },
    maike: {
        name: 'Maike / May',
        region: { de: 'Hoenn (Blütenburg City)', en: 'Hoenn (Petalburg City)' },
        spezial: { de: 'Pokémon-Wettbewerbe', en: 'Pokémon Contests' },
        typKey: null,
        zitat: { de: '„Bühne frei für unsere beste Performance!“', en: '“Take the stage for our best performance!”' }
    },
    lucia: {
        name: 'Lucia / Dawn',
        region: { de: 'Sinnoh (Zweiblattdorf)', en: 'Sinnoh (Twinleaf Town)' },
        spezial: { de: 'Pokémon-Wettbewerbe', en: 'Pokémon Contests' },
        typKey: null,
        zitat: { de: '„Kein Grund zur Sorge – das klappt schon!“', en: '“No need to worry!”' }
    },
    sabrina: {
        name: 'Sabrina',
        region: { de: 'Kanto (Saffronia City)', en: 'Kanto (Saffron City)' },
        spezial: { de: 'Psycho', en: 'Psychic' },
        typKey: 'psychic',
        zitat: { de: '„Ich habe deinen Sieg oder deine Niederlage bereits vorhergesehen.“', en: '“I have foreseen your victory or defeat.”' }
    },
    giovanni: {
        name: 'Giovanni',
        region: { de: 'Kanto (Vertania City)', en: 'Kanto (Viridian City)' },
        spezial: { de: 'Boden (Team Rocket Boss)', en: 'Ground (Team Rocket Boss)' },
        typKey: 'ground',
        zitat: { de: '„Die Stärke der Pokémon existiert nur für Team Rocket!“', en: '“Pokémon exist solely for the glory of Team Rocket!”' }
    }
};

// --- Generation laden ---
async function ladeGeneration(genId) {
    statusMeldung.innerText = aktuelleSprache === 'de' ? 'Lade Daten... Das kann kurz dauern.' : 'Loading data... Please wait.';
    kartenRaster.innerHTML = '';
    let limit = 0; let offset = 0;

    switch (genId) {  
        case '1': limit = 151; offset = 0; break;
        case '2': limit = 100; offset = 151; break;
        case '3': limit = 135; offset = 251; break;
        case '4': limit = 107; offset = 386; break;
        case '5': limit = 156; offset = 493; break;
        case '6': limit = 72; offset = 649; break;
        case '7': limit = 88; offset = 721; break;
        case '8': limit = 96; offset = 809; break;
        case '9': limit = 120; offset = 905; break;
    }

    try {
        const antwort = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        if (!antwort.ok) {
            throw new Error(`HTTP-Fehler: ${antwort.status}`);
        }

        const daten = await antwort.json();
        if (!daten || !Array.isArray(daten.results)) {
            throw new Error('Ungültige JSON-Daten.');
        }
        const detailAnfragen = daten.results.map(async pokemon => {
            const basisAntwort = await fetch(pokemon.url);
            const basisDaten = await basisAntwort.json();

            const artAntwort = await fetch(basisDaten.species.url);
            const artDaten = await artAntwort.json();

            const deName = artDaten.names.find(n => n.language.name === 'de');

            basisDaten.nameEN = basisDaten.name;
            basisDaten.nameDE = deName ? deName.name : basisDaten.name;
            basisDaten.evolutionUrl = artDaten.evolution_chain.url;

            return basisDaten;
        });

        aktuellePokemonDaten = await Promise.all(detailAnfragen);
        statusMeldung.innerText = '';
        datenFilternUndSortieren();
    } catch (fehler) {
        statusMeldung.innerText = aktuelleSprache === 'de' ? 'Fehler beim Laden.' : 'Error loading data.';
    }
}

// --- Karten anzeigen ---
function zeigePokemon(pokemonListe) {
    kartenRaster.innerHTML = '';
    if (pokemonListe.length === 0) {
        return;
    }

    const textEntwicklungen = aktuelleSprache === 'de' ? 'Entwicklungen' : 'Evolutions';
    const textZurueck = aktuelleSprache === 'de' ? 'Zurück' : 'Back';

    pokemonListe.forEach(pokemon => {
        const spalte = document.createElement('div');
        spalte.className = 'col';

        const bildUrl = pokemon.sprites.other['official-artwork'].front_default;
        const anzeigeName = aktuelleSprache === 'de'
            ? (pokemon.nameDE || pokemon.deName || pokemon.name)
            : (pokemon.nameEN || pokemon.name);

        let typHTML = '';
        pokemon.types.forEach(typInfo => {
            const eng = typInfo.type.name;
            const anzeigeTyp = aktuelleSprache === 'de' ? (typUebersetzung[eng] || eng) : eng;
            typHTML += `
                <button type="button" class="typ-badge typ-badge-btn typ-${eng} text-capitalize" 
                        onclick="event.stopPropagation(); oeffneTypKarte('${eng}')" 
                        title="${aktuelleSprache === 'de' ? 'Klicken für Typ-Erklärung' : 'Click for type info'}">
                    ${anzeigeTyp}
                </button>`;
        });

        spalte.innerHTML = `
            <div class="pokemon-karte text-center" id="karte-${pokemon.id}" onclick="dreheKarte(${pokemon.id}, '${pokemon.evolutionUrl}')">
                <div class="karte-innen">
                    <!-- VORDERSEITE -->
                    <div class="karte-vorne d-flex flex-column align-items-center justify-content-center">
                        <img src="${bildUrl}" class="pokemon-bild img-fluid" alt="${anzeigeName}">
                        <p class="text-muted small mb-1 mt-2">#${String(pokemon.id).padStart(3, '0')}</p>
                        <h5 class="fw-bold text-capitalize">${anzeigeName}</h5>
                        <div>${typHTML}</div>
                    </div>
                    
                    <!-- RÜCKSEITE -->
                    <div class="karte-hinten d-flex flex-column p-3">
                        <h6 class="fw-bold text-danger mb-2">${textEntwicklungen}</h6>
                        <img src="${bildUrl}" alt="${anzeigeName}" class="pulsier-figur mx-auto mb-2">
                        <div id="entwicklungen-${pokemon.id}" class="d-flex flex-column gap-2 w-100 overflow-auto mb-2" style="max-height: 150px;">
                            <span class="spinner-border spinner-border-sm mx-auto text-danger" role="status"></span>
                        </div>
                        
                        <button class="btn btn-secondary btn-sm w-100 mt-auto" 
                                onclick="event.stopPropagation(); document.getElementById('karte-${pokemon.id}').classList.remove('gedreht');">
                            ${textZurueck} ↩
                        </button>
                    </div>
                </div>
            </div>
        `;
        kartenRaster.appendChild(spalte);
    });
}

// --- E8: Karte drehen und Entwicklungen übersetzt laden ---
async function dreheKarte(pokemonId, evolutionUrl) {
    const karte = document.getElementById(`karte-${pokemonId}`);
    const container = document.getElementById(`entwicklungen-${pokemonId}`);

    karte.classList.toggle('gedreht');
    if (container.dataset.geladen === "true") return;

    try {
        if (!evolutionUrl || evolutionUrl === 'undefined' || evolutionUrl === 'null') {
            const speciesAntwort = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            const speciesDaten = await speciesAntwort.json();
            evolutionUrl = speciesDaten.evolution_chain.url;
        }

        const antwort = await fetch(evolutionUrl);
        const daten = await antwort.json();

        let alleEntwicklungen = [];

        async function sucheEntwicklungen(knoten) {
            const speciesAntwort = await fetch(knoten.species.url);
            const speciesDaten = await speciesAntwort.json();
            const deObj = speciesDaten.names.find(n => n.language.name === 'de');

            alleEntwicklungen.push({
                enName: knoten.species.name,
                deName: deObj ? deObj.name : knoten.species.name
            });

            for (let kind of knoten.evolves_to) {
                await sucheEntwicklungen(kind);
            }
        }
        await sucheEntwicklungen(daten.chain);

        container.innerHTML = '';
        alleEntwicklungen.forEach(entwicklung => {
            const anzeigeName = aktuelleSprache === 'de' ? entwicklung.deName : entwicklung.enName;

            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-danger btn-sm text-capitalize w-100';
            btn.innerText = anzeigeName;
            btn.onclick = (event) => {
                event.stopPropagation();
                ladeUndOeffneModal(entwicklung.enName);
            };
            container.appendChild(btn);
        });

        container.dataset.geladen = "true";
    } catch (fehler) {
        console.error('Fehler in dreheKarte:', fehler);
        container.innerHTML = '<span class="text-danger small">Error</span>';
    }
}

// --- E6: Modal laden (Einzel- & Vergleichsansicht) ---
let aktuellesPokemonLinks = null;
let aktuellesPokemonRechts = null;

async function ladeUndOeffneModal(suchNameAPI) {
    schliesseRechts();
    aktuellesPokemonLinks = suchNameAPI;

    const modalElement = document.getElementById('pokemonModal');
    const bsModal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    bsModal.show();

    await ladePokemonInPanel(suchNameAPI, 'links');
}

async function oeffneGegner(gegnerApiName, quellSeite) {
    const dialog = document.getElementById('pokemonModalDialog');
    const linksPanel = document.getElementById('modalLinks');
    const rechtsPanel = document.getElementById('modalRechts');

    dialog.classList.add('modal-xl');
    linksPanel.className = 'col-12 col-lg-6';
    rechtsPanel.classList.remove('d-none');
    document.getElementById('modalHauptTitel').innerText = aktuelleSprache === 'de' ? 'Pokémon Vergleich' : 'Pokémon Comparison';

    if (quellSeite === 'links') {
        aktuellesPokemonRechts = gegnerApiName;
        await ladePokemonInPanel(gegnerApiName, 'rechts');
    } else if (quellSeite === 'rechts') {
        const altesRechts = aktuellesPokemonRechts;
        aktuellesPokemonLinks = altesRechts;
        aktuellesPokemonRechts = gegnerApiName;

        await Promise.all([
            ladePokemonInPanel(altesRechts, 'links'),
            ladePokemonInPanel(gegnerApiName, 'rechts')
        ]);
    }
    document.querySelector('#pokemonModal .modal-body').scrollTo({ top: 0, behavior: 'smooth' });
}

function schliesseRechts() {
    aktuellesPokemonRechts = null;
    document.getElementById('pokemonModalDialog').classList.remove('modal-xl');
    document.getElementById('modalLinks').className = 'col-12';
    const rechtsPanel = document.getElementById('modalRechts');
    rechtsPanel.classList.add('d-none');
    rechtsPanel.innerHTML = '';
    document.getElementById('modalHauptTitel').innerText = 'Pokémon Details';
}

async function ladePokemonInPanel(suchNameAPI, seite) {
    const container = document.getElementById(seite === 'links' ? 'modalLinks' : 'modalRechts');
    container.innerHTML = '<div class="p-5 text-center"><span class="spinner-border text-danger" role="status"></span></div>';

    try {
        const antwort = await fetch(`https://pokeapi.co/api/v2/pokemon/${suchNameAPI}`);
        const pokemon = await antwort.json();

        const speciesAntwort = await fetch(pokemon.species.url);
        const speciesDaten = await speciesAntwort.json();

        const deObj = speciesDaten.names.find(n => n.language.name === 'de');
        const anzeigeName = aktuelleSprache === 'de' && deObj ? deObj.name : pokemon.name;
        const bildUrl = pokemon.sprites.other['official-artwork'].front_default;

        let infoObj = speciesDaten.flavor_text_entries.find(entry => entry.language.name === aktuelleSprache);
        let fallbackGenutzt = false;
        if (!infoObj && aktuelleSprache === 'de') {
            infoObj = speciesDaten.flavor_text_entries.find(entry => entry.language.name === 'en');
            fallbackGenutzt = true;
        }
        let infoText = infoObj
            ? infoObj.flavor_text.replace(/[\n\f\r]/g, ' ')
            : (aktuelleSprache === 'de' ? 'Keine Beschreibung verfügbar.' : 'No description available.');
        if (fallbackGenutzt) {
            infoText += ' (Beschreibung in der API aktuell nur auf Englisch verfügbar)';
        }

        // Geschlecht inkl. erklärendem Satz berechnen
        let geschlechtHTML = '';
        let geschlechtSatz = '';
        const rate = speciesDaten.gender_rate;

        if (rate === -1) {
            geschlechtHTML = `<span class="badge bg-secondary">${aktuelleSprache === 'de' ? 'Geschlechtslos' : 'Genderless'}</span>`;
            geschlechtSatz = aktuelleSprache === 'de'
                ? `${anzeigeName} ist geschlechtslos.`
                : `${anzeigeName} is genderless.`;
        } else {
            const weiblichProzent = (rate / 8) * 100;
            const maennlichProzent = 100 - weiblichProzent;

            if (maennlichProzent > 0) {
                geschlechtHTML += `<span class="badge bg-primary me-1" aria-label="Männlich">♂ ${maennlichProzent}%</span>`;
            }
            if (weiblichProzent > 0) {
                geschlechtHTML += `<span class="badge bg-danger" aria-label="Weiblich">♀ ${weiblichProzent}%</span>`;
            }

            if (maennlichProzent === 100) {
                geschlechtSatz = aktuelleSprache === 'de'
                    ? `100 % der Exemplare von ${anzeigeName} sind männlich.`
                    : `100% of ${anzeigeName} are male.`;
            } else if (weiblichProzent === 100) {
                geschlechtSatz = aktuelleSprache === 'de'
                    ? `100 % der Exemplare von ${anzeigeName} sind weiblich.`
                    : `100% of ${anzeigeName} are female.`;
            } else {
                geschlechtSatz = aktuelleSprache === 'de'
                    ? `Bei ${anzeigeName} sind ${maennlichProzent} % der Exemplare männlich und ${weiblichProzent} % weiblich.`
                    : `For ${anzeigeName}, ${maennlichProzent}% are male and ${weiblichProzent}% are female.`;
            }
        }
        geschlechtHTML += `<div class="small text-muted mt-1">${geschlechtSatz}</div>`;

        // Fähigkeiten
        let faehigkeitenHTML = '<ul class="list-group list-group-flush">';
        for (let f of pokemon.abilities) {
            const abilityAntwort = await fetch(f.ability.url);
            const abilityDaten = await abilityAntwort.json();
            const langObj = abilityDaten.names.find(n => n.language.name === aktuelleSprache);
            const anzeigeFaehigkeit = langObj ? langObj.name : f.ability.name.replace('-', ' ');
            const descObj = abilityDaten.flavor_text_entries.find(entry => entry.language.name === aktuelleSprache);
            const anzeigeDesc = descObj ? descObj.flavor_text.replace(/[\n\f\r]/g, ' ') : '';
            const versteckt = f.is_hidden ? (aktuelleSprache === 'de' ? ' <b class="text-danger">(Versteckt)</b>' : ' <b class="text-danger">(Hidden)</b>') : '';

            faehigkeitenHTML += `
                <li class="list-group-item text-start">
                    <strong class="text-capitalize">${anzeigeFaehigkeit}${versteckt}</strong><br>
                    <small class="text-muted">${anzeigeDesc}</small>
                </li>`;
        }
        faehigkeitenHTML += '</ul>';

        // Attacken (Auswahl von 5)
        let attackenHTML = '<ul class="list-group list-group-flush">';
        const limitierteAttacken = pokemon.moves.slice(0, 5);
        if (limitierteAttacken.length === 0) {
            attackenHTML += `<li class="list-group-item text-muted">${aktuelleSprache === 'de' ? 'Keine Attacken gefunden.' : 'No moves found.'}</li>`;
        } else {
            for (let m of limitierteAttacken) {
                const moveAntwort = await fetch(m.move.url);
                const moveDaten = await moveAntwort.json();
                const langObjMove = moveDaten.names.find(n => n.language.name === aktuelleSprache);
                const anzeigeMoveName = langObjMove ? langObjMove.name : m.move.name.replace('-', ' ');
                const power = moveDaten.power ? moveDaten.power : '-';
                const accuracy = moveDaten.accuracy ? moveDaten.accuracy : '-';
                const engMoveTyp = moveDaten.type.name;
                const deMoveTyp = aktuelleSprache === 'de' ? (typUebersetzung[engMoveTyp] || engMoveTyp) : engMoveTyp;

                attackenHTML += `
                    <li class="list-group-item text-start">
                        <strong class="text-capitalize">${anzeigeMoveName}</strong>
                        <span class="badge bg-secondary float-end typ-${engMoveTyp}">${deMoveTyp}</span><br>
                        <small class="text-muted">
                            ${aktuelleSprache === 'de' ? 'Stärke' : 'Power'}: ${power} |
                            ${aktuelleSprache === 'de' ? 'Genauigkeit' : 'Accuracy'}: ${accuracy}
                        </small>
                    </li>`;
            }
        }
        attackenHTML += '</ul>';

        // Stärken & Schwächen
        const schwaechenSet = new Set();
        const resistenzenSet = new Set();
        const staerkenSet = new Set();
        for (let t of pokemon.types) {
            const typAntwort = await fetch(t.type.url);
            const typDaten = await typAntwort.json();
            typDaten.damage_relations.double_damage_from.forEach(x => schwaechenSet.add(x.name));
            typDaten.damage_relations.half_damage_from.forEach(x => resistenzenSet.add(x.name));
            typDaten.damage_relations.no_damage_from.forEach(x => resistenzenSet.add(x.name));
            typDaten.damage_relations.double_damage_to.forEach(x => staerkenSet.add(x.name));
        }
        resistenzenSet.forEach(res => schwaechenSet.delete(res));

        const baueTypListe = (typSet) => {
            if (typSet.size === 0) return `<p class="text-muted small mb-2">${aktuelleSprache === 'de' ? 'Keine besonderen.' : 'None.'}</p>`;
            let html = '<div class="d-flex flex-column gap-2 mb-3">';
            typSet.forEach(engTyp => {
                const anzeigeTyp = aktuelleSprache === 'de' ? (typUebersetzung[engTyp] || engTyp) : engTyp;
                const gegner = typBeispielGegner[engTyp];
                const gegnerName = gegner ? (aktuelleSprache === 'de' ? gegner.de : gegner.en) : '';

                html += `
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-1">
                        <span class="typ-badge typ-${engTyp} text-capitalize">${anzeigeTyp}</span>
                        ${gegner ? `
                            <button class="btn btn-outline-secondary btn-sm py-0 px-2" onclick="oeffneGegner('${gegner.api}', '${seite}')">
                                ${aktuelleSprache === 'de' ? 'z.B.' : 'e.g.'} ${gegnerName} ↗
                            </button>` : ''}
                    </div>`;
            });
            html += '</div>';
            return html;
        };

        const staerkenHTML = `
            <h6 class="fw-bold text-danger small mb-2">${aktuelleSprache === 'de' ? 'Schwach gegen (2× Schaden):' : 'Weak against (2× damage):'}</h6>
            ${baueTypListe(schwaechenSet)}
            <h6 class="fw-bold text-success small mb-2">${aktuelleSprache === 'de' ? 'Stark gegen (2× Schaden):' : 'Strong against (2× damage):'}</h6>
            ${baueTypListe(staerkenSet)}
        `;

        const schliessenBtn = seite === 'rechts'
            ? `<button type="button" class="btn-close position-absolute top-0 end-0" aria-label="Vergleich schließen" onclick="schliesseRechts()"></button>`
            : '';

        container.innerHTML = `
            <div class="text-center position-relative">
                ${schliessenBtn}
                <h4 class="fw-bold text-capitalize mb-2">${anzeigeName}</h4>
                <img src="${bildUrl}" alt="${anzeigeName}" class="img-fluid mb-2" style="max-height: 180px;">
                <div class="mb-2">${geschlechtHTML}</div>
                <p class="text-muted small fst-italic mb-3">${infoText}</p>

                <div class="accordion text-start" id="accordion-${seite}">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne-${seite}">
                                ${aktuelleSprache === 'de' ? 'Fähigkeiten & Infos' : 'Abilities & Info'}
                            </button>
                        </h2>
                        <div id="collapseOne-${seite}" class="accordion-collapse collapse" data-bs-parent="#accordion-${seite}">
                            <div class="accordion-body p-0">${faehigkeitenHTML}</div>
                        </div>
                    </div>

                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo-${seite}">
                                ${aktuelleSprache === 'de' ? 'Attacken (Auswahl)' : 'Moves (Selection)'}
                            </button>
                        </h2>
                        <div id="collapseTwo-${seite}" class="accordion-collapse collapse" data-bs-parent="#accordion-${seite}">
                            <div class="accordion-body p-0">${attackenHTML}</div>
                        </div>
                    </div>

                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree-${seite}">
                                ${aktuelleSprache === 'de' ? 'Stärken & Schwächen' : 'Strengths & Weaknesses'}
                            </button>
                        </h2>
                        <div id="collapseThree-${seite}" class="accordion-collapse collapse" data-bs-parent="#accordion-${seite}">
                            <div class="accordion-body">${staerkenHTML}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (fehler) {
        container.innerHTML = `<p class="text-danger text-center">${aktuelleSprache === 'de' ? 'Fehler beim Laden.' : 'Error loading.'}</p>`;
    }
}

// --- Filter- & Sortier-Logik ---
function datenFilternUndSortieren() {
    const suchbegriff = suchfeld.value.trim().toLowerCase();
    const gewaehlterTyp = typFilter.value;

    let gefiltert = aktuellePokemonDaten;

    if (suchbegriff === '') {
        if (gewaehlterTyp !== 'alle') {
            gefiltert = gefiltert.filter(p => p.types.some(t => t.type.name === gewaehlterTyp));
        }
    } else {
        gefiltert = gefiltert.filter(p => {
            const suchName = aktuelleSprache === 'de' ? p.nameDE.toLowerCase() : p.nameEN.toLowerCase();
            return suchName.includes(suchbegriff);
        });
    }

    if (alphabetischSortiert) {
        gefiltert.sort((a, b) => {
            const nameA = aktuelleSprache === 'de' ? a.nameDE : a.nameEN;
            const nameB = aktuelleSprache === 'de' ? b.nameDE : b.nameEN;
            return nameA.localeCompare(nameB);
        });
    } else {
        gefiltert.sort((a, b) => a.id - b.id);
    }
    zeigePokemon(gefiltert);
}

// --- Globale Suche ---
let suchTimer;

suchfeld.addEventListener('input', () => {
    clearTimeout(suchTimer);

    suchTimer = setTimeout(async () => {
        const suchbegriff = suchfeld.value.trim().toLowerCase();

        if (suchbegriff === '') {
            datenFilternUndSortieren();
            return;
        }

        let lokalGefunden = aktuellePokemonDaten.filter(p => {
            const suchName = aktuelleSprache === 'de' ? p.nameDE.toLowerCase() : p.nameEN.toLowerCase();
            return suchName.includes(suchbegriff);
        });

        if (lokalGefunden.length > 0) {
            zeigePokemon(lokalGefunden);
            return;
        }

        const lexiconTrefferNamen = Object.keys(pokemonLexikon).filter(name => name.includes(suchbegriff));

        if (lexiconTrefferNamen.length > 0) {
            statusMeldung.innerText = aktuelleSprache === 'de' ? 'Lade Treffer...' : 'Loading matches...';
            kartenRaster.innerHTML = '';

            try {
                const anfragen = lexiconTrefferNamen.map(async (trefferName) => {
                    const pokemonId = pokemonLexikon[trefferName];
                    const basisAntwort = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
                    const basisDaten = await basisAntwort.json();

                    const artAntwort = await fetch(basisDaten.species.url);
                    const artDaten = await artAntwort.json();

                    const deName = artDaten.names.find(n => n.language.name === 'de');
                    basisDaten.nameEN = basisDaten.name;
                    basisDaten.nameDE = deName ? deName.name : basisDaten.name;
                    basisDaten.evolutionUrl = artDaten.evolution_chain.url;

                    return basisDaten;
                });

                const geladeneLexikonPokemon = await Promise.all(anfragen);
                statusMeldung.innerText = '';
                zeigePokemon(geladeneLexikonPokemon);
            } catch (fehler) {
                statusMeldung.innerText = aktuelleSprache === 'de' ? 'Fehler beim Laden.' : 'Error loading.';
            }
        } else {
            kartenRaster.innerHTML = '';
            statusMeldung.innerText = aktuelleSprache === 'de'
                ? 'Nicht gefunden. (Evtl. noch nicht im Lexikon eingetragen)'
                : 'Not found.';
        }
    }, 500);
});

// --- UI-Übersetzung (DE & EN) ---
function aktualisiereSortierButtonText() {
    if (aktuelleSprache === 'de') {
        sortierButton.innerText = alphabetischSortiert ? 'Sortieren 1-9 ↕' : 'Sortieren A-Z ↕';
    } else {
        sortierButton.innerText = alphabetischSortiert ? 'Sort 1-9 ↕' : 'Sort A-Z ↕';
    }
}

function aktualisiereFilterSprache() {
    // 1. Suchfeld
    suchfeld.placeholder = aktuelleSprache === 'de' ? 'Pokémon suchen...' : 'Search Pokémon...';

    // 2. Typ-Filter ("Alle Typen" + alle 18 Typen)
    if (typFilter) {
        Array.from(typFilter.options).forEach(opt => {
            if (opt.value === 'alle') {
                opt.text = aktuelleSprache === 'de' ? 'Alle Typen' : 'All Types';
            } else {
                const text = aktuelleSprache === 'de'
                    ? (typUebersetzung[opt.value] || opt.value)
                    : opt.value;
                opt.text = text.charAt(0).toUpperCase() + text.slice(1);
            }
        });
    }

    // 3. Generation-Filter (inkl. Einall <-> Unova)
    if (genFilter) {
        const genTexte = {
            '1': { de: 'Generation 1 (Kanto)', en: 'Generation 1 (Kanto)' },
            '2': { de: 'Generation 2 (Johto)', en: 'Generation 2 (Johto)' },
            '3': { de: 'Generation 3 (Hoenn)', en: 'Generation 3 (Hoenn)' },
            '4': { de: 'Generation 4 (Sinnoh)', en: 'Generation 4 (Sinnoh)' },
            '5': { de: 'Generation 5 (Einall)', en: 'Generation 5 (Unova)' },
            '6': { de: 'Generation 6 (Kalos)', en: 'Generation 6 (Kalos)' },
            '7': { de: 'Generation 7 (Alola)', en: 'Generation 7 (Alola)' },
            '8': { de: 'Generation 8 (Galar)', en: 'Generation 8 (Galar)' },
            '9': { de: 'Generation 9 (Paldea)', en: 'Generation 9 (Paldea)' }
        };
        Array.from(genFilter.options).forEach(opt => {
            if (genTexte[opt.value]) {
                opt.text = genTexte[opt.value][aktuelleSprache];
            }
        });
    }

    // 4. Trainer-Filter (Kategorien, Trainernamen & dynamischer Übersicht-Text)
    if (trainerFilter) {
        const trainerOptionTexte = {
            'ash':        { de: 'Ash Ketchum', en: 'Ash Ketchum' },
            'misty':      { de: 'Misty', en: 'Misty' },
            'rocko':      { de: 'Rocko', en: 'Brock' },
            'maike':      { de: 'Maike', en: 'May' },
            'lucia':      { de: 'Lucia', en: 'Dawn' },
            'cynthia':    { de: 'Cynthia (Champ)', en: 'Cynthia (Champion)' },
            'siegfried':  { de: 'Siegfried (Champ)', en: 'Lance (Champion)' },
            'red':        { de: 'Rot', en: 'Red' },
            'sabrina':    { de: 'Sabrina', en: 'Sabrina' },
            'gary':       { de: 'Gary Eich', en: 'Gary Oak' },
            'teamRocket': { de: 'Team Rocket (Jessie & James)', en: 'Team Rocket (Jessie & James)' },
            'giovanni':   { de: 'Giovanni (Team Rocket Boss)', en: 'Giovanni (Team Rocket Boss)' }
        };

        Array.from(trainerFilter.options).forEach(opt => {
            if (trainerOptionTexte[opt.value]) {
                opt.text = trainerOptionTexte[opt.value][aktuelleSprache];
            }
        });

        const gruppenTexte = [
            { de: 'Helden & Begleiter', en: 'Heroes & Companions' },
            { de: 'Champions & Arenaleiter', en: 'Champions & Gym Leaders' },
            { de: 'Rivalen & Schurken', en: 'Rivals & Villains' }
        ];
        trainerFilter.querySelectorAll('optgroup').forEach((gruppe, index) => {
            if (gruppenTexte[index]) {
                gruppe.label = gruppenTexte[index][aktuelleSprache];
            }
        });

        aktualisiereTrainerStandardOption(trainerFilter.value);
        if (trainerFilter.value) {
            aktualisiereTrainerBanner(trainerFilter.value);
        }
    }

    // 5. Sortier-Button
    aktualisiereSortierButtonText();
}

// --- Typ-Karten Modal ---
function formatiereTypText(text) {
    return text
        .replace(' Nutzen:', '<br><strong class="text-danger d-inline-block mt-2">Nutzen:</strong>')
        .replace(' Utility:', '<br><strong class="text-danger d-inline-block mt-2">Utility:</strong>');
}

function oeffneTypKarte(engTyp) {
    const dialog = document.getElementById('typModalDialog');
    dialog.classList.remove('modal-lg');

    const anzeigeTyp = aktuelleSprache === 'de' ? (typUebersetzung[engTyp] || engTyp) : engTyp;
    const rohText = typErklaerungen[engTyp]
        ? (aktuelleSprache === 'de' ? typErklaerungen[engTyp].de : typErklaerungen[engTyp].en)
        : '';

    document.getElementById('typModalTitel').innerText = aktuelleSprache === 'de' ? `Typ: ${anzeigeTyp}` : `Type: ${anzeigeTyp}`;
    document.getElementById('typModalInhalt').innerHTML = `
        <div class="card border-0 text-center">
            <div class="card-body">
                <span class="typ-badge typ-${engTyp} fs-5 px-4 py-2 text-capitalize mb-3 d-inline-block">${anzeigeTyp}</span>
                <p class="card-text text-start mt-2">${formatiereTypText(rohText)}</p>
                <hr>
                <button class="btn btn-outline-danger btn-sm" onclick="oeffneAlleTypKarten()">
                    ${aktuelleSprache === 'de' ? 'Alle 18 Typ-Karten ansehen' : 'View all 18 type cards'}
                </button>
            </div>
        </div>
    `;

    const modalEl = document.getElementById('typModal');
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function oeffneAlleTypKarten() {
    const dialog = document.getElementById('typModalDialog');
    dialog.classList.add('modal-lg');

    document.getElementById('typModalTitel').innerText = aktuelleSprache === 'de' ? 'Alle 18 Pokémon-Typen' : 'All 18 Pokémon Types';

    let kartenHTML = '<div class="row row-cols-1 row-cols-md-2 g-3">';
    Object.keys(typErklaerungen).forEach(engTyp => {
        const anzeigeTyp = aktuelleSprache === 'de' ? (typUebersetzung[engTyp] || engTyp) : engTyp;
        const rohText = aktuelleSprache === 'de' ? typErklaerungen[engTyp].de : typErklaerungen[engTyp].en;

        kartenHTML += `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <span class="typ-badge typ-${engTyp} text-capitalize mb-2 d-inline-block">${anzeigeTyp}</span>
                        <p class="card-text small text-muted mb-0">${formatiereTypText(rohText)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    kartenHTML += '</div>';

    document.getElementById('typModalInhalt').innerHTML = kartenHTML;

    const modalEl = document.getElementById('typModal');
    window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function aktualisiereTrainerStandardOption(trainerKey) {
    if (!trainerFilter) return;
    const defaultOpt = trainerFilter.querySelector('option[value=""]');
    if (!defaultOpt) return;

    trainerFilter.setAttribute(
        'aria-label',
        aktuelleSprache === 'de' ? 'Bekannte Trainer-Teams' : 'Famous Trainer Teams'
    );

    if (trainerKey) {
        defaultOpt.text = aktuelleSprache === 'de'
            ? 'Zurück zur Übersicht'
            : 'Back to Overview';
    } else {
        defaultOpt.text = aktuelleSprache === 'de'
            ? 'Bekannte Trainer-Teams'
            : 'Famous Trainer Teams';
    }
}

function aktualisiereTrainerBanner(trainerKey) {
    aktualisiereTrainerStandardOption(trainerKey);

    const banner = document.getElementById('trainer-banner');
    if (!banner) return;

    if (!trainerKey || !trainerInfos[trainerKey]) {
        banner.classList.add('d-none');
        banner.innerHTML = '';
        return;
    }

    const info = trainerInfos[trainerKey];
    const regionText = aktuelleSprache === 'de' ? info.region.de : info.region.en;
    const spezialText = aktuelleSprache === 'de' ? info.spezial.de : info.spezial.en;
    const zitatText = aktuelleSprache === 'de' ? info.zitat.de : info.zitat.en;
    const labelSpezial = aktuelleSprache === 'de' ? 'Fokus' : 'Specialty';
    const textSchliessen = aktuelleSprache === 'de' ? 'Filter aufheben' : 'Clear filter';

    const spezialBadge = info.typKey
        ? `<span class="typ-badge typ-${info.typKey}">${spezialText}</span>`
        : `<span class="badge bg-dark">${spezialText}</span>`;

    banner.innerHTML = `
        <div class="card border-danger shadow-sm">
            <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div>
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <h5 class="fw-bold text-danger mb-0">${info.name}</h5>
                        <span class="badge bg-secondary">Region: ${regionText}</span>
                        <span class="small text-muted">${labelSpezial}:</span> ${spezialBadge}
                    </div>
                    <p class="mb-0 fst-italic text-muted small">${zitatText}</p>
                </div>
                <button type="button" class="btn btn-outline-secondary btn-sm text-nowrap" 
                        onclick="document.getElementById('trainer-filter').value=''; ladeTrainerTeam('');">
                    ✕ ${textSchliessen}
                </button>
            </div>
        </div>
    `;
    banner.classList.remove('d-none');
}

async function ladeTrainerTeam(trainerKey) {
    aktualisiereTrainerBanner(trainerKey);

    if (!trainerKey) {
        ladeGeneration(genFilter ? genFilter.value : '1');
        return;
    }

    kartenRaster.innerHTML = '<div class="col-12 text-center p-5"><span class="spinner-border text-danger" role="status"></span></div>';

    try {
        const ids = trainerTeams[trainerKey] || [];

        const teamListe = await Promise.all(ids.map(async (id) => {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemon = await res.json();

            const speciesRes = await fetch(pokemon.species.url);
            const speciesDaten = await speciesRes.json();

            const deObj = speciesDaten.names.find(n => n.language.name === 'de');
            pokemon.nameEN = pokemon.name;
            pokemon.nameDE = deObj ? deObj.name : pokemon.name;
            pokemon.deName = pokemon.nameDE;
            pokemon.evolutionUrl = speciesDaten.evolution_chain.url;
            return pokemon;
        }));

        aktuellePokemonDaten = teamListe;
        zeigePokemon(teamListe);
    } catch (fehler) {
        console.error('Fehler beim Laden des Trainer-Teams:', fehler);
        kartenRaster.innerHTML = `<p class="text-danger text-center">${aktuelleSprache === 'de' ? 'Fehler beim Laden des Teams.' : 'Error loading team.'}</p>`;
    }
}

// --- Event Listener ---
typFilter.addEventListener('change', datenFilternUndSortieren);

sortierButton.addEventListener('click', () => {
    alphabetischSortiert = !alphabetischSortiert;
    aktualisiereSortierButtonText();
    datenFilternUndSortieren();
});

genFilter.addEventListener('change', (event) => {
    suchfeld.value = '';
    typFilter.value = 'alle';
    if (trainerFilter) trainerFilter.value = '';
    aktualisiereTrainerBanner('');
    ladeGeneration(event.target.value);
});

spracheFilter.addEventListener('change', (event) => {
    aktuelleSprache = event.target.value;
    aktualisiereFilterSprache();
    datenFilternUndSortieren();
});

if (trainerFilter) {
    trainerFilter.addEventListener('change', (e) => {
        ladeTrainerTeam(e.target.value);
    });
}

// Applikation starten
ladeGeneration('1');