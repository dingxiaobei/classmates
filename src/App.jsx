import { useEffect, useState, useMemo, useRef } from "react";
import "./App.css";

// 后端 API 基础地址
const API_BASE = "https://classmates-backend.onrender.com";

function pinyinSort(arr) {
  return arr.slice().sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN-u-co-pinyin'));
}

function App() {
  const [classmates, setClassmates] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [messageInput, setMessageInput] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/classmates`)
      .then((res) => res.json())
      .then((data) => {
        setClassmates(data);
        setLoading(false);
      });
  }, []);

  const handleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBackClick = (e, id) => {
    // 只有点击卡片空白区域才反转回去，点击文字/按钮不反转
    if (e.target.classList.contains('card-back')) {
      handleFlip(id);
    }
  };

  const handleInputChange = (id, value) => {
    setMessageInput((prev) => ({ ...prev, [id]: value }));
  };

  const handleMessageSubmit = async (id) => {
    const content = messageInput[id];
    if (!content) return;
    await fetch(`${API_BASE}/api/classmates/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setClassmates((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, messages: [...c.messages, content] } : c
      )
    );
    setMessageInput((prev) => ({ ...prev, [id]: "" }));
  };

  const sortedClassmates = useMemo(() => pinyinSort(classmates), [classmates]);
  // 卡片ref映射
  const cardRefs = useRef({});

  if (loading) return <div>加载中...</div>;

  return (
    <div style={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="grid-container">
          {classmates.map((c) => (
            <div
              className={`card${flipped[c.id] ? " flipped" : ""}`}
              key={c.id}
              ref={el => cardRefs.current[c.id] = el}
              onClick={() => !flipped[c.id] && handleFlip(c.id)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <img src={c.photo_url} alt={c.name} className="photo" />
                </div>
                <div
                  className="card-back"
                  onClick={(e) => handleBackClick(e, c.id)}
                >
                  <div className="info">
                    <div className="name">{c.name}</div>
                    <div className="job">{c.job}</div>
                    <div className="signature">{c.signature}</div>
                  </div>
                  <div className="messages">
                    <div className="messages-title">留言：</div>
                    {c.messages.slice(-3).map((m, i) => (
                      <div className="message" key={i}>
                        匿名：{m}
                      </div>
                    ))}
                  </div>
                  <div className="message-input">
                    <input
                      type="text"
                      placeholder="写下你的留言..."
                      value={messageInput[c.id] || ""}
                      onChange={(e) => handleInputChange(c.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleMessageSubmit(c.id); }}>
                      留言
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <nav
        style={{
          width: 80,
          background: "none",
          borderLeft: "1px solid #eee",
          fontSize: 12,
          color: "#aaa",
          padding: "8px 0",
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          overflowY: "auto",
          userSelect: "none",
          opacity: 0.7,
          zIndex: 10
        }}
      >
        <div style={{textAlign: "center", marginBottom: 4, fontWeight: 500, color: "#bbb", fontSize: 13}}>导航</div>
        {sortedClassmates.map((c) => (
          <div
            key={c.id}
            style={{ padding: "2px 6px", whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() => {
              const el = cardRefs.current[c.id];
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          >
            {c.name}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default App;
