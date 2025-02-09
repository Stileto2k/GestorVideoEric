import { useState, useEffect } from "react"
import { db } from "../utils/FirebaseConfig"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import ReactPlayer from "react-player"
import { FaPlus, FaList, FaVideo, FaUser, FaPlay, FaTrash } from "react-icons/fa"
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

const VideoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-top: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`

const Thumbnail = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`

const CardContent = styled.div`
  padding: 1rem;
  text-align: center;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #6a0dad;
  margin-bottom: 0.5rem;
`

const Description = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
`

const VideoPlayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
`

const CloseButton = styled.button`
  background: red;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: darkred;
  }
`

const PlayerWrapper = styled.div`
  width: 80%;
  max-width: 540px;
  max-height: 80vh;
  background: black;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
`

const Header = styled.h1`
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
`

const Button = styled.button`
  background: ${(props) => (props.primary ? "#6a0dad" : "#ff66b2")};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`

const EmptyMessage = styled.h3`
  color: white;
  text-align: center;
  margin-top: 2rem;
`

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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

const isInstagramUrl = (url) => {
  return url.includes("instagram.com") || url.includes("instagr.am")
}

const getInstagramEmbedUrl = (url) => {
  const postCode = url.split("/p/")[1]?.split("/")[0]
  if (!postCode) return url
  return `https://www.instagram.com/p/${postCode}/embed/captioned`
}

const getThumbnail = (video) => {
  if (isInstagramUrl(video.url)) {
    return instagramLogo
  }
  return video.thumbnail || "/placeholder.svg"
}

export default function MyVideos() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [thumbnails, setThumbnails] = useState({})
  const auth = getAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthAndFetchVideos = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate("/")
        return
      }
      await fetchVideos(user.uid)
    }

    checkAuthAndFetchVideos()
  }, [navigate, auth.currentUser])

  useEffect(() => {
    if (selectedVideo && isInstagramUrl(selectedVideo.url)) {
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
  }, [selectedVideo])

  const fetchVideos = async (userId) => {
    try {
      const videosQuery = query(collection(db, "videos"), where("userId", "==", userId))
      const querySnapshot = await getDocs(videosQuery)
      const videoList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setVideos(videoList)

      const newThumbnails = {}
      videoList.forEach((video) => {
        if (isInstagramUrl(video.url)) {
          newThumbnails[video.id] = "/components/instagram.jpeg"
        }
      })
      setThumbnails(newThumbnails)
    } catch (error) {
      console.error("Error fetching videos:", error)
      alert("Error al cargar los videos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handlePlayVideo = (video) => setSelectedVideo(video)
  const handleCloseVideo = () => setSelectedVideo(null)

  const handleDeleteVideo = async (id) => {
    if (window.confirm("¿Do you want to remove this video?")) {
      try {
        await deleteDoc(doc(db, "videos", id))
        setVideos(videos.filter((video) => video.id !== id))
      } catch (error) {
        console.error("Error deleting video:", error)
        alert("Error. Try again")
      }
    }
  }

  const getVideoPlayer = (video) => {
    if (isInstagramUrl(video.url)) {
      return (
        <InstagramEmbed>
          <iframe
            src={getInstagramEmbedUrl(video.url)}
            allowTransparency="true"
            allowFullScreen="true"
            frameBorder="0"
            loading="lazy"
          />
        </InstagramEmbed>
      )
    }
    return (
      <ReactPlayer
        url={video.url}
        width="100%"
        height="100%"
        controls={true}
        playing={true}
        onError={(e) => console.error("Error reproduciendo el video:", e)}
      />
    )
  }

  if (loading) {
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
          <LoadingSpinner />
        </MainContent>
      </PageLayout>
    )
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
        <Header>My video library</Header>
        {selectedVideo ? (
          <VideoPlayer>
            <CloseButton onClick={handleCloseVideo}>Close</CloseButton>
            <PlayerWrapper>{getVideoPlayer(selectedVideo)}</PlayerWrapper>
          </VideoPlayer>
        ) : (
          <VideoGrid>
            {videos.map((item) => (
              <Card key={item.id}>
                <Thumbnail src={getThumbnail(item)} alt={item.title} />
                <CardContent>
                  <Title>{item.title}</Title>
                  <Description>{item.description}</Description>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Button primary onClick={() => handlePlayVideo(item)}>
                      <FaPlay /> Replay
                    </Button>
                    <Button onClick={() => handleDeleteVideo(item.id)}>
                      <FaTrash /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </VideoGrid>
        )}
        {!loading && videos.length === 0 && <EmptyMessage>There are no videos in your library</EmptyMessage>}
      </MainContent>
    </PageLayout>
  )
}
