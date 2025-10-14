import type { WorkoutPlan, ExerciseCategory } from './types';

export const XP_PER_CATEGORY: Record<ExerciseCategory, number> = {
  'Warmup': 5,
  'Strength': 15,
  'Core': 20,
  'Compound': 25,
  'Cardio': 30,
};

export const MISSION_XP_AMOUNTS: number[] = [10, 25, 50, 100, 500, 800, 1000];

export const PREDEFINED_AVATARS: string[] = [
  'https://xsgames.co/randomusers/assets/avatars/male/74.jpg',
  'https://xsgames.co/randomusers/assets/avatars/female/74.jpg',
  'https://xsgames.co/randomusers/assets/avatars/male/1.jpg',
  'https://xsgames.co/randomusers/assets/avatars/female/1.jpg',
  'https://xsgames.co/randomusers/assets/avatars/male/25.jpg',
  'https://xsgames.co/randomusers/assets/avatars/female/25.jpg',
  'https://xsgames.co/randomusers/assets/avatars/male/50.jpg',
  'https://xsgames.co/randomusers/assets/avatars/female/50.jpg',
  'https://xsgames.co/randomusers/assets/avatars/pixel/10.jpg',
  'https://xsgames.co/randomusers/assets/avatars/pixel/15.jpg',
  'https://xsgames.co/randomusers/assets/avatars/bot/1.jpg',
  'https://xsgames.co/randomusers/assets/avatars/bot/10.jpg',
];

export const MOTIVATIONAL_QUOTES: string[] = [
    "A dor que você sente hoje é a força que você sentirá amanhã.",
    "O corpo alcança o que a mente acredita.",
    "Não se trata de ser o melhor. Trata-se de ser melhor do que você era ontem.",
    "A disciplina é a ponte entre metas e realizações.",
    "A única má sessão de treino é aquela que não aconteceu.",
    "A força não vem da capacidade física. Vem de uma vontade indomável.",
    "Seus limites são apenas um ponto de partida.",
    "Um passo de cada vez. Um soco de cada vez. Uma rodada de cada vez.",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "Transforme a dor em poder."
];

export const PLAYER_TITLES: { level: number; name: string }[] = [
    { level: 1, name: "Iniciante" },
    { level: 5, name: "Aspirante" },
    { level: 10, name: "Guerreiro" },
    { level: 20, name: "Gladiador" },
    { level: 30, name: "Herói" },
    { level: 40, name: "Lenda" },
    { level: 50, name: "Titã" },
    { level: 60, name: "Semideus" },
    { level: 75, name: "Divindade" },
    { level: 90, name: "Ascendente" },
    { level: 110, name: "Celestial" },
    { level: 130, name: "Imortal" },
    { level: 150, name: "Primordial" },
];


export const workoutPlan: WorkoutPlan = {
  "objectives": [
    "Construir um físico musculoso, definido e simétrico, com ênfase no 'V-Type' para costas e ombros, usando calistenia e TRX."
  ],
  "resources": [
    "Barra fixa de porta (ajustável)",
    "Chão",
    "Corda",
    "TRX (Suspension Trainer)"
  ],
  "schedule": {
    "training_days": "Segunda, Quarta, Sexta (Força Calistênica Pura)",
    "cardio_core_days": "Terça, Quinta (Abdominal + Cardio)",
    "time_slot": "Após as 18:30",
    "meal_timing": "Almoço às 11:30, Jantar/Pós-treino às 19:00 (com lanche pré-treino opcional)"
  },
  "general_principles": [
    "Aquecimento (5-10 minutos antes de cada treino)",
    "Forma é Prioridade",
    "Progressão (aumentar repetições, séries, dificuldade; usar TRX para instabilidade)",
    "Descanso entre Séries: 60-90 segundos para força",
    "Descanso: Sábado e Domingo (ativo ou total)",
    "Hidratação e Nutrição"
  ],
  "legend": {
    "series_x_repetitions": "Número de séries x número de repetições.",
    "f": "Falha (máximo de repetições com boa forma).",
    "trx_note": "Indica uso do equipamento TRX. Ajuste o comprimento das alças e a inclinação do corpo para variar a dificuldade (quanto mais horizontal, mais difícil)."
  },
  "weekly_plan": [
    {
      "week": "Semana 1: Fundação Otimizada com TRX",
      "days": [
        {
          "day": "Segunda",
          "focus": "FORÇA (Parte Superior do Corpo: Puxadas e Empurradas)",
          "exercises": [
            {"name": "Aquecimento", "sets": 1, "reps_time": "5-10 min", "notes": "Polichinelos, rotações de braço, alongamento dinâmico leve.", "category": "Warmup"},
            {"name": "**TRX Flexões (TRX Push-ups)**", "sets": 3, "reps_time": "8-12", "notes": "Mãos nas alças do TRX, corpo inclinado. Ajuste a inclinação para variar a dificuldade (mais em pé = mais fácil, mais inclinado = mais difícil). Foca mais na estabilidade e peitoral.", "category": "Compound"},
            {"name": "**TRX Remada (TRX Rows)**", "sets": 3, "reps_time": "8-12", "notes": "Segure as alças, corpo inclinado para trás. Puxe o corpo em direção às mãos. Ótimo para costas e bíceps. Mais horizontal = mais difícil.", "category": "Compound"},
            {"name": "Flexões Diamante (Diamond Push-ups)", "sets": 3, "reps_time": "6-10", "notes": "Foca mais no tríceps e parte interna do peito. Se difícil, faça nos joelhos.", "category": "Strength"},
            {"name": "**TRX Elevação Lateral (TRX Lateral Raise)**", "sets": 3, "reps_time": "12-15", "notes": "Segure uma alça com uma mão, use a outra para apoio leve se precisar. Incline o corpo lateralmente. Trabalha ombros e core. Unilateral para simetria.", "category": "Strength"},
            {"name": "**TRX Prancha (TRX Plank)**", "sets": 3, "reps_time": "30-45 seg", "notes": "Pés nas alças do TRX, corpo reto, mãos no chão. A instabilidade do TRX força muito mais o core.", "category": "Core"}
          ]
        },
        {
          "day": "Terça",
          "focus": "CARDIO E CORE (Leve)",
          "exercises": [
            {"name": "Aquecimento", "sets": 1, "reps_time": "5-10 min", "notes": "Polichinelos, rotações de tronco.", "category": "Warmup"},
            {"name": "Pular Corda", "sets": 1, "reps_time": "20 min", "notes": "Ritmo constante. Se precisar, faça breves pausas de 10-15 segundos.", "category": "Cardio"},
            {"name": "Abdominais Pura (Crunches)", "sets": 3, "reps_time": "15-20", "notes": "Levante apenas ombros e cabeça, contraindo o abdômen.", "category": "Core"},
            {"name": "Elevação de Pernas (Leg Raises)", "sets": 3, "reps_time": "12-15", "notes": "Pernas estendidas, desça lentamente sem tocar o chão.", "category": "Core"},
            {"name": "Prancha Lateral (Side Plank)", "sets": 3, "reps_time": "20-30 seg/lado", "notes": "Apoie-se em um antebraço e lateral do pé, corpo reto.", "category": "Core"}
          ]
        },
        {
          "day": "Quarta",
          "focus": "FORÇA (Pernas e Core)",
          "exercises": [
            {"name": "Aquecimento", "sets": 1, "reps_time": "5-10 min", "notes": "Rotações de quadril, agachamentos leves.", "category": "Warmup"},
            {"name": "**TRX Agachamento (TRX Squats)**", "sets": 3, "reps_time": "12-15", "notes": "Segure as alças do TRX para assistência e profundidade. Permite maior amplitude e foco na forma. Ou para adicionar dificuldade em Pistol Squats (segurando com uma mão).", "category": "Compound"},
            {"name": "**TRX Afundo (TRX Lunges) ou Agachamento Búlgaro no TRX**", "sets": 3, "reps_time": "10-12/perna", "notes": "Coloque um pé na alça do TRX atrás de você. A instabilidade força muito mais os estabilizadores da perna e glúteos. Ótimo para simetria.", "category": "Compound"},
            {"name": "Elevação de Panturrilha (Calf Raises)", "sets": 3, "reps_time": "20-25", "notes": "Suba nas pontas, segure 1 seg.", "category": "Strength"},
            {"name": "Ponte de Glúteos (Glute Bridge)", "sets": 3, "reps_time": "15-20", "notes": "Contraia glúteos no topo.", "category": "Strength"},
            {"name": "Rotação Russa (Russian Twists - sem peso)", "sets": 3, "reps_time": "15-20/lado", "notes": "Tronco inclinado, gire. Pés elevados para maior dificuldade.", "category": "Core"}
          ]
        },
        {
          "day": "Quinta",
          "focus": "CARDIO E CORE (Leve)",
          "exercises": [
            {"name": "Aquecimento", "sets": 1, "reps_time": "5-10 min", "notes": "", "category": "Warmup"},
            {"name": "Pular Corda", "sets": 1, "reps_time": "20 min", "notes": "", "category": "Cardio"},
            {"name": "Abdominal Oblíquo (Bicycle Crunches)", "sets": 3, "reps_time": "12-15/lado", "notes": "", "category": "Core"},
            {"name": "Abdominal Infra (Reverse Crunches)", "sets": 3, "reps_time": "12-15", "notes": "Levante os quadris.", "category": "Core"},
            {"name": "**TRX Pike ou Crunches (Pés no TRX)**", "sets": 3, "reps_time": "10-12", "notes": "Pés nas alças do TRX, mãos no chão (posição de prancha). Puxe os joelhos em direção ao peito (crunches) ou levante o quadril (pike). Desafio intenso para o core.", "category": "Core"}
          ]
        },
        {
          "day": "Sexta",
          "focus": "FORÇA (Corpo Total e Progressão com Barra Fixa/TRX)",
          "exercises": [
            {"name": "Aquecimento", "sets": 1, "reps_time": "5-10 min", "notes": "", "category": "Warmup"},
            {"name": "Barra Fixa (Pull-ups ou Negative Pull-ups)", "sets": 3, "reps_time": "Até F (ou 5-8 reps)", "notes": "Foco na amplitude completa para costas largas.", "category": "Compound"},
            {"name": "**TRX Flexões (Pés no TRX - Elevadas)**", "sets": 3, "reps_time": "10-15", "notes": "Pés nas alças do TRX, mãos no chão. Mais difícil que as flexões tradicionais e excelente para ativar ombros e peito. Aumenta a amplitude e instabilidade.", "category": "Compound"},
            {"name": "**TRX Agachamento Búlgaro ou Afundo Unilateral**", "sets": 3, "reps_time": "8-10/perna", "notes": "A perna de trás no TRX intensifica o desafio de estabilidade e força unilateral.", "category": "Compound"},
            {"name": "**TRX Remada Unilateral (Single Arm TRX Row)**", "sets": 3, "reps_time": "8-10/lado", "notes": "Segure apenas uma alça. Permite focar em cada lado das costas individualmente, corrigindo assimetrias e aumentando a força. Fundamental para o V-Type simétrico.", "category": "Compound"},
            {"name": "Elevação de Pernas na Barra (Hanging Leg Raises)", "sets": 3, "reps_time": "8-12", "notes": "Pendurado, eleve as pernas.", "category": "Core"},
            {"name": "Ponte de Glúteos Unilateral (Single-Leg Glute Bridge)", "sets": 3, "reps_time": "10-12/perna", "notes": "", "category": "Strength"}
          ]
        },
        {
          "day": "Sábado",
          "focus": "Descanso",
          "exercises": []
        },
        {
          "day": "Domingo",
          "focus": "Descanso",
          "exercises": []
        }
      ]
    }
  ],
  "instructions_for_weeks_2_4_progression": [
    "Para cada exercício:",
    "Priorize: Aumentar o número de repetições (ex: se fez 8, tente 10-12; se fez 12, tente 15).",
    "Depois: Aumentar o número de séries (ex: de 3 para 4).",
    "Em seguida: Diminuir o tempo de descanso entre as séries (ex: de 90 segundos para 60 segundos).",
    "Por fim (e mais importante para calistenia/TRX): Mudar para uma **variação mais difícil** do exercício quando o atual ficar muito fácil. Com o TRX, isso significa mais inclinação (corpo mais horizontal), menos pontos de apoio ou movimentos unilaterais.",
    "Registro de Treino: Anote suas repetições e séries após cada exercício para acompanhar seu progresso. Isso é fundamental!",
    "Escute seu corpo: Mantenha a forma correta e não force se sentir dor (distinta da queimação muscular)."
  ]
};