"use client";

const codeLines = [
  "import { Student } from '@hva/sit';",
  "const events = await fetchEvents();",
  "interface Member { name: string; role: Role; }",
  "export async function register(id: string) {",
  "  const member = new Student(id);",
  "  await db.insert(members).values(member);",
  "  return { success: true, member };",
  "}",
  "// TODO: add more pizza",
  "type Event = 'borrel' | 'workshop' | 'hackathon';",
  "const sit = new Vereniging({ jaar: 'XI' });",
  "for (const event of events) {",
  "  await event.notify(members);",
  "}",
  "def train_model(data: pd.DataFrame):",
  "    X = data.drop('target', axis=1)",
  "    model = RandomForest(n_estimators=100)",
  "    return model.fit(X, y)",
  "SELECT * FROM events WHERE date > NOW();",
  "console.log('Welcome to {SIT}');",
];

export default function CodeBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 font-mono text-[11px] leading-[2.2] text-white whitespace-nowrap"
        style={{ opacity: 0.04 }}
      >
        {Array.from({ length: 3 }).map((_, col) => (
          <div
            key={col}
            className="absolute"
            style={{
              left: `${20 + col * 35}%`,
              top: 0,
              bottom: 0,
            }}
          >
            {codeLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            {codeLines.map((line, i) => (
              <div key={`dup-${i}`}>{line}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
