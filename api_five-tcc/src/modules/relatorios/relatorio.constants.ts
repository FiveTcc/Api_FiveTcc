// Mapeia os valores aceitos no filtro (minúsculos) para os valores
// reais salvos no banco (capitalizados), evitando que a query nunca bata.
export const STATUS_MAP: Record<string, string> = {
  aberta: 'Aberta',
  'em andamento': 'Em andamento',
  concluida: 'Concluida',
  cancelada: 'Cancelada',
};

export const PRIORIDADE_MAP: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
};
