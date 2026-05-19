import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar'
import AddSetPage from './pages/AddSetPage'
import Home from './pages/Home'
import SetList from './pages/SetList'
import Stats from './pages/Stats'
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

  function handleImportData(importedSets) {
    setSets(importedSets)
  }

  function handleEditSet(updatedSet) {
    setSets((currentSets) =>
      currentSets.map((set) => (set.id === updatedSet.id ? updatedSet : set)),
    )
  }

  function handleDeleteSet(id) {
    setSets((currentSets) => currentSets.filter((set) => set.id !== id))
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Navbar sets={sets} handleImportData={handleImportData} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
          <Routes>
            <Route path="/" element={<Home sets={sets} />} />
            <Route
              path="/lista"
              element={<SetList sets={sets} onDeleteSet={handleDeleteSet} />}
            />
            <Route path="/estatisticas" element={<Stats sets={sets} />} />
            <Route
              path="/adicionar"
              element={<AddSetPage handleAddSet={handleAddSet} />}
            />
            <Route
              path="/editar/:id"
              element={
                <AddSetPage
                  sets={sets}
                  handleAddSet={handleAddSet}
                  handleEditSet={handleEditSet}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
