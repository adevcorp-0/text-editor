import logo from './logo.svg';
import './App.css';
import { Layout } from './components/layout';
import { EditPanel } from './components/EditPanel';
function App() {
  return (
    <Layout>
      <EditPanel />
    </Layout>
  );
}

export default App;
