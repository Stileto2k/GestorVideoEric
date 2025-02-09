import { useState, useEffect } from "react"
import { db } from "../utils/FirebaseConfig"
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import { FaPlus, FaList, FaTimes, FaVideo, FaUser, FaYoutube, FaInstagram } from "react-icons/fa"

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
  justify-content: center;
  align-items: flex-start;
`

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`

const FormHeader = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #6a0dad;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6a0dad;
    box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.1);
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6a0dad;
    box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.1);
  }
`

const SelectList = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6a0dad;
    box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.1);
  }
`

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: ${(props) => (props.primary ? "#6a0dad" : "#f5f5f5")};
  color: ${(props) => (props.primary ? "white" : "#6a0dad")};
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => (props.primary ? "#5a0b8d" : "#e5e5e5")};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.3);
  }
`

const NewListContainer = styled.div`
  margin-top: 1rem;
`

const NewListInput = styled.div`
  display: flex;
  margin-top: 1rem;
  gap: 1rem;
`

const PlatformSelector = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
`

const PlatformButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 2px solid ${(props) => (props.isSelected ? "#6a0dad" : "#ccc")};
  background-color: ${(props) => (props.isSelected ? "rgba(106, 13, 173, 0.1)" : "white")};
  color: ${(props) => (props.isSelected ? "#6a0dad" : "#333")};
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(106, 13, 173, 0.1);
  }

  svg {
    margin-right: 0.5rem;
  }
`

const AddVideoScreen = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [isInstagram, setIsInstagram] = useState(false)
  const [lists, setLists] = useState([])
  const [selectedList, setSelectedList] = useState("")
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState("")
  const auth = getAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    const userId = auth.currentUser?.uid
    if (userId) {
      const q = query(collection(db, "lists"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const listsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setLists(listsData)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      alert("Please enter a name for the list")
      return
    }

    try {
      const userId = auth.currentUser?.uid
      const newListRef = await addDoc(collection(db, "lists"), {
        userId,
        title: newListName,
        videos: [],
      })
      setNewListName("")
      setShowNewList(false)
      fetchLists()
      setSelectedList(newListRef.id)
    } catch (error) {
      console.error("Error creating the list:", error)
      alert("Error creating the list")
    }
  }

  const handleAddVideo = async () => {
    try {
      const userId = auth.currentUser?.uid
      if (!userId || !title || !description || !url) {
        alert("Please complete all fields.")
        return
      }

      let thumbnailUrl
      if (isInstagram) {
        thumbnailUrl = await getInstagramThumbnail(url)
      } else {
        thumbnailUrl = getYouTubeThumbnail(url)
      }

      if (!thumbnailUrl) {
        alert("The thumbnail could not be generated. Check the URL.")
        return
      }

      const currentDate = new Date()
      const videoData = {
        userId,
        title,
        description,
        url,
        platform: isInstagram ? "Instagram" : "YouTube",
        thumbnail: thumbnailUrl,
        date: currentDate.toISOString(),
      }

      // Añadir el video a la colección de videos
      const videoRef = await addDoc(collection(db, "videos"), videoData)
      const videoId = videoRef.id

      // Si hay una lista seleccionada, actualizar solo esa lista
      if (selectedList) {
        const listRef = doc(db, "lists", selectedList)
        const listDoc = await getDoc(listRef)

        if (listDoc.exists()) {
          const listData = listDoc.data()
          const updatedVideos = [
            ...(listData.videos || []),
            {
              ...videoData,
              id: videoId,
            },
          ]

          await updateDoc(listRef, {
            videos: updatedVideos,
          })
          alert("Video added successfully to the selected list!")
        } else {
          alert("The selected list does not exist.")
          return
        }
      } else {
        alert("Video added successfully, but not to any list.")
      }

      navigate("/my-videos")
    } catch (error) {
      console.error("Error adding video:", error)
      alert("Error adding video. Please try again.")
    }
  }

  const getYouTubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/)
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : null
  }

  const getInstagramThumbnail = async (url) => {
    try {
      const regex = /instagram\.com\/(?:p|reel)\/([^/?]+)/
      const match = url.match(regex)
      if (match && match[1]) {
        const postId = match[1]
        const response = await fetch(`https://api.instagram.com/oembed/?url=https://instagram.com/p/${postId}/`)
        const data = await response.json()
        if (data && data.thumbnail_url) {
          return data.thumbnail_url
        }
      }
    } catch (error) {
      console.error("Error getting Instagram thumbnail:", error)
    }
    return "default_thumbnail.jpg"
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
        <FormContainer>
          <FormHeader>Add new video</FormHeader>

          <InputField type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <InputField type="url" placeholder="Video URL" value={url} onChange={(e) => setUrl(e.target.value)} />

          <PlatformSelector>
            <PlatformButton type="button" isSelected={!isInstagram} onClick={() => setIsInstagram(false)}>
              <FaYoutube /> YouTube
            </PlatformButton>
            <PlatformButton type="button" isSelected={isInstagram} onClick={() => setIsInstagram(true)}>
              <FaInstagram /> Instagram
            </PlatformButton>
          </PlatformSelector>

          <SelectList value={selectedList} onChange={(e) => setSelectedList(e.target.value)}>
            <option value="">Select List (optional)</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </SelectList>

          <NewListContainer>
            <Button onClick={() => setShowNewList(!showNewList)}>
              {showNewList ? (
                <>
                  <FaTimes style={{ marginRight: "0.5rem" }} /> Cancel New List
                </>
              ) : (
                <>
                  <FaPlus style={{ marginRight: "0.5rem" }} /> Create New List
                </>
              )}
            </Button>
          </NewListContainer>

          {showNewList && (
            <NewListInput>
              <InputField
                type="text"
                placeholder="New List name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <Button onClick={handleCreateList} primary>
                <FaPlus style={{ marginRight: "0.5rem" }} /> Create List
              </Button>
            </NewListInput>
          )}

          <div>
            <Button onClick={handleAddVideo} primary>
              <FaPlus style={{ marginRight: "0.5rem" }} /> Add video
            </Button>
            <Button onClick={() => navigate("/my-videos")}>
              <FaTimes style={{ marginRight: "0.5rem" }} /> Cancel
            </Button>
          </div>
        </FormContainer>
      </MainContent>
    </PageLayout>
  )
}

export default AddVideoScreen

