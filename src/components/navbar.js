import { Link, useNavigate } from "react-router-dom"
import { auth } from "../utils/FirebaseConfig"
import styled from "styled-components"

const NavbarContainer = styled.nav`
  background-color: #6a0dad;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`

const UserInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

const UserEmail = styled.span`
  color: #f0f0f0;
`

const LogoutButton = styled.button`
  background-color: #ff66b2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff4d94;
  }
`

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <NavbarContainer>
      <NavContent>
        <NavLinks>
          <NavLink to="/my-videos">Mis Videos</NavLink>
          <NavLink to="/add-video">Añadir Video</NavLink>
          <NavLink to="/lists">Mis Listas</NavLink>
        </NavLinks>
        <UserInfo>
          <UserEmail>{auth.currentUser?.email}</UserEmail>
          <LogoutButton onClick={handleLogout}>Cerrar Sesión</LogoutButton>
        </UserInfo>
      </NavContent>
    </NavbarContainer>
  )
}

export default Navbar

