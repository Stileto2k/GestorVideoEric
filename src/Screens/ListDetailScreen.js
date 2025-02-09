import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../utils/FirebaseConfig"
import { collection, query, where, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { FaPlay, FaTrash, FaPlus, FaList, FaVideo, FaUser } from "react-icons/fa"
import ReactPlayer from "react-player"
import styled from "styled-components"
import instagramLogo from "../components/instagram.jpeg"

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

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
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
  height: 200px;
  object-fit: cover;
`

const CardContent = styled.div`
  padding: 1rem;
`

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
`

const Button = styled.button`
  background: ${(props) => (props.primary ? "#6a0dad" : "#ff66b2")};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    opacity: 0.8;
  }
`

const VideoPlayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 9999;
`

const CloseButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
`

const PlayerWrapper = styled.div`
  width: 80%;
  max-width: 540px;
  max-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const InstagramEmbed = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 125%;
  position: relative;
  background: white;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
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

const ListDetailPage = () => {
  const [videos, setVideos] = useState([])
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const auth = getAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const userId = auth.currentUser?.uid
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId))
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVideos(videoList)
      })
      return () => unsubscribe()
    }
  }, [auth.currentUser?.uid])

  useEffect(() => {
    if (isFullScreen && selectedVideo && isInstagramVideo(selectedVideo.url)) {
      const loadInstagramEmbed = async () => {
        try {
          if (window.instgrm) {
            window.instgrm.Embeds.process()
          } else {
            const script = document.createElement("script")
            script.src = "//www.instagram.com/embed.js"
            script.async = true
            script.defer = true
            document.body.appendChild(script)
            script.onload = () => {
              if (window.instgrm) {
                window.instgrm.Embeds.process()
              }
            }
          }
        } catch (error) {
          console.error("Error loading Instagram embed:", error)
        }
      }
      loadInstagramEmbed()
    }
  }, [isFullScreen, selectedVideo])

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setIsFullScreen(true)
  }

  const handleCloseFullScreen = () => {
    setIsFullScreen(false)
    setSelectedVideo(null)
  }

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteDoc(doc(db, 'videos', id))
      } catch (error) {
        console.error("Error deleting video:", error.message)
      }
    }
  }

  const isInstagramVideo = (url) => {
    return url.includes("instagram.com") || url.includes("instagr.am")
  }

  const getInstagramEmbedUrl = (url) => {
    const postCode = url.split("/p/")[1]?.split("/")[0]
    if (!postCode) return url
    return `https://www.instagram.com/p/${postCode}/embed/captioned`
  }

  const getThumbnail = (video) => {
    if (isInstagramVideo(video.url)) {
      return instagramLogo
    }
    return video.thumbnail || "/placeholder.svg"
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
        <Header>List details</Header>
        {isFullScreen && selectedVideo ? (
          <VideoPlayer>
            <CloseButton onClick={handleCloseFullScreen}>Close</CloseButton>
            <PlayerWrapper>
              {isInstagramVideo(selectedVideo.url) ? (
                <InstagramEmbed>
                  <iframe
                    src={getInstagramEmbedUrl(selectedVideo.url)}
                    allowTransparency="true"
                    allowFullScreen="true"
                    frameBorder="0"
                    loading="lazy"
                  ></iframe>
                </InstagramEmbed>
              ) : (
                <ReactPlayer
                  url={selectedVideo.url}
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                  onError={(e) => console.error("Error playing video:", e)}
                />
              )}
            </PlayerWrapper>
          </VideoPlayer>
        ) : (
          <>
            <VideoGrid>
              {videos.map((video) => (
                <Card key={video.id}>
                  <CardImage src={getThumbnail(video)} alt={video.title} />
                  <CardContent>
                    <CardTitle>{video.title}</CardTitle>
                    <CardDescription>{video.description}</CardDescription>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <Button primary onClick={() => handlePlayVideo(video)}>
                        <FaPlay /> Play
                      </Button>
                      <Button onClick={() => handleDeleteVideo(video.id)}>
                        <FaTrash /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </VideoGrid>
            {videos.length === 0 && (
              <EmptyState>
                <h2>No Videos Yet</h2>
                <p>Add your first video to get started!</p>
              </EmptyState>
            )}
          </>
        )}
        <Button onClick={() => navigate(-1)} style={{ marginTop: "2rem" }}>
          Go Back
        </Button>
      </MainContent>
    </PageLayout>
  )
}

export default ListDetailPage