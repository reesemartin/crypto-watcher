import './App.css'
import Header from './Header';
import MainContent from './MainContent';

function App() {
  return (
    <div className="h-full">
      <div className="h-full flex flex-col">
        <Header />
        <div className="h-full">
          <MainContent />
        </div>
      </div>
    </div>
  )
}

export default App
