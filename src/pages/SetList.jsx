import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function SetList({ sets, djs = [], festivais = [], generos = [], onDeleteSet }) {
	const navigate = useNavigate()
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
		<section className="page-section flex-1 min-h-0 overflow-y-auto pr-1 bg-transparent">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Sets Gravados</h1>
					<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Todos os sets atualmente carregados na aplicação.</p>
				</div>
				<button
					type="button"
					className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
					onClick={() => navigate('/adicionar')}
				>
					<Plus size={16} />
					<span>Adicionar Set</span>
				</button>
			</div>

			<div className="grid gap-3 mb-6 md:grid-cols-2">
				<input
					type="text"
					placeholder="Procurar DJ ou festival"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					className="rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-950/30 backdrop-blur-md px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
				/>
				<input
					type="number"
					min="0"
					max="10"
					placeholder="Avaliação mínima"
					value={minRating}
					onChange={(event) => setMinRating(Number(event.target.value))}
					className="rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-slate-950/30 backdrop-blur-md px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
				/>
			</div>

			<div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden p-2">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse bg-transparent">
						<thead className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200/30 dark:border-white/5">
							<tr>
								<th className="px-6 py-4 text-left">DJ</th>
								<th className="px-6 py-4 text-left">Festival</th>
								<th className="px-6 py-4 text-left">Data</th>
								<th className="px-6 py-4 text-left">Hora</th>
								<th className="px-6 py-4 text-left">Avaliação</th>
								<th className="px-6 py-4 text-left">Ações</th>
							</tr>
						</thead>
						<tbody>
							{filteredSets.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
										Nenhum set encontrado para os filtros aplicados.
									</td>
								</tr>
							) : (
								filteredSets.map((set) => {
									const dj = djs.find((entry) => entry.id === set.djId)
									const festival = festivais.find((entry) => entry.id === set.festivalId)
									const djGeneros = Array.isArray(dj?.generoIds)
										? dj.generoIds
											.map((generoId) => generos.find((genero) => genero.id === generoId)?.nome)
											.filter(Boolean)
										: []

									return (
										<tr
											key={set.id}
											className="hover:bg-purple-600/5 dark:hover:bg-purple-500/5 border-b border-slate-100/50 dark:border-white/5 last:border-0 transition-colors"
										>
											<td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
												<div className="flex flex-col">
													<span className="font-semibold text-slate-900 dark:text-white">{dj?.nome ?? 'DJ desconhecido'}</span>
													{djGeneros.length > 0 && (
														<span className="text-xs text-slate-500 dark:text-slate-400">{djGeneros.join(' · ')}</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{festival?.nome ?? 'Festival desconhecido'}</td>
											<td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{set.data || '-'}</td>
											<td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{set.hora || '-'}</td>
											<td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
												<span className="font-semibold text-amber-500">{Number(set.avaliacao ?? 0).toFixed(1)}</span>
											</td>
											<td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">
												<div className="flex items-center gap-2">
													<button
														type="button"
														onClick={() => navigate(`/sets/editar/${set.id}`)}
														className="text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors"
														aria-label={`Editar set de ${dj?.nome ?? 'DJ'}`}
													>
														<Pencil size={16} />
													</button>
													<button
														type="button"
														onClick={() => onDeleteSet(set.id)}
														className="text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors"
														aria-label={`Eliminar set de ${dj?.nome ?? 'DJ'}`}
													>
														<Trash2 size={16} />
													</button>
												</div>
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}