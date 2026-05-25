import {
  isMcqType,
  isMcqFormat,
  isShortAnswerType,
  isDiagramType,
  isNumericalType,
} from './questionPaperPlan';

const MCQ_ANSWER_HINTS: [RegExp, string][] = [
  [/conductor.*Copper|Copper.*conductor/i, '(c) Copper — metals are good conductors; rubber, glass, and wood are insulators.'],
  [/pressure in SI|unit.*pressure.*Pascal/i, '(b) Pascal (Pa) — SI unit of pressure; N is force, J is energy, W is power.'],
  [/20 N.*4 m|4 m².*pressure/i, '(a) 5 Pa — Pressure = F/A = 20/4 = 5 Pa.'],
  [/contact force.*Friction/i, '(c) Friction — acts when surfaces touch; gravity and magnetism can act at a distance.'],
  [/atmospheric pressure.*sea level/i, '(b) 101.3 kPa — standard atmospheric pressure at sea level.'],
  [/area.*decreases.*pressure|fixed force.*area/i, '(a) Increase — P = F/A; smaller area means greater pressure for same force.'],
  [/Barometer/i, '(b) Barometer — measures atmospheric pressure.'],
  [/Thrust/i, '(a) Perpendicular force on a surface — thrust is the force acting normally on a surface.'],
  [/liquid pressure.*depth/i, '(a) Depth below the free surface — pressure in liquids increases with depth.'],
];

function inferMcqAnswer(questionText: string): string {
  for (const [pattern, answer] of MCQ_ANSWER_HINTS) {
    if (pattern.test(questionText)) {
      return `Correct answer: ${answer}`;
    }
  }
  return 'Correct answer: Identify the option that matches the definition or calculation in the question. Explain why the other three options are incorrect (1–2 sentences each).';
}

function buildNumericalSolution(text: string, marks: number): string {
  const forceMatch = text.match(/force of (\d+(?:\.\d+)?)\s*N/i);
  const areaMatch = text.match(/area of (\d+(?:\.\d+)?)\s*m/i);
  if (forceMatch && areaMatch) {
    const f = parseFloat(forceMatch[1]);
    const a = parseFloat(areaMatch[1]);
    const p = (f / a).toFixed(2);
    return (
      `Solution:\n` +
      `Formula: Pressure P = F / A\n` +
      `Given: F = ${f} N, A = ${a} m²\n` +
      `P = ${f} / ${a} = ${p} Pa\n` +
      `Final answer: ${p} Pa (${marks} mark${marks > 1 ? 's' : ''} for correct formula, working, and unit).`
    );
  }

  const calcMatch = text.match(/(\d+(?:\.\d+)?)\s*N.*(\d+(?:\.\d+)?)\s*m/);
  if (calcMatch) {
    return `Solution: Apply P = F/A with the given values. Show substitution, calculate the result, and state the answer in pascals (Pa). Award ${marks} mark${marks > 1 ? 's' : ''} for complete working.`;
  }

  return `Solution: Write the relevant formula, substitute given values, show all calculation steps, and state the final answer with correct SI units. (${marks} mark${marks > 1 ? 's' : ''})`;
}

export function buildModelAnswerForQuestion(
  questionNumber: number,
  type: string,
  questionText: string,
  marks: number
): string {
  const header = `${questionNumber}.`;

  if (isMcqType(type) && isMcqFormat(questionText)) {
    return `${header} ${inferMcqAnswer(questionText)}`;
  }

  if (isShortAnswerType(type)) {
    return (
      `${header} Model answer (${marks} mark${marks > 1 ? 's' : ''}):\n` +
      `Give a clear definition or explanation addressing the question directly. ` +
      `Include two key points or one example. ` +
      `Award full marks for accurate terminology and a complete 3–5 sentence response.\n` +
      `Reference: ${questionText.slice(0, 120)}${questionText.length > 120 ? '…' : ''}`
    );
  }

  if (type.toLowerCase().includes('long')) {
    return (
      `${header} Model answer (${marks} mark${marks > 1 ? 's' : ''}):\n` +
      `Introduction: State the main concept.\n` +
      `Body: Explain the process with cause–effect, include a labelled example or diagram reference, and link to real-life application.\n` +
      `Conclusion: Summarise the importance or outcome.\n` +
      `Marking: 1 mark for definition, 2 for explanation, 1 for example/application (adjust for ${marks} total).`
    );
  }

  if (isDiagramType(type)) {
    return (
      `${header} Expected diagram (${marks} mark${marks > 1 ? 's' : ''}):\n` +
      `• Draw a neat, labelled diagram as asked in the question.\n` +
      `• Required labels: all parts mentioned in the question (e.g. force, area, direction arrows, liquid levels).\n` +
      `• Marking: 1 mark for correct shape/setup, 1 for labels, remaining marks for accuracy and clarity.`
    );
  }

  if (isNumericalType(type)) {
    return `${header} ${buildNumericalSolution(questionText, marks)}`;
  }

  if (type.toLowerCase().includes('true or false')) {
    const isTrue = /increases when the same force|acts in all directions/i.test(questionText);
    const verdict = isTrue ? 'True' : 'False';
    return (
      `${header} Answer: ${verdict}.\n` +
      `Explanation: Provide a scientifically correct reason in 2–3 sentences supporting ${verdict}. (${marks} mark${marks > 1 ? 's' : ''})`
    );
  }

  if (type.toLowerCase().includes('fill in the blank')) {
    return (
      `${header} Blanks: (1) pascal / Pa  (2) area (or force — as appropriate).\n` +
      `Pressure = force ÷ area. Award ${marks} mark${marks > 1 ? 's' : ''} per correct blank with correct spelling.`
    );
  }

  if (type.toLowerCase().includes('match')) {
    return (
      `${header} Correct matching:\n` +
      `1–(b), 2–(a), 3–(c), 4–(d) — Force → Push/pull; Pressure → N/m²; Thrust → Push on surface; Pascal → SI unit.\n` +
      `Award ${marks} mark${marks > 1 ? 's' : ''} for each correct pair.`
    );
  }

  return (
    `${header} Model answer (${marks} mark${marks > 1 ? 's' : ''}):\n` +
    `Provide a complete, accurate response covering all parts of the question. ` +
    `Award full marks for correct concepts, clear explanation, and proper use of terms.`
  );
}
