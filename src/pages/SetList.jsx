import { useState } from 'react'

import DjCard from '../components/DjCard'

export default function SetList({ sets, onDeleteSet }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [minRating, setMinRating] = useState(0)

  const filteredSets = sets.filter((set) => {
    const matchesName = set.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = Number(set.avaliacao ?? 0) >= minRating

    return matchesName && matchesRating
  })

	return (
		<section className="page-section">
			<div className="section-header">
				<p className="eyebrow">Biblioteca</p>
				<h1>Lista de DJs</h1>
				<p>Todos os sets atualmente carregados na aplicação.</p>
			</div>

			<div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
				<input
					type="text"
					placeholder="Procurar DJ pelo nome"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
				/>
				<input
					type="number"
					min="0"
					max="10"
					placeholder="Avaliação mínima"
					value={minRating}
					onChange={(event) => setMinRating(Number(event.target.value))}
				/>
			</div>

			<div className="sets-grid">
				{filteredSets.map((set) => (
					<DjCard key={set.id} set={set} onDelete={onDeleteSet} />
				))}
			</div>
		</section>
	)
}