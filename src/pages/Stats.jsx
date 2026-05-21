import { useMemo } from 'react'
import {
	Bar,
	BarChart,
	Cell,
	CartesianGrid,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

const pieColors = ['#7db3ff', '#5dd6c0', '#f7b267', '#f28482', '#cdb4db', '#90be6d']

export default function Stats({ sets, djs = [], festivais = [] }) {
	const { topDjs, setsPorFestival } = useMemo(() => {
		const contagemDjs = sets.reduce((accumulator, set) => {
			const dj = djs.find((entry) => entry.id === set.djId)

			if (!dj) {
				return accumulator
			}

			const currentCount = accumulator.get(dj.id) ?? { name: dj.nome, quantidade: 0 }
			accumulator.set(dj.id, {
				name: dj.nome,
				quantidade: currentCount.quantidade + 1,
			})

			return accumulator
		}, new Map())

		const contagemFestivais = sets.reduce((accumulator, set) => {
			const festival = festivais.find((entry) => entry.id === set.festivalId)

			if (!festival) {
				return accumulator
			}

			const currentCount = accumulator.get(festival.id) ?? { name: festival.nome, quantidade: 0 }
			accumulator.set(festival.id, {
				name: festival.nome,
				quantidade: currentCount.quantidade + 1,
			})

			return accumulator
		}, new Map())

		const topDjs = Array.from(contagemDjs.values()).sort((left, right) => {
			if (right.quantidade !== left.quantidade) {
				return right.quantidade - left.quantidade
			}

			return left.name.localeCompare(right.name, 'pt')
		})

		const setsPorFestival = Array.from(contagemFestivais.values()).sort((left, right) => {
			if (right.quantidade !== left.quantidade) {
				return right.quantidade - left.quantidade
			}

			return left.name.localeCompare(right.name, 'pt')
		})

		return {
			topDjs,
			setsPorFestival,
		}
	}, [sets, djs, festivais])

	return (
		<section className="page-section h-full w-full min-h-0 flex flex-col overflow-hidden bg-transparent" style={{ display: 'grid', gap: '24px' }}>
			<div className="section-header shrink-0">
				<p className="eyebrow dark:text-gray-400">Análise</p>
				<h1 className="dark:text-gray-100">Estatísticas</h1>
				<p className="dark:text-slate-300">
					Leitura detalhada da coleção, com destaque para os DJs mais vistos e a
					distribuição dos sets por festival.
				</p>
			</div>

			<div
				className="flex-1 min-h-0 overflow-y-auto pr-1"
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
					gap: '20px',
				}}
			>
				<section className="min-h-0 rounded-2xl border border-slate-800/50 bg-slate-950/40 p-6 shadow-xl backdrop-blur-md" style={{ padding: '24px' }}>
					<h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-gray-100">Top DJs</h2>
					<div style={{ width: '100%', height: '300px' }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={topDjs}>
								<CartesianGrid strokeDasharray="3 3" stroke="#475569" />
								<XAxis dataKey="name" tick={{ fill: '#9ca3af' }} stroke="#64748b" />
								<YAxis allowDecimals={false} tick={{ fill: '#9ca3af' }} stroke="#64748b" />
								<Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }} itemStyle={{ color: '#f8fafc' }} />
								<Bar dataKey="quantidade" fill="#7db3ff" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</section>

				<section className="min-h-0 rounded-2xl border border-slate-800/50 bg-slate-950/40 p-6 shadow-xl backdrop-blur-md" style={{ padding: '24px' }}>
					<h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-gray-100">Sets por Festival</h2>
					<div style={{ width: '100%', height: '300px' }}>
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={setsPorFestival}
									dataKey="quantidade"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={100}
									label
								>
									{setsPorFestival.map((entry, index) => (
										<Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
									))}
								</Pie>
								<Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }} itemStyle={{ color: '#f8fafc' }} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</section>
			</div>
		</section>
	)
}