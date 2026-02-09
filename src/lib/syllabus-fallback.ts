import { SyllabusOutput } from "@/ai/flows/syllabus-generator";

/**
 * Provides a high-quality fallback syllabus when AI generation fails.
 * Designed to be deterministic and zero-dependency.
 */
export function getFallbackSyllabus(query: string): SyllabusOutput {
  console.log(`[SyllabusFallback] Serving fallback syllabus for query: ${query}`);

  // Base syllabus bank for common subjects
  const syllabusBank: Record<string, Partial<SyllabusOutput>> = {
    "Mathematics": {
      title: "General Mathematics Syllabus",
      structure: `1. Algebra
   - Linear equations and inequalities
   - Quadratic equations
   - Polynomials and factoring
2. Geometry
   - Points, lines, and planes
   - Triangles and polygons
   - Circles and area/volume
3. Trigonometry
   - Trigonometric ratios
   - Identities and equations
4. Calculus (Basics)
   - Limits and continuity
   - Introduction to derivatives`,
      strategy: "Week 1-2: Master Algebra fundamentals. Week 3: Transition to Geometry. Week 4: Final review of Trigonometry and Calculus basics.",
      references: [
        "https://www.khanacademy.org/math",
        "https://en.wikipedia.org/wiki/Mathematics",
        "https://www.wolframalpha.com/",
        "https://brilliant.org/",
        "https://www.mathway.com/"
      ]
    },
    "Biology": {
      title: "General Biology Syllabus",
      structure: `1. Cell Biology
   - Cell structure and function
   - Cell membrane and transport
2. Genetics
   - DNA and RNA structure
   - Mendelian inheritance
3. Evolution
   - Natural selection
   - Evidence for evolution
4. Human Physiology
   - Major organ systems
   - Homeostasis`,
      strategy: "Focus on understanding cellular processes first, then move to genetics and evolution. Use diagrams to study physiology.",
      references: [
        "https://www.nature.com/scitable",
        "https://www.khanacademy.org/science/biology",
        "https://en.wikipedia.org/wiki/Biology",
        "https://www.biologysimulations.com/",
        "https://www.biointeractive.org/"
      ]
    }
  };

  const normalizedQuery = query.toLowerCase();
  const matchedKey = Object.keys(syllabusBank).find(
    k => normalizedQuery.includes(k.toLowerCase()) || k.toLowerCase().includes(normalizedQuery)
  );

  const baseSyllabus = matchedKey ? syllabusBank[matchedKey] : {
    title: `Syllabus for ${query}`,
    structure: "1. Introduction to the subject\n2. Core principles and theories\n3. Practical applications and case studies\n4. Advanced topics and current trends",
    strategy: "Break your study into 4 phases, focusing on understanding the basics before moving to advanced applications. Spend at least 2 hours daily on active recall.",
    references: [
      "https://en.wikipedia.org/wiki/Main_Page",
      "https://www.khanacademy.org/",
      "https://www.coursera.org/",
      "https://www.edx.org/",
      "https://ocw.mit.edu/"
    ]
  };

  return {
    title: baseSyllabus.title!,
    structure: baseSyllabus.structure!,
    strategy: baseSyllabus.strategy!,
    references: baseSyllabus.references!,
    isFallback: true
  } as SyllabusOutput & { isFallback: boolean };
}
