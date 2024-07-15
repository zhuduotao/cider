import './App.css'
import SidebarContext from "./layout/SidebarContext";
import Chat from "./pages/chat";
import {
  ChatBubbleOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import Settings from "./pages/settings";
import {ToastContainer} from "react-toastify";

function App() {
  return (
    <>
      <SidebarContext
        modules={[
          {id: 'chat', label: 'Chat', element: <Chat />, icon:<ChatBubbleOutlined />},
          {id: 'settings', label: 'Settings', element: <Settings />, icon:<SettingsOutlined />}
        ]}
      />
      <ToastContainer />
    </>
  )
}

export default App
