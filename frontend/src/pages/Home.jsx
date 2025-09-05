const Home = ({ onNavigate }) => {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Welcome to Collaborative Workspace</h1>
        <p>Your coding projects will appear here soon!</p>
        <button 
          onClick={() => onNavigate('login')}
          className="auth-button"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default Home