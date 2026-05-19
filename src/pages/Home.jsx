import { Link } from 'react-router-dom'

export default function Home({ sets }) {
	return (
		<div className="page-section">
			<section className="section-header">
				<p className="eyebrow">DJDex</p>
				<h1>Bem-vindo ao DJDex</h1>
				<p>
					Guarda os teus sets, consulta a lista completa e entra na área de
					estatísticas para análises mais profundas.
				</p>
			</section>

			<section className="action-grid">
				<Link className="action-card" to="/lista">
					<span>Ver Lista</span>
					<small>Consultar todos os DJs guardados</small>
				</Link>
				<Link className="action-card" to="/estatisticas">
					<span>Estatísticas</span>
					<small>Explorar gráficos e métricas avançadas</small>
				</Link>
				<Link className="action-card" to="/adicionar">
					<span>Adicionar Set</span>
					<small>Registar um novo set na coleção</small>
				</Link>
			</section>
		</div>
	)
}