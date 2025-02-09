"use client"

import { useState, useEffect } from "react"
import { signOut } from "firebase/auth"
import { auth } from "../utils/FirebaseConfig"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { FaUser, FaSignOutAlt, FaPlus, FaList, FaVideo } from "react-icons/fa"

const PageLayout = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #6a0dad, #ff66b2);
`

const Sidebar = styled.div`
  width: 250px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  color: white;
`

const Logo = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 2rem;
`

const NavItem = styled.div`
  margin-bottom: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: underline;
  }
`

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const UserCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`

const UserInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #6a0dad;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem;
`

const UserName = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
`

const UserEmail = styled.p`
  font-size: 1rem;
  color: #666;
`

const Button = styled.button`
  background-color: ${(props) => (props.primary ? "#6a0dad" : "#ff66b2")};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
  }
`

const UserScreen = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        navigate("/")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (!user) {
    return null // or a loading spinner
  }

  return (
    <PageLayout>
      <Sidebar>
        <Logo>Video Manager</Logo>
        <NavItem onClick={() => navigate("/my-videos")}>
          <FaVideo style={{ marginRight: "0.5rem" }} /> My videos
        </NavItem>
        <NavItem onClick={() => navigate("/add-video")}>
          <FaPlus style={{ marginRight: "0.5rem" }} /> Add video
        </NavItem>
        <NavItem onClick={() => navigate("/lists")}>
          <FaList style={{ marginRight: "0.5rem" }} /> My lists
        </NavItem>
        <NavItem onClick={() => navigate("/user")}>
          <FaUser style={{ marginRight: "0.5rem" }} /> My profile
        </NavItem>
      </Sidebar>
      <MainContent>
        <UserCard>
          <UserInfo>
            <Avatar>
              <FaUser size={50} color="white" />
            </Avatar>
            <UserName>{user.displayName || "Usuario"}</UserName>
            <UserEmail>{user.email}</UserEmail>
          </UserInfo>
          <Button onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: "0.5rem" }} /> Log out
          </Button>
        </UserCard>
      </MainContent>
    </PageLayout>
  )
}

export default UserScreen

