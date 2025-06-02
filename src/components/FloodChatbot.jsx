import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./FloodChatbot.css";

const FloodChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatWindowRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const quickActions = [
    "What should I do during a flood?",
    "Emergency contact numbers",
    "How to prepare for floods?",
    "First aid during floods",
    "Safe evacuation routes",
  ];

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const locationData = response.data;
            setUserLocation({
              city:
                locationData.address.city ||
                locationData.address.town ||
                locationData.address.village,
              state: locationData.address.state,
              country: locationData.address.country,
              coordinates: { latitude, longitude },
            });
          } catch (error) {
            console.error("Error getting location details:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const checkScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      // Show button only if we're not at the bottom (with a small threshold)
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowScrollButton(!isAtBottom);
    }
  };

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", checkScroll);
      // Initial check when component mounts
      checkScroll();
      return () => messagesContainer.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleQuickAction = (action) => {
    setInput(action);
    handleSubmit(new Event("submit"), action);
  };

  const handleFollowUp = (question) => {
    setInput(question);
    handleSubmit(new Event("submit"), question);
  };

  const handleSubmit = async (e, quickActionMessage = null) => {
    e.preventDefault();
    const messageToSend = quickActionMessage || input.trim();
    if (!messageToSend) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setIsLoading(true);
    setFollowUpQuestions([]);

    try {
      const locationContext = userLocation
        ? `The user is located in ${userLocation.city}, ${userLocation.state}, ${userLocation.country}. Please provide location-specific emergency contacts and information for this area.`
        : "The user's location is not available. Please provide general emergency information.";

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant specialized in flood safety and emergency response. ${locationContext} Provide clear, concise information about flood safety measures, emergency contacts, and immediate actions to take during floods. Focus on practical advice and official emergency contact numbers. Always include relevant emergency numbers when discussing emergency situations. If providing location-specific information, make sure to mention that the information is specific to the user's current location.

                Format your responses using HTML tags for better readability:
                - Use <h3> for section headers
                - Use <ul> and <li> for lists
                - Use <strong> for important information
                - Use <p> for paragraphs
                - Use <div class="emergency-contact"> for emergency numbers
                - Use <div class="warning"> for warnings
                - Use <div class="tip"> for tips
                - Use <div class="location-specific"> for location-specific information
                - Use <a href="tel:number"> for clickable phone numbers
                - Use <br> for line breaks
                
                After your main response, provide 2-3 relevant follow-up questions that the user might want to ask next. Format these questions in a special section like this:
                <div class="follow-up-section">
                  <h4>You might also want to know:</h4>
                  <ul class="follow-up-questions">
                    <li>First follow-up question</li>
                    <li>Second follow-up question</li>
                    <li>Third follow-up question</li>
                  </ul>
                </div>`,
            },
            ...messages,
            { role: "user", content: messageToSend },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botResponse = response.data.choices[0].message.content;

      // Extract follow-up questions from the response
      const followUpMatch = botResponse.match(
        /<div class="follow-up-section">([\s\S]*?)<\/div>/
      );
      let cleanedResponse = botResponse;
      let extractedQuestions = [];

      if (followUpMatch) {
        const followUpSection = followUpMatch[0];
        const questionsMatch = followUpSection.match(/<li>(.*?)<\/li>/g);

        if (questionsMatch) {
          extractedQuestions = questionsMatch.map((q) =>
            q.replace(/<\/?li>/g, "").trim()
          );
        }

        // Remove the follow-up section from the main response
        cleanedResponse = botResponse.replace(followUpSection, "");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: cleanedResponse },
      ]);

      setFollowUpQuestions(extractedQuestions);
      // Check if we need to show scroll button after new content
      setTimeout(checkScroll, 100);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again later or contact emergency services directly if this is urgent.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (content) => {
    return { __html: content };
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(300, startWidth - (e.clientX - startX));
      const newHeight = Math.max(400, startHeight - (e.clientY - startY));
      setWindowSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chat-button"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>💬</span>
            <span className="chat-button-text">Flood Help</span>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            className={`chat-window ${isResizing ? "resizing" : ""}`}
            ref={chatWindowRef}
            style={{
              width: `${windowSize.width}px`,
              height: `${windowSize.height}px`,
            }}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div
              className={`resize-handle ${isResizing ? "resizing" : ""}`}
              onMouseDown={handleMouseDown}
              title="Resize chat window"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M21 11V3h-8v2h4.586L12 9.586 9.414 7H14V5H7v7h2V7.414l2.586 2.586L7 14.586V10H5v7h7v-2H7.414l2.586-2.586L12.586 17H10v2h8v-8h-2v4.586L13.414 12 17 8.414V13h2z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <motion.div
              className="chat-header"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3>Flood Safety Assistant</h3>
              <motion.button
                className="close-button"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </motion.div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="welcome-message">
                    {userLocation ? (
                      <>
                        Hello! I'm your flood safety assistant for{" "}
                        {userLocation.city}, {userLocation.state}. How can I
                        help you today?
                      </>
                    ) : (
                      <>
                        Hello! I'm your flood safety assistant.
                        {!userLocation &&
                          " Please allow location access for location-specific help."}
                        How can I help you today?
                      </>
                    )}
                  </div>
                  <div className="quick-actions">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        className="quick-action-button"
                        onClick={() => handleQuickAction(action)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                        whileTap={{ x: 2 }}
                      >
                        {action}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`message ${
                      message.role === "user" ? "user-message" : "bot-message"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", damping: 20 }}
                    dangerouslySetInnerHTML={renderMessage(message.content)}
                  />
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  className="message bot-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
              {followUpQuestions.length > 0 && (
                <motion.div
                  className="follow-up-questions-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4>You might also want to know:</h4>
                  <div className="follow-up-questions">
                    {followUpQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        className="follow-up-question-button"
                        onClick={() => handleFollowUp(question)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                        whileTap={{ x: 2 }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  className="scroll-to-bottom-button"
                  onClick={scrollToBottom}
                  title="Scroll to bottom"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                      fill="currentColor"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit}
              className="input-form"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloodChatbot;
