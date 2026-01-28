import './App.css';
import Main from './components/Main';
import ScrollToTop from './components/ScrollToTop';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <ScrollToTop />
      <Main />
    </HelmetProvider>
  );
}

export default App;
