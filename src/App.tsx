import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DocPage } from './pages/DocPage';
import { Home } from './pages/Home';

/** HashRouter: funciona em hospedagem estática (GitHub Pages) mesmo ao recarregar qualquer página. */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lab/:id" element={<DocPage kind="lab" />} />
          <Route path="ref/:id" element={<DocPage kind="ref" />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
