import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../utils/FirebaseConfig"
import { useNavigate } from "react-router-dom"
import styled from 'styled-components'

// Estils amb styled-components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom right, #6a0dad, #ff66b2);
  padding: 1.5rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 28rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
  color: #6a0dad;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #4a4a4a;
`;

const Input = styled.input`
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #333;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6a0dad;
    box-shadow: 0 0 0 2px rgba(106, 13, 173, 0.3);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: #4c51bf;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #434190;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(68, 52, 203, 0.6);
  }
`;

const TextButton = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: white;
  color: #4c51bf;
  font-size: 1.25rem;
  font-weight: 600;
  border: 1px solid #4c51bf;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(68, 52, 203, 0.6);
  }
`;

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/add-video")
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <Container>
      <Card>
        <Title>Welcome Back</Title>
        <form onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">
            Sign In
          </Button>
        </form>
        <div>
          <TextButton onClick={() => navigate("/register")}>
            Create an Account
          </TextButton>
        </div>
      </Card>
    </Container>
  )
}
