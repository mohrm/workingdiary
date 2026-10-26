import type { Section } from './Section';

export type SectionValidationError = {
  type: 'end-before-start' | 'overlap';
  message: string;
};

export const SECTION_VALIDATION_ERROR_MESSAGES = {
  'end-before-start': 'Die Enduhrzeit darf nicht vor der Startuhrzeit liegen.',
  overlap:
    'Der Abschnitt überschneidet sich zeitlich mit einem anderen Abschnitt.',
} as const;

function overlaps(a: Section, b: Section): boolean {
  return (
    a.startTime.inMinutes() < b.endTime.inMinutes() &&
    b.startTime.inMinutes() < a.endTime.inMinutes()
  );
}

export function validateSection(
  section: Section,
  others: Section[],
): SectionValidationError | undefined {
  if (section.endTime.inMinutes() < section.startTime.inMinutes()) {
    return {
      type: 'end-before-start',
      message: SECTION_VALIDATION_ERROR_MESSAGES['end-before-start'],
    };
  }
  if (others.some((other) => overlaps(section, other))) {
    return {
      type: 'overlap',
      message: SECTION_VALIDATION_ERROR_MESSAGES.overlap,
    };
  }
  return undefined;
}
