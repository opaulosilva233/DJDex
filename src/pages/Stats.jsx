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

export default function Stats({ sets }) {
	const { topDjs, setsPorFestival } = useMemo(() => {
		const contagemDjs = sets.reduce((accumulator, set) => {
			if (!set.nome) {
				return accumulator
				}

			const currentCount = accumulator.get(set.nome) ?? 0
			accumulator.set(set.nome, currentCount + 1)

			return accumulator
		}, new Map())

		const contagemFestivais = sets.reduce((accumulator, set) => {
			if (!set.festival) {
				return accumulator
			}

			const currentCount = accumulator.get(set.festival) ?? 0
			accumulator.set(set.festival, currentCount + 1)

			return accumulator
		}, new Map())

		const topDjs = Array.from(contagemDjs, ([name, quantidade]) => ({
			name,
			quantidade,
		})).sort((left, right) => {
			if (right.quantidade !== left.quantidade) {
				return right.quantidade - left.quantidade
			}

			return left.name.localeCompare(right.name, 'pt')
		})

		const setsPorFestival = Array.from(contagemFestivais, ([name, quantidade]) => ({
			name,
			quantidade,
		})).sort((left, right) => {
			if (right.quantidade !== left.quantidade) {
				return right.quantidade - left.quantidade
			}

			return left.name.localeCompare(right.name, 'pt')
		})

		return {
			topDjs,
			setsPorFestival,
		}
	}, [sets])

	return (
		<section style={{ display: 'grid', gap: '24px' }}>
			<div className="section-header">
				<p className="eyebrow">Análise</p>
				<h1>Estatísticas</h1>
				<p>
					Leitura detalhada da coleção, com destaque para os DJs mais vistos e a
					distribuição dos sets por festival.
				</p>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
					gap: '20px',
				}}
			>
				<section className="glass-card" style={{ padding: '24px' }}>
					<h2 style={{ marginBottom: '16px' }}>Top DJs</h2>
					<div style={{ width: '100%', height: '300px' }}>
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={topDjs}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" tick={{ fill: 'rgba(243, 244, 246, 0.8)' }} />
								<YAxis allowDecimals={false} tick={{ fill: 'rgba(243, 244, 246, 0.8)' }} />
								<Tooltip />
								<Bar dataKey="quantidade" fill="#7db3ff" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</section>

				<section className="glass-card" style={{ padding: '24px' }}>
					<h2 style={{ marginBottom: '16px' }}>Sets por Festival</h2>
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
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</section>
			</div>
		</section>
	)
}