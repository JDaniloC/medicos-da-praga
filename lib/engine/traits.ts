// Descrição PÚBLICA do traço (sem modificadores ocultos), exibida na seleção.
export interface TraitInfo {
  id: string;
  nome: string;
  descricao: string;
  // prompt de imagem para gerar o retrato persistente do protagonista.
  retratoPrompt: string;
  inventarioInicial: string[];
}

export const TRAITS: Record<string, TraitInfo> = {
  druida: {
    id: "druida",
    nome: "Druida Aprendiz",
    descricao:
      "Devoto de Eir, a deusa da cura. Confia em rituais, amuletos e ervas mais do que na ciência. Carrega poções de ervas.",
    retratoPrompt:
      "retrato de um jovem druida curandeiro do século XIV (19-22 anos), vestes de couro e linho gastos, amuletos de osso e ervas secas penduradas, capuz de lã, olhar sereno e cansado, pele suja da estrada",
    inventarioInicial: ["pocoes_ervas"],
  },
  academico: {
    id: "academico",
    nome: "Acadêmico Curioso",
    descricao:
      "Mente brilhante e observadora, recém-saído dos bancos de estudo. Tem o estômago fraco diante do horror.",
    retratoPrompt:
      "retrato de um jovem estudioso de medicina do século XIV (19-22 anos), túnica acadêmica simples, rosto pálido e atento, mãos manchadas de tinta, expressão curiosa porém tensa",
    inventarioInicial: [],
  },
  soldado: {
    id: "soldado",
    nome: "Soldado",
    descricao:
      "Veterano de trincheira que virou médico de campo. Frio sob pressão. Carrega uma espada curta.",
    retratoPrompt:
      "retrato de um jovem veterano de guerra do século XIV (19-22 anos) agora médico de campo, cicatriz no rosto, jaqueta acolchoada de combate sob o avental, olhar duro e calmo, espada curta no cinto",
    inventarioInicial: ["espada_curta"],
  },
  religioso: {
    id: "religioso",
    nome: "Religioso",
    descricao:
      "Devoto fervoroso da Fé do Altíssimo. Busca a moralidade e o conforto da alma em meio à carnificina.",
    retratoPrompt:
      "retrato de um jovem clérigo-médico do século XIV (19-22 anos), hábito modesto de lã, crucifixo de madeira ao peito, rosto piedoso e grave, mãos postas",
    inventarioInicial: [],
  },
};

export const TRAIT_LIST: TraitInfo[] = Object.values(TRAITS);
