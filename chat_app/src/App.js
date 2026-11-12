// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Connetion from "./connection";
import Inscription from "./Inscription";
import Profil from "./profil";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connetion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </BrowserRouter>
  );
}