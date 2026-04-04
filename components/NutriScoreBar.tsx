'use client'

const GRADES = [
  { letter: 'A', color: '#1d8a5f' },
  { letter: 'B', color: '#6dba41' },
  { letter: 'C', color: '#f5c842' },
  { letter: 'D', color: '#e8860a' },
  { letter: 'E', color: '#d93025' },
]

const VALID_GRADES = ['A', 'B', 'C', 'D', 'E']

export default function NutriScoreBar({ grade }: { grade: string }) {
  const activeGrade = grade?.toUpperCase() || ''
  const hasValidGrade = VALID_GRADES.includes(activeGrade)

  return (
    <div>
      <div className="flex gap-1.5 w-full">
        {GRADES.map(({ letter, color }) => {
          const isActive = hasValidGrade && letter === activeGrade
          return (
            <div
              key={letter}
              className="flex-1 flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-300"
              style={{
                backgroundColor: isActive ? color : `${color}15`,
                color: isActive ? '#fff' : `${color}${hasValidGrade ? '60' : '25'}`,
                height: isActive ? 44 : 36,
                fontSize: isActive ? 16 : 13,
                boxShadow: isActive ? `0 0 16px ${color}30` : 'none',
                border: isActive ? `1px solid ${color}` : '1px solid transparent',
              }}
            >
              {letter}
            </div>
          )
        })}
      </div>
      {!hasValidGrade && (
        <p className="text-xs text-center mt-2" style={{ color: 'rgba(240,240,244,0.3)' }}>
          Nutri-Score not available for this product
        </p>
      )}
    </div>
  )
}
