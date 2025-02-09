"use client"

import { useState, useEffect } from "react"
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc
} from "firebase/firestore"
import { db, auth } from "../utils/FirebaseConfig"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { FaPlus, FaList, FaVideo, FaUser } from "react-icons/fa"

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

const Header = styled.h1`
  color: white;
  margin-bottom: 2rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
`

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`

const CardImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`

const CardContent = styled.div`
  padding: 1rem;
  text-align: center;
`

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #6a0dad;
  margin-bottom: 0.5rem;
`

const CardText = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
`

const Button = styled.button`
  background: ${(props) => (props.primary ? "#6a0dad" : "#ff66b2")};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.8;
    background: ${(props) => (props.primary ? "#5a0b8d" : "#ff4d94")};
  }
`

const EmptyState = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: white;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
`

const ListsScreen = () => {
  const [lists, setLists] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const userId = auth.currentUser?.uid
      if (userId) {
        const q = query(collection(db, "lists"), where("userId", "==", userId))
        const querySnapshot = await getDocs(q)
        const userLists = querySnapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
          videos: doc.data().videos || [] // Aseguramos que siempre haya un array de videos
        }))
        setLists(userLists)
      }
    } catch (error) {
      console.error("Error fetching lists:", error)
      alert("Error loading lists. Please try again.")
    }
  }

  const handleDeleteList = async (listId) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        // Simplemente eliminamos la lista sin preocuparnos por los videos
        const listRef = doc(db, "lists", listId)
        await deleteDoc(listRef)
        
        // Actualizamos el estado local
        setLists((prevLists) => prevLists.filter((list) => list.id !== listId))
        
        alert("List deleted successfully!")
      } catch (error) {
        console.error("Error deleting list:", error)
        alert("Could not delete the list. Please try again.")
      }
    }
  }

  const handleViewList = (list) => {
    navigate("/list-detail", { state: { list } })
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
          <FaUser style={{ marginRight: "0.5rem" }} /> My Profile
        </NavItem>
      </Sidebar>
      <MainContent>
        <Header>My Lists</Header>
        <Grid>
          {lists.map((list) => (
            <Card key={list.id}>
              <CardImage
                src={list.videos?.[0]?.thumbnail || "/placeholder.svg"}
                alt={`${list.title} thumbnail`}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/placeholder.svg"
                }}
              />
              <CardContent>
                <CardTitle>{list.title}</CardTitle>
                <Button primary onClick={() => handleViewList(list)}>
                  View List
                </Button>
                <Button onClick={() => handleDeleteList(list.id)}>
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </Grid>
        {lists.length === 0 && (
          <EmptyState>
            <h2>No Lists Yet</h2>
            <p>Create your first list by adding a new video!</p>
          </EmptyState>
        )}
      </MainContent>
    </PageLayout>
  )
}

export default ListsScreen
