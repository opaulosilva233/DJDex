import { useState } from 'react'

import DjCard from '../components/DjCard'

export default function SetList({ sets, djs = [], festivais = [], generos = [], onDeleteSet }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [minRating, setMinRating] = useState(0)

  const filteredSets = sets.filter((set) => {
		const dj = djs.find((entry) => entry.id === set.djId)
		const festival = festivais.find((entry) => entry.id === set.festivalId)
		const search = searchTerm.toLowerCase()
		const matchesName = (dj?.nome ?? '').toLowerCase().includes(search) || (festival?.nome ?? '').toLowerCase().includes(search)
    const matchesRating = Number(set.avaliacao ?? 0) >= minRating

    return matchesName && matchesRating
  })

	return (
		<section className="page-section flex-1 min-h-0 overflow-y-auto pr-1">
			<div className="section-header">
				<p className="eyebrow dark:text-gray-400">Biblioteca</p>
				<h1 className="dark:text-gray-100">Lista de DJs</h1>
				<p className="dark:text-slate-300">Todos os sets atualmente carregados na aplicação.</p>
			</div>

			<div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
				<input
					type="text"
					placeholder="Procurar DJ pelo nome"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-gray-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder:text-slate-400"
				/>
				<input
					type="number"
					min="0"
					max="10"
					placeholder="Avaliação mínima"
					value={minRating}
					onChange={(event) => setMinRating(Number(event.target.value))}
					className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-gray-900 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder:text-slate-400"
				/>
			</div>

			<div className="sets-grid">
				{filteredSets.map((set) => (
					<DjCard key={set.id} set={set} djs={djs} festivais={festivais} generos={generos} onDelete={onDeleteSet} />
				))}
			</div>
		</section>
	)
}