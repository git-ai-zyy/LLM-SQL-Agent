import React, { useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { format } from "sql-formatter";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism.css";

// API URLs
const BACKEND_URL = "http://127.0.0.1:5000/";
const GET_HEATH = BACKEND_URL + "health";
const PROCESS_QUERY_URL = BACKEND_URL + "process_query/";
const PROCESS_SQL_URL = BACKEND_URL + "process_sql/";
// =======================================================================================

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isEditable?: boolean;
}

interface ChatBotProps {
  setChartData: (data: any, sql: string, chartType: string) => void;
  setTableData: (data: any[]) => void;
  addOldData: (
    data: any,
    tableData: any[],
    sql: string,
    chartType: string
  ) => void;
}

SyntaxHighlighter.registerLanguage("sql", sql);

const ChatBot: React.FC<ChatBotProps> = ({
  setChartData,
  setTableData,
  addOldData,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [tableData, setTableDataState] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    };

    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await fetch(PROCESS_QUERY_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nl_query: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);

      // Simulate bot response with formatted SQL
      const botMessage: Message = {
        id: Date.now() + 1,
        text: format(data.generated_sql),
        isUser: false,
        isEditable: true,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEdit = (id: number, newText: string) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, text: newText } : message
      )
    );
  };

  const handleSend = async (sql: string) => {
    try {
      const response = await fetch(PROCESS_SQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ edited_sql: sql }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Update chart data
      const labels = data.query_result.map((row: any) => row.MaskedPRO);
      const chartData = {
        labels,
        datasets: [
          {
            label: "User Data",
            data: data.query_result.map((row: any) => row.TotalCartridges),
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1,
          },
        ],
      };
      setTableData(data.query_result);
      setChartData(chartData, sql, data.chart_type);

      // Update table data
      addOldData(
        chartData,
        data.query_result,
        data.generated_sql,
        data.chart_type
      );
      console.log("This is data");
      console.log(data.generated_sql);
      console.log(data.query_result);
      console.log(data.chart_type);
      console.log("This isEnd of  data");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Title Bar */}
      <div className="bg-blue-500 text-white p-4 text-center font-bold text-lg">
        ChatBot
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            Start a conversation...
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.isUser ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {message.isUser ? (
                  message.text
                ) : message.isEditable ? (
                  <div className="relative">
                    <Editor
                      value={message.text}
                      onValueChange={(newText) =>
                        handleEdit(message.id, newText)
                      }
                      highlight={(code) =>
                        highlight(code, languages.sql, "sql")
                      }
                      padding={10}
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        backgroundColor: "#f5f5f5",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <button
                      onClick={() => handleSend(message.text)}
                      className="absolute top-0 right-0 mt-2 mr-2 px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Run
                    </button>
                  </div>
                ) : (
                  <SyntaxHighlighter
                    language="sql"
                    style={materialDark}
                    className="rounded-md"
                  >
                    {message.text}
                  </SyntaxHighlighter>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
