import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NewEntry from "./pages/NewEntry"

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/home" element={<Home />}/>
        <Route path="/new" element={<NewEntry />}/>
        <Route path="/entry/:id" element={<NewEntry/>} />
      </Routes>
    </BrowserRouter>
  )
}

