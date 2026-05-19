import { useEffect, useState } from 'react'

import AddSetForm from './components/AddSetForm'
import DjCard from './components/DjCard'
import { djSets } from './data/mockData'

export default function App() {
  const [sets, setSets] = useState(() => {
    if (typeof window === 'undefined') {
      return djSets
    }

    const storedSets = window.localStorage.getItem('ravedex_sets')

    if (!storedSets) {
      return djSets
    }

    try {
      const parsedSets = JSON.parse(storedSets)
      return Array.isArray(parsedSets) ? parsedSets : djSets
    } catch {
      return djSets
    }
  })

  useEffect(() => {
    window.localStorage.setItem('ravedex_sets', JSON.stringify(sets))
  }, [sets])

  function handleAddSet(novoSet) {
    setSets((currentSets) => [novoSet, ...currentSets])
  }

  return (
    <main className="app-shell" style={{ padding: '24px' }}>
      <section className="hero" style={{ marginBottom: '24px' }}>
        <p className="eyebrow">DJDex</p>
        <h1>RaveDex 🎧</h1>
        <p>
          Explora os sets, festivais e horários dos DJs num formato simples e
          visual.
        </p>
      </section>

      <AddSetForm onAddSet={handleAddSet} />

      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {djSets.map((set) => (
          <DjCard key={set.id} set={set} />
        ))}
      </section>
    </main>
  )
}
