import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import MessageInput from './MessageInput'

function Layout() {
  const [messages, setMessages] = useState([])

  function handleSend(text) {
    setMessages([...messages, { id: Date.now(), text: text }])
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <Header />
        <div className="chat-area">
          {messages.map((msg) => (
            <div className="message-row" key={msg.id}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
        </div>
        <MessageInput onSend={handleSend} />
      </main>
    </div>
  )
}

export default Layout