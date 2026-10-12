import {
  MessageCircle,
  User,
  SquarePlus,
  Settings,
  Clock,
  MessageSquare,
  Sprout,
} from 'lucide-react'

function Sidebar() {
  const recentChats = [
    'Best skills for MERN vs Java?',
    'Career path suggestion',
    'How to prepare for placement?',
    'DSA vs Projects?',
    'Internship opportunities',
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <h2>PATHFINDER</h2>
        <p>Real Experiences. Better Decisions.</p>
      </div>

      <button className="new-chat">
        <MessageCircle size={20} />
        New Chat
      </button>

      <nav className="menu">
        <a href="#" className="menu-item">
          <User size={20} />
          My Profile
        </a>
        <a href="#" className="menu-item">
          <SquarePlus size={20} />
          Skill Assessment
        </a>
        <a href="#" className="menu-item">
          <Settings size={20} />
          Settings
        </a>
      </nav>

      <div className="recent">
        <h3 className="recent-title">
          <Clock size={16} />
          Recent Chats
        </h3>
        {recentChats.map((chat) => (
          <a href="#" className="recent-item" key={chat}>
            <MessageSquare size={16} />
            {chat}
          </a>
        ))}
      </div>

      <div className="motivation">
        <Sprout size={28} />
        <p>Every decision you make builds your future.</p>
      </div>
    </aside>
  )
}

export default Sidebar