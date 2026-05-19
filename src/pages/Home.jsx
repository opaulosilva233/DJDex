import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

export default function Home({ sets }) {
	const { totalSets, mediaAvaliacao, setsPorFestival } = useMemo(() => {
		const totalSets = sets.length
		const ratedSets = sets.filter(
			(set) => set.avaliacao !== null && set.avaliacao !== undefined,
		)

		const totalAvaliacoes = ratedSets.reduce(
			(sum, set) => sum + Number(set.avaliacao),
			0,
		)
		const mediaAvaliacao =
			ratedSets.length === 0 ? 0 : totalAvaliacoes / ratedSets.length

		const contagemPorFestival = sets.reduce((accumulator, set) => {
			if (!set.festival) {
				return accumulator
			}

			const currentCount = accumulator.get(set.festival) ?? 0
			accumulator.set(set.festival, currentCount + 1)

			return accumulator
		}, new Map())

		const setsPorFestival = Array.from(contagemPorFestival, ([name, quantidade]) => ({
			name,
			quantidade,
		}))

		return {
			totalSets,
			mediaAvaliacao,
			setsPorFestival,
		}
	}, [sets])

	return (
		<div style={{ display: 'grid', gap: '24px' }}>
			<section>
				<p className="eyebrow">DJDex</p>
				<h1>Dashboard de Estatísticas</h1>
				<p>
					Resumo rápido dos sets guardados, com a distribuição por festival e a
					média das avaliações.
				</p>
			</section>

			<section
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
					gap: '16px',
				}}
			>
				<div className="glass-card">
					<p className="card-label">Total de Sets</p>
					<strong className="card-value">{totalSets}</strong>
				</div>
				<div className="glass-card">
					<p className="card-label">Média de Avaliações</p>
					<strong className="card-value">{mediaAvaliacao.toFixed(1)}/10</strong>
				</div>
			</section>

			<section className="glass-card" style={{ padding: '24px' }}>
				<h2 style={{ marginTop: 0 }}>Sets por Festival</h2>
				<div style={{ width: '100%', height: '300px' }}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={setsPorFestival}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis allowDecimals={false} />
							<Tooltip />
							<Bar dataKey="quantidade" fill="#8884d8" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</section>

			<section className="action-grid">
				<Link className="action-card" to="/lista">
					<span>Ver Lista</span>
					<small>Consultar todos os DJs guardados</small>
				</Link>
				<Link className="action-card" to="/adicionar">
					<span>Adicionar Set</span>
					<small>Registar um novo set na coleção</small>
				</Link>
			</section>
		</div>
	)
}