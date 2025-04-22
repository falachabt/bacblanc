'use client';

// Initialize mock exam data in the browser
export function initMockExamsData() {
    // Check if exams data already exists in localStorage
    const existingExams = localStorage.getItem('exams_data');
    if (existingExams) return JSON.parse(existingExams);

    // Mock exam data
    const mockExams = [
        {
            id: '04b43ca0-28ce-448a-966f-c0fa3a2d6cc7',
            title: 'Examen Blanc de Mathématiques #1',
            description: 'Ce premier examen blanc couvre les chapitres 1 à 5 du programme. Il est conçu pour évaluer votre compréhension des fondamentaux en mathématiques.',
            subject: {
                name: 'Mathématiques',
                code: 'MATH'
            },
            duration: '3h00',
            level: 'BAC D',
            available_at: '2023-09-01',
            questionCount: 20,
            questions: generateMathQuestions(20)
        },
        {
            id: 'f9683bfa-fb45-4026-a629-25002692adfe',
            title: 'Examen Blanc de Physique-Chimie',
            description: 'Cet examen couvre les principes fondamentaux de la physique et de la chimie selon le programme du BAC.',
            subject: {
                name: 'Physique-Chimie',
                code: 'PC'
            },
            duration: '2h30',
            level: 'BAC C',
            available_at: '2023-09-05',
            questionCount: 18,
            questions: generatePhysicsQuestions(18)
        },
        {
            id: '3',
            title: 'Examen Blanc de Sciences de la Vie et de la Terre',
            description: 'Cet examen évalue vos connaissances en biologie, géologie et écologie.',
            subject: {
                name: 'SVT',
                code: 'SVT'
            },
            duration: '2h00',
            level: 'BAC D',
            available_at: '2023-09-10',
            questionCount: 15,
            questions: generateBiologyQuestions(15)
        },
        {
            id: 'aebfc513-7221-459b-b584-3d611cc9db6c',
            title: 'Examen Blanc de Philosophie',
            description: 'Cet examen évalue votre capacité à analyser des concepts philosophiques et à développer une argumentation cohérente.',
            subject: {
                name: 'Philosophie',
                code: 'PHILO'
            },
            duration: '4h00',
            level: 'BAC A',
            available_at: '2023-09-15',
            questionCount: 12,
            questions: generatePhilosophyQuestions(12)
        },
        {
            id: '5',
            title: 'Examen Blanc de Mathématiques #2',
            description: 'Ce second examen blanc se concentre sur les chapitres 6 à 10 du programme, couvrant des concepts plus avancés.',
            subject: {
                name: 'Mathématiques',
                code: 'MATH'
            },
            duration: '3h00',
            level: 'BAC C',
            available_at: '2023-09-20',
            questionCount: 22,
            questions: generateMathQuestions(22)
        }
    ];

    // Save to localStorage
    localStorage.setItem('exams_data', JSON.stringify(mockExams));

    return mockExams;
}

// Fonction utilitaire pour mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Fonction pour générer des questions de mathématiques
function generateMathQuestions(count) {
    const questions = [];
    // On limite les types de questions à 'multiple', 'single' et 'true-false' uniquement
    const questionTypes = ['multiple', 'single', 'true-false'];
    const mathQuestions = [
        "Quelle est la dérivée de la fonction f(x) = x² + 3x - 2 ?",
        "Résoudre l'équation suivante : 2x² - 5x + 3 = 0",
        "Calculez l'intégrale de f(x) = 2x + 1 sur l'intervalle [0, 3]",
        "Dans un triangle rectangle, si l'hypoténuse mesure 5 cm et un côté mesure 3 cm, quelle est la longueur du troisième côté ?",
        "Simplifiez l'expression : (x³ + 2x² - x - 2) ÷ (x + 1)",
        "Déterminez les coordonnées du sommet de la parabole d'équation y = -2x² + 4x + 1",
        "Calculez la limite de (x² - 1) / (x - 1) quand x tend vers 1",
        "Si P(A) = 0.4 et P(B) = 0.3 et les événements A et B sont indépendants, quelle est la probabilité P(A ∩ B) ?",
        "Quelle est l'image de 3 par la fonction f(x) = 2x - 5 ?",
        "Résoudre l'inéquation : 3x - 2 > 2x + 1",
        "Calculez le déterminant de la matrice [[2, 1], [3, 4]]",
        "Un dé équilibré est lancé. Quelle est la probabilité d'obtenir un nombre pair ?",
        "Quelle est la solution de l'équation exponentielle 2^x = 8 ?",
        "Calculez le produit scalaire des vecteurs u(1,2) et v(3,-1)",
        "Quelle est l'équation de la tangente à la courbe f(x) = x² au point d'abscisse x = 2 ?",
        "Déterminez l'ensemble de définition de la fonction f(x) = √(x-1) / (x+2)",
        "Résoudre le système d'équations : 2x + y = 5 et 3x - 2y = 4",
        "Calculez le PGCD de 56 et 42",
        "Développez et réduisez : (2x-3)²",
        "Si f(x) = x² - 2x + 1, calculez f(3)",
        "Démontrez que si un quadrilatère a ses diagonales perpendiculaires et qui se coupent en leur milieu, alors c'est un losange",
        "Calculez la somme des termes de la suite arithmétique de premier terme a₁ = 5 et de raison r = 3, jusqu'au terme a₁₀",
        "Quelle est la dérivée de la fonction trigonométrique f(x) = sin(2x) ?",
        "Déterminez les asymptotes de la fonction f(x) = (2x+1)/(x-3)",
        "Calculez le volume d'une sphère de rayon 4 cm",
        "La somme des angles intérieurs d'un triangle est toujours égale à 180 degrés.",
        "Dans un repère orthonormé, deux droites perpendiculaires ont des coefficients directeurs dont le produit vaut -1.",
        "La fonction exponentielle est strictement croissante sur R.",
        "Tout polynôme de degré n admet exactement n racines réelles.",
        "Le nombre π est un nombre rationnel."
    ];

    const mathOptions = [
        ["f'(x) = 2x + 3", "f'(x) = x² + 3", "f'(x) = 2x + 2", "f'(x) = 2x"],
        ["x = 1 et x = 1.5", "x = 0.5 et x = 3", "x = -1 et x = 3", "x = 1 et x = 3"],
        ["9", "10", "12", "7.5"],
        ["4 cm", "5 cm", "2 cm", "√16 cm"],
        ["x² + x - 2", "x² - 1", "x² + 3x - 2", "x² - x - 2"],
        ["(1, 3)", "(2, 5)", "(1, 1)", "(0, 1)"],
        ["2", "1", "0", "Infini"],
        ["0.12", "0.7", "0.1", "0.4"],
        ["1", "6", "1.5", "0"],
        ["x > 3", "x < 3", "x > 1", "x < -1"],
        ["5", "7", "3", "11"],
        ["0.5", "0.25", "0.75", "0.33"],
        ["x = 3", "x = 4", "x = 2", "x = log₂(8)"],
        ["1", "5", "0", "-1"],
        ["y = 4x - 4", "y = 2x", "y = 4x - 8", "y = 2x + 4"],
        ["]-∞, -2[ ∪ [1, +∞[", "[1, +∞[", "]-∞, -2[ ∪ ]1, +∞[", "[-2, 1]"],
        ["x = 2, y = 1", "x = 1, y = 3", "x = 3, y = -1", "x = 1.5, y = 2"],
        ["14", "7", "21", "28"],
        ["4x² - 12x + 9", "4x² - 9", "4x² + 9", "4x² + 12x + 9"],
        ["f(3) = 4", "f(3) = 6", "f(3) = 10", "f(3) = 0"]
    ];

    // Mélanger les questions pour avoir un ordre aléatoire
    const shuffledQuestionIndices = shuffleArray([...Array(mathQuestions.length).keys()]);

    for (let i = 0; i < count; i++) {
        // Utiliser un index aléatoire
        const qIndex = shuffledQuestionIndices[i % shuffledQuestionIndices.length];
        // Type de question aléatoire (seulement parmi multiple, single, true-false)
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let question = {
            id: `math-q-${i+1}-${Math.random().toString(36).substring(2, 8)}`,
            text: mathQuestions[qIndex],
            type: type,
            points: Math.floor(Math.random() * 3) + 1 // 1-3 points
        };

        if (type === 'multiple' || type === 'single') {
            question.options = [];
            // S'assurer que nous avons suffisamment d'options
            const optionsForQuestion = qIndex < mathOptions.length
                ? mathOptions[qIndex]
                : ["Option A", "Option B", "Option C", "Option D"];

            // Mélanger les options
            const shuffledOptions = shuffleArray([...optionsForQuestion]);

            for (let j = 0; j < shuffledOptions.length; j++) {
                question.options.push({
                    id: `option-${j+1}`,
                    text: shuffledOptions[j]
                });
            }

            if (type === 'multiple') {
                const correctCount = Math.floor(Math.random() * 2) + 1; // 1 ou 2 réponses correctes
                const correctIndices = [];
                while (correctIndices.length < correctCount) {
                    const idx = Math.floor(Math.random() * question.options.length);
                    if (!correctIndices.includes(idx)) {
                        correctIndices.push(idx);
                    }
                }
                question.correctAnswers = correctIndices.map(idx => question.options[idx].id);
            } else {
                // Single choice - first option is correct for simplicity
                question.correctAnswer = question.options[0].id;
            }
        } else if (type === 'true-false') {
            question.correctAnswer = Math.random() > 0.5 ? 'true' : 'false';
        }

        questions.push(question);
    }

    // Mélanger l'ordre final des questions
    return shuffleArray(questions);
}

// Fonction pour générer des questions de physique-chimie
function generatePhysicsQuestions(count) {
    const questions = [];
    // Seulement les types autorisés
    const questionTypes = ['multiple', 'single', 'true-false'];
    const physicsQuestions = [
        "Quelle est l'unité de mesure de la force dans le Système International?",
        "Quelle est la relation entre la masse et le poids d'un objet?",
        "Quelle est la formule de la deuxième loi de Newton?",
        "Quelle est la vitesse de la lumière dans le vide?",
        "Quel est le principe de conservation de l'énergie?",
        "Qu'est-ce que la loi d'Ohm?",
        "Quelle est la formule de l'énergie cinétique?",
        "Qu'est-ce que la radioactivité?",
        "Quel est le pH d'une solution neutre à 25°C?",
        "Quel est le modèle atomique actuel?",
        "La chaleur se propage toujours d'un corps chaud vers un corps froid.",
        "Un corps en mouvement dans le vide continue en ligne droite à vitesse constante en l'absence de forces extérieures.",
        "La pression d'un gaz augmente quand son volume diminue à température constante.",
        "L'eau bout toujours à 100°C, quelle que soit la pression.",
        "Deux charges électriques de même signe s'attirent."
    ];

    const physicsOptions = [
        ["Newton (N)", "Joule (J)", "Pascal (Pa)", "Watt (W)"],
        ["Le poids est la force exercée par la gravité sur une masse", "La masse et le poids sont identiques", "Le poids est constant où que l'on soit", "La masse dépend de la gravité"],
        ["F = m×a", "E = mc²", "P = F/S", "v = d/t"],
        ["299 792 458 m/s", "300 000 km/s", "3×10⁸ m/s", "Toutes ces réponses"],
        ["L'énergie ne peut être ni créée ni détruite, seulement transformée", "L'énergie diminue toujours dans un système isolé", "L'énergie augmente toujours dans un système isolé", "L'énergie reste constante uniquement dans le vide"],
        ["U = R×I", "P = U×I", "Q = I×t", "E = U×I×t"],
        ["Ec = (1/2)×m×v²", "Ep = m×g×h", "E = m×c²", "P = m×g"],
        ["Émission spontanée de rayonnements par un noyau instable", "Réaction chimique libérant de la chaleur", "Absorption d'énergie par un atome", "Transfert d'électrons entre atomes"],
        ["7", "0", "14", "Dépend de la température"],
        ["Modèle quantique", "Modèle de Bohr", "Modèle de Thomson", "Modèle de Rutherford"]
    ];

    // Mélanger les questions
    const shuffledQuestionIndices = shuffleArray([...Array(physicsQuestions.length).keys()]);

    for (let i = 0; i < count; i++) {
        const qIndex = shuffledQuestionIndices[i % shuffledQuestionIndices.length];
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let question = {
            id: `phys-q-${i+1}-${Math.random().toString(36).substring(2, 8)}`,
            text: physicsQuestions[qIndex],
            type: type,
            points: Math.floor(Math.random() * 3) + 1 // 1-3 points
        };

        if (type === 'multiple' || type === 'single') {
            question.options = [];
            // S'assurer que nous avons suffisamment d'options
            const optionsForQuestion = qIndex < physicsOptions.length
                ? physicsOptions[qIndex]
                : ["Option A", "Option B", "Option C", "Option D"];

            // Mélanger les options
            const shuffledOptions = shuffleArray([...optionsForQuestion]);

            for (let j = 0; j < shuffledOptions.length; j++) {
                question.options.push({
                    id: `option-${j+1}`,
                    text: shuffledOptions[j]
                });
            }

            if (type === 'multiple') {
                const correctCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 correct answers
                const correctIndices = [];
                while (correctIndices.length < correctCount) {
                    const idx = Math.floor(Math.random() * question.options.length);
                    if (!correctIndices.includes(idx)) {
                        correctIndices.push(idx);
                    }
                }
                question.correctAnswers = correctIndices.map(idx => question.options[idx].id);
            } else {
                // Single choice - first option is correct for simplicity
                question.correctAnswer = question.options[0].id;
            }
        } else if (type === 'true-false') {
            question.correctAnswer = Math.random() > 0.5 ? 'true' : 'false';
        }

        questions.push(question);
    }

    return shuffleArray(questions);
}

// Fonction pour générer des questions de biologie (SVT)
function generateBiologyQuestions(count) {
    const questions = [];
    const questionTypes = ['multiple', 'single', 'true-false'];
    const biologyQuestions = [
        "Quelle est la fonction principale des mitochondries?",
        "Quel est le rôle de l'ADN dans une cellule?",
        "Quelle est la différence entre une cellule procaryote et eucaryote?",
        "Qu'est-ce que la photosynthèse?",
        "Quels sont les composants du sang?",
        "Comment fonctionne le système immunitaire?",
        "Qu'est-ce qu'un écosystème?",
        "Quels sont les niveaux d'organisation du corps humain?",
        "Qu'est-ce que la méiose?",
        "Comment se fait la respiration cellulaire?",
        "Toutes les cellules d'un organisme contiennent exactement le même ADN.",
        "Les virus sont des organismes vivants à part entière.",
        "La photosynthèse transforme l'énergie lumineuse en énergie chimique.",
        "Tous les êtres vivants sont constitués de cellules.",
        "L'évolution agit toujours pour le bien de l'espèce."
    ];

    const biologyOptions = [
        ["Production d'énergie (ATP)", "Synthèse de protéines", "Stockage d'information génétique", "Digestion cellulaire"],
        ["Stocker l'information génétique", "Produire de l'énergie", "Transporter l'oxygène", "Digérer les nutriments"],
        ["Les cellules procaryotes n'ont pas de noyau défini, contrairement aux eucaryotes", "Les cellules procaryotes sont plus grandes que les eucaryotes", "Les cellules procaryotes ont plus d'organites", "Les cellules procaryotes ont toujours des chloroplastes"],
        ["Processus par lequel les plantes produisent de la matière organique à partir de lumière", "Processus de respiration des plantes", "Décomposition de la matière organique", "Reproduction des plantes"],
        ["Globules rouges, globules blancs, plaquettes et plasma", "Uniquement des globules rouges", "Eau, sels minéraux et protéines", "Lymphocytes et érythrocytes uniquement"],
        ["Il protège l'organisme contre les infections et maladies", "Il régule la température corporelle", "Il transporte l'oxygène dans le corps", "Il aide à la digestion des aliments"],
        ["Un ensemble formé par une communauté d'êtres vivants et son environnement", "Un lieu où vivent uniquement des animaux", "Une zone géographique spécifique", "Une espèce dominante dans un habitat"],
        ["Cellules, tissus, organes, systèmes, organisme", "Molécules, cellules, tissus, organes", "Systèmes, organes, tissus, cellules", "Atomes, molécules, cellules, organismes"],
        ["Division cellulaire produisant des cellules à n chromosomes", "Division cellulaire normale", "Réplication de l'ADN", "Fusion de deux cellules"],
        ["Conversion du glucose en énergie avec consommation d'oxygène", "Production de glucose à partir de CO2", "Échange de gaz entre les poumons et le sang", "Extraction d'énergie sans utiliser d'oxygène"]
    ];

    // Mélanger
    const shuffledQuestionIndices = shuffleArray([...Array(biologyQuestions.length).keys()]);

    for (let i = 0; i < count; i++) {
        const qIndex = shuffledQuestionIndices[i % shuffledQuestionIndices.length];
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let question = {
            id: `bio-q-${i+1}-${Math.random().toString(36).substring(2, 8)}`,
            text: biologyQuestions[qIndex],
            type: type,
            points: Math.floor(Math.random() * 3) + 1 // 1-3 points
        };

        if (type === 'multiple' || type === 'single') {
            question.options = [];
            // S'assurer que nous avons suffisamment d'options
            const optionsForQuestion = qIndex < biologyOptions.length
                ? biologyOptions[qIndex]
                : ["Option A", "Option B", "Option C", "Option D"];

            // Mélanger les options
            const shuffledOptions = shuffleArray([...optionsForQuestion]);

            for (let j = 0; j < shuffledOptions.length; j++) {
                question.options.push({
                    id: `option-${j+1}`,
                    text: shuffledOptions[j]
                });
            }

            if (type === 'multiple') {
                const correctCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 correct answers
                const correctIndices = [];
                while (correctIndices.length < correctCount) {
                    const idx = Math.floor(Math.random() * question.options.length);
                    if (!correctIndices.includes(idx)) {
                        correctIndices.push(idx);
                    }
                }
                question.correctAnswers = correctIndices.map(idx => question.options[idx].id);
            } else {
                // Single choice - first option is correct for simplicity
                question.correctAnswer = question.options[0].id;
            }
        } else if (type === 'true-false') {
            question.correctAnswer = Math.random() > 0.5 ? 'true' : 'false';
        }

        questions.push(question);
    }

    return shuffleArray(questions);
}

// Fonction pour générer des questions de philosophie
function generatePhilosophyQuestions(count) {
    const questions = [];
    const questionTypes = ['multiple', 'single', 'true-false'];
    const philosophyQuestions = [
        "Quelle est la principale différence entre la connaissance et la croyance selon Platon?",
        "Qu'est-ce que le scepticisme?",
        "Quelle est la conception de la liberté selon Jean-Paul Sartre?",
        "Comment Kant définit-il l'impératif catégorique?",
        "Qu'est-ce que le concept du surhomme chez Nietzsche?",
        "Quelle est la théorie des idées de Platon?",
        "Comment Descartes arrive-t-il à la conclusion 'Je pense, donc je suis'?",
        "Quelle est la conception de la justice selon Aristote?",
        "Qu'est-ce que le contrat social selon Rousseau?",
        "Comment Hegel conçoit-il l'Histoire?",
        "La philosophie de Socrate nous est connue principalement par ses écrits.",
        "Le principe de causalité affirme que tout effet a une cause.",
        "Selon Descartes, les connaissances issues des sens sont totalement fiables.",
        "Le déterminisme est compatible avec le libre arbitre selon certains philosophes.",
        "Pour Kant, on peut connaître les choses en soi (noumènes) telles qu'elles sont vraiment."
    ];

    const philosophyOptions = [
        ["La connaissance est justifiée et vraie, la croyance peut être fausse", "La connaissance est innée, la croyance est acquise", "La connaissance est divine, la croyance est humaine", "La connaissance est intelligible, la croyance est sensible"],
        ["Doctrine qui doute de la possibilité de connaître avec certitude", "Rejet de toute forme de connaissance", "Affirmation que rien n'existe", "Croyance que tout est relatif"],
        ["L'homme est condamné à être libre", "La liberté est une illusion", "La liberté est limitée par la société", "La liberté est déterminée par l'inconscient"],
        ["Principe moral universel applicable à tous", "Règle personnelle qu'on se fixe", "Loi divine révélée", "Principe variant selon les circonstances"],
        ["Un individu qui dépasse les valeurs traditionnelles", "Un être supérieur physiquement aux humains", "Le stade final de l'évolution humaine", "Un concept religieux"],
        ["Les idées sont des réalités éternelles dont les objets sensibles sont des copies", "Les idées sont des constructions mentales subjectives", "Les idées viennent toutes de l'expérience sensible", "Les idées sont des créations divines implantées dans l'esprit humain"],
        ["Par le doute méthodique qui ne peut éliminer l'existence de la pensée", "Par révélation divine", "Par observation empirique", "Par déduction mathématique pure"],
        ["Donner à chacun ce qui lui est dû selon son mérite", "L'égalité absolue entre tous", "La charité envers les plus faibles", "Le respect strict des lois"],
        ["Un accord entre les citoyens pour vivre en société", "Une imposition des lois par le plus fort", "Un concept théorique irréalisable", "Une relation entre Dieu et les hommes"],
        ["Comme un processus dialectique vers la liberté", "Comme une succession aléatoire d'événements", "Comme un éternel retour", "Comme une décadence continue"]
    ];

    // Mélanger
    const shuffledQuestionIndices = shuffleArray([...Array(philosophyQuestions.length).keys()]);

    for (let i = 0; i < count; i++) {
        const qIndex = shuffledQuestionIndices[i % shuffledQuestionIndices.length];
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        let question = {
            id: `philo-q-${i+1}-${Math.random().toString(36).substring(2, 8)}`,
            text: philosophyQuestions[qIndex],
            type: type,
            points: Math.floor(Math.random() * 3) + 1 // 1-3 points
        };

        if (type === 'multiple' || type === 'single') {
            question.options = [];
            // S'assurer que nous avons suffisamment d'options
            const optionsForQuestion = qIndex < philosophyOptions.length
                ? philosophyOptions[qIndex]
                : ["Option A", "Option B", "Option C", "Option D"];

            // Mélanger les options
            const shuffledOptions = shuffleArray([...optionsForQuestion]);

            for (let j = 0; j < shuffledOptions.length; j++) {
                question.options.push({
                    id: `option-${j+1}`,
                    text: shuffledOptions[j]
                });
            }

            if (type === 'multiple') {
                const correctCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 correct answers
                const correctIndices = [];
                while (correctIndices.length < correctCount) {
                    const idx = Math.floor(Math.random() * question.options.length);
                    if (!correctIndices.includes(idx)) {
                        correctIndices.push(idx);
                    }
                }
                question.correctAnswers = correctIndices.map(idx => question.options[idx].id);
            } else {
                // Single choice - first option is correct for simplicity
                question.correctAnswer = question.options[0].id;
            }
        } else if (type === 'true-false') {
            question.correctAnswer = Math.random() > 0.5 ? 'true' : 'false';
        }

        questions.push(question);
    }

    return shuffleArray(questions);
}