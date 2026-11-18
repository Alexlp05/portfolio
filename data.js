/* ==========================================================================
   DATA — tout le contenu du portfolio est ici.
   Modifie ce fichier pour mettre à jour le site, sans toucher au HTML/JS.

   • lens : "tech" | "conseil" | "both"  → utilisé par le filtre « lentille »
   • todo : liste d'infos manquantes. Elles s'affichent en rouge pointillé
            quand on ouvre le site avec ?audit à la fin de l'URL
            (ex : index.html?audit) ou via ⌘K → « Mode audit ».
            Supprime la ligne todo quand l'info est complétée.
   ========================================================================== */

window.PORTFOLIO = {
  profile: {
    firstName: "Alexandre",
    lastName: "Le Port",
    tagline: "Ingénierie & IA × Conseil & Management",
    location: "Paris, France",
    // ⚠️ Le domaine alexandreleport.com ne répond pas : cet email ne fonctionne probablement pas.
    email: "contact@alexandreleport.com",
    linkedin: "https://www.linkedin.com/in/alexandreleport",
    github: "https://github.com/Alexlp05",
    cv: "assets/CV_Alexandre_Le_Port.pdf",
    roles: [
      "futur ingénieur IA",
      "creative technologist",
      "vice-président de Junior-Entreprise",
      "chef de projet",
      "auditeur-conseil à la CNJE",
      "chercheur en bio-computing"
    ],
    now: [
      "ESILV A5 — recherche sur le mycélium vivant",
      "Auditeur-Conseil — CNJE"
    ],
    seeking: "Stage de fin d’études — à préciser",
    statement:
      "Étudiant ingénieur au profil hybride. Je conçois des systèmes d’IA qui tournent en local — dans un navigateur, sur un Raspberry Pi ou dans un vieux téléphone — et je pilote les équipes et les projets qui les rendent utiles.",
    todo: [
      "Email de contact valide (le domaine alexandreleport.com ne répond pas)",
      "Ce que tu recherches : stage de fin d’études / CDI / VIE ? dates, durée, secteur",
      "CV PDF à déposer dans assets/CV_Alexandre_Le_Port.pdf",
      "Photo en meilleure résolution (l’actuelle fait ~220 px de large)",
      "Langues + niveau (anglais : TOEIC/IELTS ?)",
      "Localisation : LinkedIn indiquait Nantes, le site Paris — laquelle afficher ?"
    ]
  },

  stats: [
    { value: 2, label: "mandats au bureau de DeVinci Junior", sub: "Chef de projet & RH, puis Vice-Président" },
    { value: "L30", label: "Top 30 des Junior-Entreprises de France", sub: "2025 et 2026, pendant mes mandats" },
    { value: 98.41, decimals: 2, suffix: "%", label: "de précision sur MNIST", sub: "MLP entraîné avec tinygrad, inféré en WebGPU" },
    { value: 8, suffix: "B", label: "paramètres de LLM dans un navigateur", sub: "Llama-3 via WebLLM — zéro serveur" },
    { value: 9, label: "projets documentés dans le Lab", sub: "du prototype hardware au papier de recherche" }
  ],

  /* ---------------- Parcours : ordre chronologique ---------------- */
  chapters: [
    {
      id: "esilv",
      year: "2022",
      dates: "2022 — 2027",
      role: "Cycle ingénieur",
      org: "ESILV — École Supérieure d’Ingénieurs Léonard de Vinci",
      place: "Paris La Défense",
      lens: "tech",
      type: "Formation",
      pitch: "Le socle : maths, informatique, data & IA, au sein du Pôle Léonard de Vinci.",
      context:
        "École d’ingénieurs du numérique du Pôle Léonard de Vinci, aux côtés de l’EMLV (management) et de l’IIM (digital & création). C’est ce mélange d’écoles qui a nourri mon profil hybride.",
      missions: [
        "Fondamentaux : mathématiques, algorithmique, data science, machine learning",
        "Projets d’équipe semestriels, du cahier des charges à la démo",
        "Spécialisation Creative Technology en fin de cursus (voir chapitre dédié)"
      ],
      skills: ["python", "dl", "gestion"],
      projects: ["clothing"],
      todo: [
        "Dates à confirmer : le site affichait 2020–2025, incohérent avec un projet A5 en 2026",
        "Intitulé exact du diplôme et rôle de l’IFT (« ESILV x IFT » sur l’ancienne version)",
        "Échange / semestre à l’étranger ? cours phares ? mention ?"
      ]
    },
    {
      id: "parker",
      year: "2024",
      dates: "Juin — Juil. 2024",
      role: "Stagiaire Gestion de projet",
      org: "Parker Meggitt",
      place: "",
      lens: "conseil",
      type: "Stage",
      pitch: "Première immersion industrielle chez un équipementier aéronautique.",
      context:
        "Parker Meggitt est la branche aéronautique issue du rachat de Meggitt par Parker Hannifin : systèmes et composants pour l’aviation civile et militaire.",
      missions: [],
      skills: ["gestion"],
      projects: [],
      todo: [
        "Lieu du stage",
        "2–3 missions concrètes (outil de suivi, planning, reporting… ?)",
        "Un résultat chiffré ou un livrable"
      ]
    },
    {
      id: "dvj-rh",
      year: "2024",
      dates: "Juin 2024 — Juin 2025",
      role: "Chef de projet & Chargé RH",
      org: "DeVinci Junior",
      place: "Paris La Défense",
      lens: "conseil",
      type: "Junior-Entreprise",
      pitch: "Piloter des missions pour de vrais clients et faire grandir l’équipe qui les réalise.",
      context:
        "DeVinci Junior est la Junior-Entreprise du Pôle Léonard de Vinci : des étudiants de l’EMLV, de l’ESILV et de l’IIM réalisent des missions pour des entreprises — études marketing, développement web, supports de communication, jeux vidéo, enquêtes de satisfaction.",
      missions: [
        "Chef de projet : suivi de missions clients, de la proposition commerciale à la livraison",
        "Chargé RH : recrutement, intégration et suivi des membres et des intervenants",
        "Participation à l’audit annuel de la CNJE, qui évalue notamment la gestion des ressources humaines"
      ],
      impact: [
        { value: "L30", label: "DeVinci Junior réintègre le Top 30 des Junior-Entreprises de France en 2025" }
      ],
      skills: ["gestion", "rh"],
      projects: [],
      todo: [
        "1–2 missions pilotées : client (anonymisé si besoin), livrable, résultat",
        "Chiffres RH : nombre de recrutements, taille de l’équipe"
      ]
    },
    {
      id: "dvj-vp",
      year: "2025",
      dates: "Juin 2025 — Juin 2026",
      role: "Vice-Président",
      org: "DeVinci Junior",
      place: "Paris La Défense",
      lens: "both",
      type: "Junior-Entreprise",
      pitch: "Co-diriger la structure — et lui construire ses propres outils.",
      context:
        "Au bureau de direction, aux côtés de la présidence : stratégie, pilotage des pôles et qualité des missions. J’ai aussi développé un CRM sur mesure pour outiller la prospection et le suivi des études.",
      missions: [
        "Co-pilotage de la stratégie et de l’organisation de la Junior-Entreprise",
        "Coordination des pôles et suivi de la qualité des missions",
        "Conception et développement du CRM interne (voir projet lié)"
      ],
      impact: [
        { value: "L30", label: "Top 30 des Junior-Entreprises de France 2026 — 2ᵉ année consécutive" },
        { value: "EY", label: "Prix EY de la meilleure étude en conseil, Congrès National d’Été 2026 (structure)" }
      ],
      quote: {
        text: "Cette nouvelle intégration récompense le travail et la constance des membres engagés chaque année.",
        source: "EMLV, mars 2026"
      },
      skills: ["direction", "gestion", "produit", "ts"],
      projects: ["crm"],
      todo: [
        "Chiffres du mandat : CA, nombre de missions, taille de l’équipe",
        "Ton rôle exact dans l’étude primée par EY (si tu y as contribué)"
      ]
    },
    {
      id: "ct",
      year: "2025",
      dates: "2025 — 2026",
      role: "Majeure Creative Technology",
      org: "ESILV",
      place: "Paris La Défense",
      lens: "tech",
      type: "Formation",
      pitch: "Là où l’IA sort de l’écran : fabrication, électronique, interaction, IA embarquée.",
      context:
        "Une année de projets intensifs à la frontière du code et du physique : fabrication numérique, électronique, rendu temps réel, deep learning et IA locale. Chaque projet est documenté et open source.",
      missions: [
        "Sprints de fabrication et d’électronique (How To Make Almost Anything)",
        "Deep learning de bout en bout : de l’entraînement à l’inférence WebGPU",
        "IA locale et respectueuse de la vie privée : LLM dans le navigateur, assistant vocal embarqué"
      ],
      impact: [
        { value: "5", label: "projets livrés et open source" },
        { value: "100%", label: "local : aucune donnée utilisateur envoyée dans le cloud (Loom, Literature Reviewer)" }
      ],
      skills: ["llm", "rag", "dl", "vision", "webgpu", "hardware", "fab", "speech"],
      projects: ["loom", "local-llm", "raymarching", "mnist", "htmaa"],
      todo: []
    },
    {
      id: "amexio",
      year: "2026",
      dates: "Avr. — Août 2026",
      role: "Assistant Directeur des Opérations & Chef de projet",
      org: "AmeXio Group",
      place: "",
      lens: "conseil",
      type: "Stage",
      pitch: "Au cœur des opérations d’un groupe de conseil et d’intégration IT.",
      context:
        "Rattaché à la direction des opérations, en double casquette : appui au pilotage opérationnel du groupe et gestion de projet.",
      missions: [],
      skills: ["operations", "gestion"],
      projects: [],
      todo: [
        "C’est ton expérience la plus récente et la plus vide : 3–4 missions concrètes",
        "Description d’AmeXio à valider (secteur, taille)",
        "Résultats chiffrés : process optimisé, projet livré, outil mis en place…",
        "Lieu"
      ]
    },
    {
      id: "cnje",
      year: "2026",
      dates: "Juin 2026 — Présent",
      role: "Auditeur-Conseil",
      org: "CNJE — Confédération Nationale des Junior-Entreprises",
      place: "Paris",
      lens: "conseil",
      type: "Mandat national",
      pitch: "Passer de l’autre côté de l’audit : accompagner les Junior-Entreprises de France.",
      context:
        "La CNJE fédère environ 200 Junior-Entreprises. Ses audits annuels évaluent la stratégie, les RH, le développement commercial et la qualité des missions — ceux-là mêmes qui ont classé DeVinci Junior dans la L30.",
      missions: [
        "Audit et conseil auprès des Junior-Entreprises du réseau"
      ],
      skills: ["audit", "gestion"],
      projects: [],
      todo: [
        "Le site de la CNJE (Mandat 58) te présente comme « chargé de mission formation, pôle événementiel » — quel intitulé est le bon ?",
        "Nombre de JE auditées / accompagnées, formations données"
      ]
    },
    {
      id: "a5",
      year: "2026",
      dates: "Sept. 2026 — Présent",
      role: "Projet de recherche A5",
      org: "ESILV — Creative Technology",
      place: "Paris La Défense",
      lens: "tech",
      type: "Recherche",
      pitch: "Écouter l’activité électrique d’un mycélium vivant, pendant qu’il pousse.",
      context:
        "Mon projet de dernière année étudie l’activité électrique du mycélium vivant et en croissance — et non d’échantillons séchés. À la croisée du bio-design, de l’électrophysiologie et du calcul non conventionnel.",
      missions: [
        "Revue de littérature : spiking fongique, reservoir computing, memristors à base de mycélium",
        "Conception de dispositifs d’électrodes et de chambres de culture",
        "Pièces de culture imprimées en 3D"
      ],
      skills: ["ephys", "fab", "hardware"],
      projects: ["mycelium"],
      todo: ["Encadrant / laboratoire partenaire", "Premières mesures à montrer"]
    },
    {
      id: "next",
      year: "2027",
      dates: "2027 →",
      role: "Chapitre suivant",
      org: "Votre équipe ?",
      lens: "both",
      type: "À écrire",
      pitch: "Le fil continue. Où l’accrocher ensuite ?",
      isNext: true,
      skills: [],
      projects: []
    }
  ],

  /* ---------------- Lab : projets ---------------- */
  projects: [
    {
      id: "loom",
      title: "Loom — The Teller",
      year: "2025 — 2026",
      category: "IA incarnée · Hardware",
      lens: "tech",
      chapter: "ct",
      cover: { type: "image", src: "assets/projects/loom/user_holding_phone.jpeg", position: "50% 30%" },
      gallery: [
        { src: "assets/projects/loom/user_holding_phone.jpeg", caption: "The Teller en situation : décrocher suffit pour lancer la conversation." },
        { src: "assets/projects/loom/phone_front.png", caption: "Le GPO 746, hub de l’interaction." },
        { src: "assets/projects/loom/phone_open.png", caption: "Raspberry Pi 5 intégré, câblé au crochet du combiné et à l’audio." },
        { src: "assets/projects/loom/timeline_UI.png", caption: "« Mémoires & Histoires » : la frise que consulte la famille." },
        { src: "assets/projects/loom/wiring-diagram.png", caption: "Schéma de câblage." }
      ],
      pitch:
        "Un téléphone vintage qui recueille les souvenirs des personnes âgées et les transforme en histoires pour leur famille. 100 % local.",
      challenge:
        "Les assistants vocaux passent par des écrans ou par le cloud : deux barrières pour les seniors. Comment rendre l’IA conversationnelle chaleureuse, tangible et respectueuse de la vie privée ?",
      built: [
        "Raspberry Pi 5 intégré dans un téléphone GPO 746 : décrocher le combiné lance la session",
        "Pipeline 100 % local : Faster-Whisper (STT) → Ollama (LLM) → Kokoro (TTS), en WebSocket",
        "Chaque conversation est transcrite, réécrite en récit et rangée dans une frise web pour la famille (FastAPI + SQLite)",
        "Un écosystème pensé autour : The Tuner (radio) et The Imprint (machine à écrire)"
      ],
      results: [
        { value: "0", label: "donnée envoyée dans le cloud" },
        { value: "3", label: "objets imaginés dans la collection" },
        { value: "RPi 5", label: "embarqué dans un téléphone vintage" }
      ],
      stack: ["Raspberry Pi 5", "Python", "WebSocket", "Faster-Whisper", "Ollama", "Kokoro TTS", "FastAPI", "SQLite"],
      team: "Binôme avec Alexandre Haguet",
      links: [{ label: "Code source", url: "https://github.com/Alexlp05/Loom" }],
      skills: ["llm", "speech", "hardware", "python", "backend"],
      todo: [
        "Un extrait vidéo de 15 s (le repo contient system_logs.mp4, 17 Mo)",
        "Tests avec de vrais utilisateurs seniors ? retours ?"
      ]
    },
    {
      id: "mycelium",
      title: "Signaux vivants",
      year: "2026",
      category: "Bio-computing · Recherche",
      lens: "tech",
      chapter: "a5",
      cover: { type: "gen", gen: "mycelium" },
      pitch: "Écouter l’activité électrique d’un mycélium vivant — pendant qu’il pousse.",
      challenge:
        "La plupart des travaux mesurent des échantillons séchés ou des fructifications. Mon projet A5 traite le réseau vivant, en croissance, comme un signal à part entière.",
      built: [
        "Base bibliographique en électrophysiologie fongique : du spiking chez le pleurote (Adamatzky, 2018) au reservoir computing et aux memristors à base de mycélium",
        "Conception de dispositifs d’électrodes et de chambres de culture",
        "Moules et cadres imprimés en 3D pour guider la croissance",
        "Pistes ouvertes : boucle fermée humidité ↔ signal, suivi électrique de la décomposition des bio-composites"
      ],
      results: [],
      stack: ["Électrophysiologie", "Électrodes", "Acquisition de signaux", "Impression 3D", "Bio-design"],
      team: "Projet de fin d’études — ESILV",
      links: [],
      skills: ["ephys", "fab", "hardware"],
      todo: [
        "Photos des cultures et du montage",
        "Premières courbes de spikes",
        "Confirmer l’usage des pièces imprimées « Labyrinth » et « cadres »"
      ]
    },
    {
      id: "local-llm",
      title: "Local LLM Literature Reviewer",
      year: "Janv. 2026",
      category: "IA locale · RAG",
      lens: "tech",
      chapter: "ct",
      cover: { type: "gen", gen: "tokens" },
      pitch: "Un agent de revue de littérature qui tourne entièrement dans le navigateur. Vos PDF ne quittent jamais votre machine.",
      challenge:
        "Synthétiser des dizaines d’articles scientifiques avec un LLM, sans envoyer de documents sensibles à un serveur.",
      built: [
        "Llama-3-8B exécuté côté client via WebLLM et WebGPU",
        "Moteur RAG : embeddings Transformers.js (all-MiniLM-L6-v2), parsing PDF.js, citation [source: fichier] pour chaque affirmation",
        "Synthèse structurée à partir de 6+ PDF : introduction, comparaison des méthodes, conclusion",
        "3 personas d’analyse (Scholar, Simplifier, Critic) et un mode vocal STT/TTS"
      ],
      results: [
        { value: "8B", label: "paramètres exécutés dans le navigateur" },
        { value: "0", label: "serveur" },
        { value: "3", label: "personas d’analyse" }
      ],
      stack: ["WebLLM", "WebGPU", "Transformers.js", "PDF.js", "JavaScript", "Tailwind CSS"],
      team: "Projet individuel",
      links: [
        { label: "Démo live", url: "https://alexlp05.github.io/local-llm-reviewer/" },
        { label: "Code source", url: "https://github.com/Alexlp05/local-llm-reviewer" }
      ],
      skills: ["llm", "rag", "webgpu", "js", "speech"],
      todo: ["Capture de l’interface (le README contient encore un placeholder)"]
    },
    {
      id: "raymarching",
      title: "WebGPU RayMarching Simulator",
      year: "Déc. 2025",
      category: "Graphics · WebGPU",
      lens: "tech",
      chapter: "ct",
      cover: { type: "gen", gen: "metaballs" },
      pitch: "Un moteur de rendu temps réel sans un seul triangle : toute la scène est une équation.",
      challenge:
        "Remplacer la rastérisation classique par du ray marching sur des fonctions de distance signée, en temps réel, dans un navigateur.",
      built: [
        "Ray marching sur SDF écrit en WGSL : sphères, boîtes, tores",
        "Fusion organique des objets par smooth-min (metaballs)",
        "Ombres douces, éclairage Phong/Lambert, brouillard de distance",
        "Mini moteur physique CPU, picking 3D par raycasting et inspecteur temps réel"
      ],
      results: [],
      stack: ["WebGPU", "WGSL", "JavaScript", "SDF", "Ray marching"],
      team: "Projet individuel",
      links: [
        { label: "Démo live", url: "https://alexlp05.github.io/RayMarching-Simulator/" },
        { label: "Code source", url: "https://github.com/Alexlp05/RayMarching-Simulator" }
      ],
      skills: ["webgpu", "js"],
      todo: ["Le lien de démo du README est cassé (casse de l’URL)", "Un GIF de la démo"]
    },
    {
      id: "mnist",
      title: "Digit Classifier — tinygrad × WebGPU",
      year: "Nov. 2025",
      category: "Deep learning · Vision",
      lens: "tech",
      chapter: "ct",
      cover: { type: "gen", gen: "pixels" },
      gallery: [{ src: "assets/projects/mnist/image-1.png", caption: "L’interface : dessin, choix du modèle, probabilités en temps réel." }],
      pitch: "Dessinez un chiffre : un réseau de neurones entraîné maison le reconnaît en temps réel, dans votre navigateur.",
      challenge: "Couvrir toute la chaîne du deep learning : entraînement, réglage des hyperparamètres, export et inférence côté client.",
      built: [
        "Entraînement en Python avec tinygrad, journal d’hyperparamètres documenté (LR, batch size, augmentation)",
        "Deux modèles au choix : MLP 784-512-512-10 et CNN",
        "Pré-traitement automatique (centrage, redimensionnement) puis inférence WebGPU dès qu’on lève le stylo",
        "Visualisation des probabilités softmax sur les 10 classes"
      ],
      results: [
        { value: "98,41 %", label: "précision du MLP (objectif ≥ 95 %)" },
        { value: "98,17 %", label: "précision du CNN (objectif ≥ 98 %)" }
      ],
      stack: ["tinygrad", "Python", "WebGPU", "Canvas", "JavaScript"],
      team: "Projet individuel",
      links: [
        { label: "Démo live", url: "https://alexlp05.github.io/Mnist-Digit-Reco/" },
        { label: "Code source", url: "https://github.com/Alexlp05/Mnist-Digit-Reco" }
      ],
      skills: ["dl", "vision", "python", "webgpu"],
      todo: ["Le repo versionne un dossier .venv complet : à retirer (.gitignore)"]
    },
    {
      id: "htmaa",
      title: "How To Make (Almost) Anything",
      year: "Oct. 2025 — Févr. 2026",
      category: "Fabrication · Électronique · IA",
      lens: "tech",
      chapter: "ct",
      cover: { type: "gen", gen: "fab" },
      pitch: "Trois sprints : un manège mécanique, un synthé vidéo 8-bit sur Arduino et un jeu piloté par la vision.",
      challenge: "Apprendre un nouvel outil par module et livrer un objet fonctionnel et documenté en quelques jours.",
      built: [
        "Le Manège de Poséidon : carrousel de poissons à manivelle en 5 jours (Rhino, Fusion 360, découpe laser, Cricut, impression 3D Bambu Lab)",
        "VGA Synth : vidéo 8-bit et son ByteBeat générés par un seul Arduino Uno via un DAC R-2R (KiCad, oscilloscope), après l’échec d’une 1ʳᵉ version sur Raspberry Pi Zero",
        "Vision & jeu : 11 classes d’objets du quotidien reconnues (Teachable Machine, ml5.js, p5.js) pour composer un numéro de téléphone",
        "Site de documentation déployé sur Vercel"
      ],
      results: [
        { value: "3", label: "modules : fabrication, électronique, IA" },
        { value: "5 j", label: "du croquis au manège fonctionnel" }
      ],
      stack: ["Rhino", "Fusion 360", "Découpe laser", "Impression 3D", "Arduino", "KiCad", "Teachable Machine", "p5.js"],
      team: "Projets d’équipe",
      links: [
        { label: "Site du projet", url: "https://htmaa-projects.vercel.app/" },
        { label: "Code source", url: "https://github.com/Alexlp05/HTMAAProjects" }
      ],
      skills: ["fab", "hardware", "vision", "ts"],
      todo: ["Ton rôle précis dans chaque module (projets d’équipe)", "Photo finale du manège"]
    },
    {
      id: "crm",
      title: "Vinci Junior CRM",
      year: "Mai 2026",
      category: "Produit · Outil interne",
      lens: "both",
      chapter: "dvj-vp",
      cover: { type: "gen", gen: "kanban" },
      pitch: "Un CRM sur mesure pour piloter la prospection et les études de DeVinci Junior.",
      challenge: "Centraliser leads, prospection, opportunités et études d’une Junior-Entreprise dans un seul outil.",
      built: [
        "Modules Leads, Prospection, Opportunités, Études, Dashboard et Admin",
        "Authentification et espace d’administration",
        "TanStack Start, React, TypeScript, composants Radix/shadcn, déploiement Cloudflare"
      ],
      results: [],
      stack: ["TypeScript", "React", "TanStack Start", "Radix UI", "shadcn/ui", "Cloudflare"],
      team: "Projet individuel — pour DeVinci Junior",
      links: [{ label: "Code source", url: "https://github.com/Alexlp05/vinci-junior-crm" }],
      skills: ["ts", "produit", "direction"],
      todo: ["Utilisé en production par la JE ? Combien d’utilisateurs ?", "Captures anonymisées du dashboard"]
    },
    {
      id: "une-vie",
      title: "Une Vie",
      year: "Oct. 2026",
      category: "Jeu narratif · Side project",
      lens: "tech",
      chapter: null,
      cover: { type: "gen", gen: "life" },
      pitch: "Un simulateur de vie : de 0 à 100 ans, chaque choix compte.",
      challenge: "Faire tenir des systèmes imbriqués (santé, carrière, finances, relations) dans un jeu lisible et rejouable.",
      built: [
        "Moteur de jeu en JavaScript vanilla, zéro dépendance",
        "Création de personnage : 9 traits, origines tirées au sort",
        "Systèmes imbriqués : santé, énergie, intelligence, social, bonheur, carrière, finances et investissements, relations",
        "Fin de vie générée : épitaphe, bilan et synopsis"
      ],
      results: [],
      stack: ["JavaScript", "HTML/CSS", "Game design", "Vercel"],
      team: "Projet personnel",
      links: [
        { label: "Jouer", url: "https://une-vie-seven.vercel.app/vie-game/" },
        { label: "Code source", url: "https://github.com/Alexlp05/Une-vie" }
      ],
      skills: ["js"],
      todo: []
    },
    {
      id: "clothing",
      title: "Clothing Recommender",
      year: "Juin 2025",
      category: "Python · Recommandation",
      lens: "tech",
      chapter: "esilv",
      cover: { type: "gen", gen: "weather" },
      pitch: "Une app qui choisit votre tenue selon la météo et votre agenda.",
      challenge: "Croiser des données de contexte (météo, événements) pour recommander une tenue adaptée.",
      built: [
        "Moteur de recommandation Python croisant météo en temps réel et événements Google Calendar (OAuth)",
        "Application web Flask et base de données de garde-robe"
      ],
      results: [],
      stack: ["Python", "Flask", "Google Calendar API", "OAuth", "API météo"],
      team: "",
      links: [{ label: "Code source", url: "https://github.com/Alexlp05/Clothing-Recommender-V2" }],
      skills: ["python", "backend"],
      todo: ["Contexte (projet de cours ?), équipe et capture d’écran"]
    }
  ],

  /* ---------------- Compétences ↔ preuves ---------------- */
  skillGroups: [
    {
      label: "IA & Data",
      skills: [
        { id: "llm", label: "LLM locaux" },
        { id: "rag", label: "RAG" },
        { id: "dl", label: "Deep learning" },
        { id: "vision", label: "Computer vision" },
        { id: "speech", label: "Speech (STT / TTS)" },
        { id: "python", label: "Python" }
      ]
    },
    {
      label: "Dev & Graphics",
      skills: [
        { id: "webgpu", label: "WebGPU / WGSL" },
        { id: "ts", label: "TypeScript / React" },
        { id: "js", label: "JavaScript" },
        { id: "backend", label: "API & back-end" }
      ]
    },
    {
      label: "Hardware & Fab",
      skills: [
        { id: "hardware", label: "Raspberry Pi / Arduino" },
        { id: "fab", label: "Fabrication numérique" },
        { id: "ephys", label: "Électrophysiologie" }
      ]
    },
    {
      label: "Conseil & Management",
      skills: [
        { id: "gestion", label: "Gestion de projet" },
        { id: "rh", label: "RH & recrutement" },
        { id: "direction", label: "Direction & stratégie" },
        { id: "audit", label: "Audit & conseil" },
        { id: "operations", label: "Opérations" },
        { id: "produit", label: "Produit / outils internes" }
      ]
    }
  ]
};
