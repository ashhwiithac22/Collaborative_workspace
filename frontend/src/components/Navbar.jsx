import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/dashboard">Dashboard</Link>
      <button onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }}>Logout</button>
    </nav>
  );
};

export default Navbar;