import { useNavigate } from 'react-router-dom'

export default function GenerosList({ generos = [], handleDeleteGenero }) {
  const navigate = useNavigate()

  return (
    <section className="page-section flex-1 min-h-0 overflow-y-auto pr-1 bg-transparent">
      <div className="section-header flex items-center justify-between">
        <div>
          <p className="eyebrow dark:text-gray-400">Catálogo</p>
          <h1 className="dark:text-gray-100">Géneros</h1>
          <p className="dark:text-slate-300">Géneros disponíveis para associação aos DJs.</p>
        </div>
        <div>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => navigate('/generos/adicionar')}
          >
            Adicionar Género
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {generos.length === 0 && <p className="dark:text-slate-400">Ainda não existem géneros.</p>}
        <div className="rounded-2xl border border-slate-800/50 bg-slate-950/40 p-5 shadow-xl backdrop-blur-md">
          <ul>
            {generos.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-2">
                <div>
                  <strong className="dark:text-gray-100">{g.nome}</strong>
                </div>
                <div>
                  <button type="button" onClick={() => handleDeleteGenero && handleDeleteGenero(g.id)} className="text-red-600">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
