import { useState } from 'react'
import { Paperclip, Smile, Send } from 'lucide-react'

function MessageInput({ onSend }) {
  const [text, setText] = useState('')

  function handleSubmit() {
    const trimmed = text.trim()
    if (trimmed === '') return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="composer-wrap">
      <div className="composer">
        <button className="icon-btn" type="button">
          <Paperclip size={20} />
        </button>

        <input
          className="composer-input"
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="icon-btn" type="button">
          <Smile size={22} />
        </button>

        <button className="send-btn" type="button" onClick={handleSubmit}>
          <Send size={20} />
        </button>
      </div>

      <p className="footer-text">PATHFINDER | Built for your growth</p>
    </div>
  )
}

export default MessageInput