import { Routes, Route, BrowserRouter } from "react-router-dom";
import './App.scss';

//Routes pages
import { Inicio }     from "../pages/home";


export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="home" element={<Home />} />
        <Route path="recovery" element={<Recovery />} />
      </Routes>
    </BrowserRouter>
  );
};
