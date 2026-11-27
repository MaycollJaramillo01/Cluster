// Misiones autocorregibles. El equipo las escribe como texto en la lección:
//
// Quiz (bloques separados por una línea en blanco; * marca la correcta):
//   ¿Qué mide el CTR?
//   - Ventas
//   * Clics sobre impresiones
//   - Seguidores
//
// Checklist (todas las casillas para aprobar):
//   [ ] Publiqué el anuncio
//   [ ] Guardé la captura
//
// La corrección es determinista y ocurre solo en el servidor: el navegador nunca recibe las respuestas.

export type Mission =
  | { kind: 'quiz'; questions: { prompt: string; options: string[]; answer: number }[] }
  | { kind: 'checklist'; items: string[] }
  | { kind: 'assignment'; instructions: string };

// Nombres que ve el equipo al crear actividades (temario, editor de clase y selector).
export const MISSION_LABELS: Record<Mission['kind'], string> = {
  checklist: 'Lista de pasos',
  quiz: 'Cuestionario autocorregible',
  assignment: 'Tarea con entrega escrita',
};

const CHECK = /^\[\s?\]\s*/;

export function parseMission(raw: string): { mission: Mission | null; errors: string[] } {
  const assignment = /^\[tarea\](?:\r?\n|$)/i.exec(raw.trimStart());
  if (assignment) {
    const instructions = raw.trimStart().slice(assignment[0].length).trim();
    return instructions && instructions.length <= 6000
      ? { mission: { kind: 'assignment', instructions }, errors: [] }
      : { mission: null, errors: ['La tarea necesita instrucciones de hasta 6000 caracteres.'] };
  }
  const lines = raw.replace(/\r/g, '').split('\n').map((line) => line.trim());
  if (!lines.some(Boolean)) return { mission: null, errors: [] };

  if (lines.some((line) => CHECK.test(line))) {
    const items = lines.filter((line) => CHECK.test(line)).map((line) => line.replace(CHECK, '')).filter(Boolean);
    return items.length ? { mission: { kind: 'checklist', items }, errors: [] } : { mission: null, errors: ['La checklist no tiene casillas con texto.'] };
  }

  const errors: string[] = [];
  const questions: { prompt: string; options: string[]; answer: number }[] = [];
  const blocks = lines.join('\n').split(/\n{2,}/).map((block) => block.split('\n').filter(Boolean)).filter((block) => block.length);
  blocks.forEach((block, index) => {
    const prompt = block.filter((line) => !/^[-*]\s/.test(line)).join(' ');
    const options = block.filter((line) => /^[-*]\s/.test(line));
    const correct = options.filter((line) => line.startsWith('*'));
    if (!prompt || options.length < 2 || correct.length !== 1) {
      errors.push(`Pregunta ${index + 1}: necesita enunciado, al menos 2 opciones y exactamente una marcada con *.`);
      return;
    }
    questions.push({
      prompt,
      options: options.map((line) => line.replace(/^[-*]\s+/, '')),
      answer: options.findIndex((line) => line.startsWith('*')),
    });
  });
  if (errors.length || !questions.length) return { mission: null, errors: errors.length ? errors : ['El quiz no tiene preguntas.'] };
  return { mission: { kind: 'quiz', questions }, errors: [] };
}

// Lo que ve el alumno: sin la respuesta correcta.
export function publicMission(mission: Mission) {
  if (mission.kind !== 'quiz') return mission;
  return { kind: 'quiz' as const, questions: mission.questions.map(({ prompt, options }) => ({ prompt, options })) };
}

export function gradeMission(mission: Exclude<Mission, { kind: 'assignment' }>, read: (key: string) => string) {
  if (mission.kind === 'checklist') {
    const correct = mission.items.filter((_, index) => read(`item${index}`) === '1').length;
    return { correct, total: mission.items.length, passed: correct === mission.items.length };
  }
  const correct = mission.questions.filter((question, index) => read(`q${index}`) === String(question.answer)).length;
  return { correct, total: mission.questions.length, passed: correct === mission.questions.length };
}

export function levelFor(xp: number) {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}
