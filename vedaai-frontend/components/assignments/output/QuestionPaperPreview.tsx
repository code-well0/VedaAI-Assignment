'use client';

import { Assignment } from '@/lib/store';
import { formatSubjectLabel } from '@/lib/subjectUtils';
import { formatMarksLabel, stripEmbeddedMarksFromText } from '@/lib/questionDisplay';

interface QuestionPaperPreviewProps {
  assignment: Assignment;
}

function sectionLabel(instruction: string, title: string): string {
  const first = instruction.split('.')[0]?.trim();
  return first || title;
}

// Difficulty shown inline as [Easy], [Moderate] → [Medium], [Hard] → [Hard]
function difficultyLabel(d: string): string {
  if (d === 'Easy') return 'Easy';
  if (d === 'Hard') return 'Hard';
  return 'Moderate';
}

export default function QuestionPaperPreview({ assignment }: QuestionPaperPreviewProps) {
  let globalQNum = 1;
  const sections = assignment.sections || [];

  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-y-auto"
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        lineHeight: '1.7',
        color: '#1F2937',
        padding: '48px 56px',
      }}
    >
      {/* ── HEADER ── */}
      <div className="text-center mb-5">
        <h1 style={{ fontWeight: 700, fontSize: '18px', lineHeight: '1.3', marginBottom: '4px' }}>
          {assignment.schoolName || 'Delhi Public School, Sector-4, Bokaro'}
        </h1>
        <p style={{ fontWeight: 400, fontSize: '14px', marginBottom: '2px' }}>
          Subject: {formatSubjectLabel(assignment.subject || '') || '—'}
        </p>
        <p style={{ fontWeight: 400, fontSize: '14px', marginBottom: '2px' }}>
          Class: {assignment.className || '5th'}
        </p>
        {(assignment.quizTopic || assignment.title) && (
          <p style={{ fontWeight: 600, fontSize: '14px', marginTop: '6px' }}>
            Chapter: {assignment.quizTopic || assignment.title}
          </p>
        )}
        {assignment.teacherName && (
          <p style={{ fontWeight: 400, fontSize: '13px', marginTop: '4px', color: '#4B5563' }}>
            Faculty: {assignment.teacherName}
          </p>
        )}
      </div>

      {/* ── TIME / MARKS ROW ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 400,
          marginBottom: '14px',
        }}
      >
        <span>Time Allowed: 45 minutes</span>
        <span>Maximum Marks: {assignment.totalMarks || 20}</span>
      </div>

      {/* ── GENERAL INSTRUCTION ── */}
      <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>
        All questions are compulsory unless stated otherwise.
      </p>

      {/* ── STUDENT FIELDS (stacked vertically like the image) ── */}
      <div style={{ marginBottom: '24px' }}>
        {[
          { label: 'Name:', width: '180px' },
          { label: 'Roll Number:', width: '140px' },
          { label: `Class: ${assignment.className || ''} Section:`, width: '100px' },
        ].map(({ label, width }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '6px',
              marginBottom: '6px',
              fontSize: '13px',
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
            <span
              style={{
                display: 'inline-block',
                width,
                borderBottom: '1px solid #9CA3AF',
                minHeight: '18px',
              }}
            />
          </div>
        ))}
      </div>

      {/* ── SECTIONS ── */}
      {sections.length === 0 ? (
        <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '24px 0' }}>
          No questions generated yet.
        </p>
      ) : (
        sections.map((section, sIdx) => {
          const label = sectionLabel(section.instruction, section.title);
          return (
            <div key={sIdx} style={{ marginBottom: '28px' }}>
              {/* Section title — centered, bold */}
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  textAlign: 'center',
                  marginBottom: '10px',
                  letterSpacing: '0.01em',
                }}
              >
                {section.title}
              </h2>

              {/* Section subtitle — left-aligned, bold */}
              <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>
                {label}
              </p>

              {/* Section instruction — left-aligned, italic */}
              <p
                style={{
                  fontStyle: 'italic',
                  fontSize: '12px',
                  color: '#4B5563',
                  marginBottom: '12px',
                }}
              >
                {section.instruction}
              </p>

              {/* Questions */}
              <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.questions.map((question, qIdx) => {
                  const qNum = globalQNum++;
                  return (
                    <li
                      key={qIdx}
                      style={{
                        position: 'relative',
                        marginBottom: '10px',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        paddingRight: '5.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 400 }}>
                        {qNum}. [{difficultyLabel(question.difficulty)}]{' '}
                      </span>
                      {stripEmbeddedMarksFromText(question.text)}
                      <span
                        style={{
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                          whiteSpace: 'nowrap',
                          color: '#374151',
                          fontWeight: 400,
                        }}
                      >
                        {formatMarksLabel(question.marks)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })
      )}

      {/* ── END OF QUESTION PAPER ── */}
      <p style={{ fontWeight: 700, fontSize: '13px', marginTop: '16px', marginBottom: '32px' }}>
        End of Question Paper
      </p>

      {/* ── ANSWER KEY ── */}
      {assignment.answerKey && (
        <div
          style={{
            borderTop: '1px dashed #D1D5DB',
            paddingTop: '24px',
            marginTop: '8px',
          }}
        >
          <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
            Answer Key
          </h3>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '14px' }}>
            Complete marking scheme — one detailed answer per question.
          </p>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {assignment.answerKey.split('\n\n').map((ans, idx) => {
              const match = ans.match(/^(\d+\.)\s*([\s\S]*)/);
              if (match) {
                return (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                      marginBottom: '10px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                    }}
                  >
                    <span style={{ fontWeight: 400, minWidth: '20px', flexShrink: 0 }}>
                      {match[1]}
                    </span>
                    <span style={{ color: '#374151', whiteSpace: 'pre-wrap' }}>
                      {match[2].trim()}
                    </span>
                  </li>
                );
              }
              return (
                <li key={idx} style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                  {ans}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
