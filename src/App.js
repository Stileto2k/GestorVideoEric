// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Afegir Router
import 'bootstrap/dist/css/bootstrap.min.css';
import AddVideosScreen from './Screens/AddVideosScreen'; // Importar el nou component
import AuthScreen from './Screens/Login';
import ListDetailScreen from './Screens/ListDetailScreen';
import ListsScreen from './Screens/ListsScreen';
import UserScreen from './Screens/UserScreen';
import RegisterScreen from './Screens/RegisterScreen';
import MyVideos from './Screens/MyVideos';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/register" element={<RegisterScreen />} /> 
          <Route path="/add-video" element={<AddVideosScreen />} />
          <Route path="/list-detail" element={<ListDetailScreen />} />
          <Route path="/lists" element={<ListsScreen />} />
          <Route path="/user" element={<UserScreen />} />
          <Route path="/my-videos" element={<MyVideos />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
