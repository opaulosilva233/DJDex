import DjCard from './components/DjCard'
import { djSets } from './data/mockData'

export default function App() {
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
