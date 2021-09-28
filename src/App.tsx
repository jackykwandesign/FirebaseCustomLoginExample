import { 
  BrowserRouter as Router,
  Switch as RouterSwitch,
  Route
} from "react-router-dom";
import Home from "./pages/Home";
import Login from './pages/Login';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        header
      </header>
      <div>
        <Router>
          <RouterSwitch>
            <Route path="/" exact={true} component={Home} />
            <Route path="/login" component={Login} />
          </RouterSwitch>
        </Router>
      </div>
    </div>
  );
}

export default App;
