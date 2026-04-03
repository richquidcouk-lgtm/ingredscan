'use client'

const GRADES = [
  { letter: 'A', color: '#1d8a5f' },
  { letter: 'B', color: '#6dba41' },
  { letter: 'C', color: '#f5c842' },
  { letter: 'D', color: '#e8860a' },
  { letter: 'E', color: '#d93025' },
]

export default function NutriScoreBar({ grade }: { grade: string }) {
  const activeGrade = grade?.toUpperCase() || ''

  return (
    <div className="flex gap-1.5 w-full">
      {GRADES.map(({ letter, color }) => {
        const isActive = letter === activeGrade
        return (
          <div
            key={letter}
            className="flex-1 flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-300"
            style={{
              backgroundColor: isActive ? color : `${color}20`,
              color: isActive ? '#fff' : `${color}80`,
              height: isActive ? 44 : 36,
              fontSize: isActive ? 16 : 13,
            }}
          >
            {letter}
          </div>
        )
      })}
    </div>
  )
}
