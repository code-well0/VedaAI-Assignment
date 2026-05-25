import { Assignment, Question, Section } from '../types';
import { buildSyllabusExcerpt } from './syllabusService';
import {
  buildSectionPlans,
  resolveQuizTopic,
  sanitizeQuestionText,
  extractSyllabusSeeds,
  questionFingerprint,
  isMcqType,
  isMcqFormat,
  isShortAnswerType,
  isDiagramType,
  isNumericalType,
} from './questionPaperPlan';
import { buildModelAnswerForQuestion } from './answerKeyBuilder';
import { buildTeacherIntroMessage } from './assignmentIntro';

const POOLS_BY_TYPE: Record<string, string[]> = {
  'Multiple Choice Questions': [
    'Pressure is defined as force per unit area. Which unit is used for pressure in SI? (a) Newton (b) Pascal (c) Joule (d) Watt',
    'A force of 20 N acts on an area of 4 m². What is the pressure? (a) 5 Pa (b) 80 Pa (c) 0.2 Pa (d) 24 Pa',
    'Which of these best describes a contact force? (a) Magnetic force (b) Gravitational pull of Earth (c) Friction between surfaces (d) Electrostatic force',
    'Atmospheric pressure at sea level is approximately: (a) 1 Pa (b) 101.3 kPa (c) 1000 kPa (d) 0.1 Pa',
    'When the area under a fixed force decreases, the pressure will: (a) Increase (b) Decrease (c) Stay zero (d) Become constant always',
    'Which instrument is commonly used to measure atmospheric pressure? (a) Ammeter (b) Barometer (c) Thermometer (d) Voltmeter',
    'Thrust is the: (a) Perpendicular force on a surface (b) Parallel force along a surface (c) Rate of change of mass (d) Unit of energy',
    'Liquid pressure at a point increases with: (a) Depth below the free surface (b) Height above the surface (c) Width of container only (d) Color of liquid',
  ],
  'Short Questions': [
    'Define force and state its SI unit.',
    'Define pressure. How is it related to force and area?',
    'Explain why sharp knives cut better than blunt ones using the concept of pressure.',
    'State two effects of force on an object.',
    'Why do school bags with wide straps feel more comfortable than thin straps?',
    'Differentiate between thrust and pressure.',
    'What is atmospheric pressure? Why do we not feel it on our bodies?',
    'Explain how liquid pressure depends on depth.',
  ],
  'Long Questions': [
    'Explain the concept of pressure with an example from daily life. Include the formula and unit.',
    'Describe how force and pressure are related. Solve a simple numerical using F = 20 N and A = 0.5 m².',
  ],
  'Diagram/Graph-Based Questions': [
    'Draw a labeled diagram of a liquid column showing how pressure increases with depth.',
    'Sketch a simple setup to demonstrate atmospheric pressure using a glass and card.',
    'Draw a diagram showing a block resting on a table and label thrust and area.',
  ],
  'Numerical Problems': [
    'A force of 150 N acts perpendicular to a surface of area 0.3 m². Calculate the pressure in pascals.',
    'Calculate the force required to produce a pressure of 200 Pa on an area of 0.25 m².',
    'A rectangular block weighing 400 N rests on a base of 0.08 m². Find the pressure on the base.',
    'Atmospheric pressure is 101300 Pa. Express it in kPa.',
    'A nail tip has area 0.00001 m². If hammering exerts 50 N, find the pressure at the tip.',
  ],
};

function buildMcqFromConcept(concept: string, variant: number): string {
  const stem = concept.replace(/\.$/, '').slice(0, 120);
  const options = [
    ['increases when area decreases', 'decreases when area decreases', 'is independent of area', 'is always zero'],
    ['force per unit area', 'area per unit force', 'mass per unit volume', 'distance per unit time'],
    ['acts perpendicular to surface', 'acts parallel to surface only', 'has no direction', 'is measured in joules'],
    ['depth below liquid surface', 'color of container', 'shape of container only', 'volume of air above'],
  ];
  const set = options[variant % options.length];
  return `${stem}? (a) ${set[0]} (b) ${set[1]} (c) ${set[2]} (d) ${set[3]}`;
}

function buildShortFromConcept(concept: string, variant: number): string {
  const prompts = [
    `Explain: ${concept.slice(0, 100)}`,
    `Define the key term used in the following idea and give one example: ${concept.slice(0, 90)}`,
    `Why is the following statement important in daily life? ${concept.slice(0, 95)}`,
    `List two points based on this concept: ${concept.slice(0, 90)}`,
  ];
  return prompts[variant % prompts.length];
}

function buildDiagramFromConcept(concept: string, variant: number): string {
  const verbs = ['Draw a labeled diagram', 'Sketch and label a diagram', 'Draw a neat diagram'];
  return `${verbs[variant % verbs.length]} to illustrate: ${concept.slice(0, 85)}`;
}

function buildNumericalFromConcept(concept: string, variant: number): string {
  const f = 50 + variant * 15;
  const a = 0.1 + variant * 0.05;
  const p = (f / a).toFixed(0);
  return `A force of ${f} N acts on an area of ${a.toFixed(2)} m². Calculate the pressure. (Expected value ≈ ${p} Pa) — based on: ${concept.slice(0, 60)}`;
}

function synthesizeByType(
  type: string,
  topic: string,
  variant: number,
  marks: number,
  syllabusSeeds: string[]
): string {
  const concept =
    syllabusSeeds[variant % Math.max(1, syllabusSeeds.length)] ||
    `key ideas about ${topic}`;

  if (isMcqType(type)) {
    return buildMcqFromConcept(concept, variant);
  }
  if (isShortAnswerType(type)) {
    return buildShortFromConcept(concept, variant);
  }
  if (type.toLowerCase().includes('long')) {
    return `Discuss in detail: ${concept.slice(0, 110)} Include definition, explanation, and one application.`;
  }
  if (isDiagramType(type)) {
    return buildDiagramFromConcept(concept, variant);
  }
  if (isNumericalType(type)) {
    return buildNumericalFromConcept(concept, variant);
  }
  if (type.toLowerCase().includes('fill in the blank')) {
    return `The SI unit of pressure is _____ and pressure equals force divided by _____.`;
  }
  if (type.toLowerCase().includes('true or false')) {
    const statements = [
      `True or False: Pressure increases when the same force acts on a smaller area.`,
      `True or False: Atmospheric pressure acts in all directions.`,
      `True or False: Liquid pressure is the same at all depths in a container.`,
    ];
    return statements[variant % statements.length];
  }
  if (type.toLowerCase().includes('match')) {
    return `Match Column A with Column B:\nColumn A: 1. Force 2. Pressure 3. Thrust 4. Pascal\nColumn B: (a) N/m² (b) Push on surface (c) SI unit of pressure (d) Pull or push`;
  }

  return `Write a ${marks}-mark response about ${topic}: ${concept.slice(0, 100)}`;
}

function pickUniqueForSection(
  assignment: Assignment,
  type: string,
  count: number,
  marks: number,
  topic: string,
  syllabusSeeds: string[],
  globalUsed: Set<string>
): string[] {
  const pool = [...(POOLS_BY_TYPE[type] || [])];
  const out: string[] = [];
  let variant = 0;

  const tryAdd = (raw: string): boolean => {
    const cleaned = sanitizeQuestionText(raw, topic, assignment);
    if (!cleaned || cleaned.length < 12) return false;
    if (isMcqType(type) && !isMcqFormat(cleaned)) return false;
    if (!isMcqType(type) && isMcqFormat(cleaned)) return false;

    const fp = questionFingerprint(cleaned);
    if (!fp || globalUsed.has(fp)) return false;

    globalUsed.add(fp);
    out.push(cleaned);
    return true;
  };

  while (out.length < count && pool.length > 0) {
    tryAdd(pool.shift()!);
  }

  while (out.length < count && variant < 60) {
    const candidate = synthesizeByType(type, topic, variant + out.length, marks, syllabusSeeds);
    tryAdd(candidate);
    variant++;
  }

  return out;
}

export function generateTopicAlignedMock(
  assignment: Assignment,
  syllabusText: string
): {
  aiResponseText: string;
  sections: Section[];
  answerKey: string;
} {
  const topic = resolveQuizTopic(assignment);
  const excerpt = buildSyllabusExcerpt(syllabusText, 500);
  const syllabusSeeds = extractSyllabusSeeds(syllabusText, topic, 50);
  const plans = buildSectionPlans(assignment.questionTypes);
  const answers: string[] = [];
  const globalUsed = new Set<string>();
  let globalQ = 1;

  const DIFFICULTIES: Question['difficulty'][] = ['Easy', 'Moderate', 'Hard'];

  const sections: Section[] = plans.map((plan) => {
    const texts = pickUniqueForSection(
      assignment,
      plan.type,
      plan.count,
      plan.marks,
      topic,
      syllabusSeeds,
      globalUsed
    );

    const questions: Question[] = texts.map((text, i) => ({
      text,
      difficulty: DIFFICULTIES[i % 3],
      marks: plan.marks,
    }));

    questions.forEach((q) => {
      answers.push(buildModelAnswerForQuestion(globalQ, plan.type, q.text, plan.marks));
      globalQ++;
    });

    return {
      title: plan.title,
      instruction: plan.instruction,
      questions,
    };
  });

  return {
    aiResponseText: buildTeacherIntroMessage(assignment),
    sections,
    answerKey: answers.join('\n\n'),
  };
}
