import logo from './logo.svg';
import './App.css';
import { Layout } from './components/layout';
import EditPanel from './components/EditPanel';
import BezierDemo from './components/BezierDemo';
import MirrorHandles from './components/MirrorHandles';
import BezierHandles from './components/BezierHandles';
import SplitBezier from './components/SplitBezier';
import MirrorHandlesRect from './components/MirrorHandlesRect';
import WarpedTextEditor from './components/WarpedTextEditor';
import WarpedTextSVG from './components/WarpedTextSVG';
import WarpedText from './components/WarpedText';
import WarppingText from './components/WarppingText';
import WarpedTextEditor_Execersize from './components/WPT_Execersie';
function App() {
  return (
    <Layout>
      <WarpedTextEditor_Execersize />
    </Layout>
  );
}

export default App;
