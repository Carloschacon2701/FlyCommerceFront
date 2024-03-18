/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import Sockjs from "sockjs-client";
import Stomp, { Client } from "stompjs";
import { CurrentUsers, Messsage } from "../utils/interfaces";

async function getActiveUsers(): Promise<CurrentUsers[]> {
  const response = await axios.get("http://localhost:8080/api/chat/users");
  return response.data;
}

async function getChat(senderId: string, recipientId: string) {
  const response = await axios.get(
    `http://localhost:8080/api/messages/${senderId}/${recipientId}`
  );
  return response.data;
}

export const Chat = () => {
  const [activeUsers, setActiveUsers] = useState<CurrentUsers[]>([]);
  const [chat, setChat] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Messsage[]>([]);
  const [stompClient, setStompClient] = useState<Client>();
  const [connected, setConnected] = useState(false);
  const [userName] = useState(localStorage.getItem("name"));
  const [text, setText] = useState("");
  const [refetch, setRefetch] = useState(false);

  function connect() {
    const socket = new Sockjs("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);
    setStompClient(stompClient);

    stompClient.connect({}, onConnected, error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function error(message: any) {
    console.log("error", message);
  }

  function onConnected() {
    setConnected(true);

    if (stompClient && userName && connected) {
      stompClient?.subscribe(`/user/${userName}/queue/messages`, () => {
        setRefetch(!refetch);
      });

      stompClient?.subscribe(`/user/public`, (message) => {
        console.log(message);
      });

      console.log("connected");

      stompClient?.send(
        "/app/user.addUser",
        {},
        JSON.stringify({ name: userName, status: "ONLINE" })
      );
    }
  }

  function sendMessage() {
    const chatMessage = {
      senderId: userName,
      recipientId: chat,
      content: text,
      timestamp: new Date(),
    };

    stompClient?.send("/app/chat", {}, JSON.stringify(chatMessage));
  }

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (stompClient && connected) {
      onConnected();
    }
  }, [connected]);

  useEffect(() => {
    getActiveUsers().then((data) => {
      const filterUsers = data.filter((user) => user.name !== userName);
      setActiveUsers(filterUsers);
    });
  }, [refetch]);

  useEffect(() => {
    if (chat && userName) {
      getChat(userName, chat).then((data) => setMessages(data));
    }
  }, [chat, refetch]);

  const handleClickChat = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const id = e.currentTarget.id;

    setChat(id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="w-full h-screen flex justify-between items-center">
      <aside className="w-1/4 h-full bg-gray-800 text-white flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">Active Users</h1>
        <ul className="flex flex-col gap-2 w-3/4">
          {activeUsers?.map((user) => (
            <button
              className="bg-white text-black w-full h-10 rounded-md"
              onClick={handleClickChat}
              id={user.name}
              key={user.name}
            >
              {user.name}
            </button>
          ))}
        </ul>
      </aside>
      <div className="w-3/4 h-full bg-gray-200 flex flex-col justify-between items-center">
        {!chat ? (
          <h1>Select a user to chat</h1>
        ) : (
          <div className="w-full">
            <h1 className="text-center font-bold border-b border-b-blue-300">
              Chat with user {chat}
            </h1>
            <ul className="w-full flex flex-col">
              {messages.map((message) => (
                <li
                  className={` text-white w-3/12 rounded-lg p-2 m-2 ${
                    message.senderId === userName
                      ? "self-end bg-stone-500"
                      : "self-start bg-slate-400"
                  }`}
                  key={message.id}
                >
                  {message.content}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="w-full flex justify-center">
          <input
            onChange={handleChange}
            type="text"
            placeholder="message"
            className="w-10/12 rounded-md px-4 py-2"
          />
          <button
            onClick={sendMessage}
            className="w-2/12 bg-blue-300 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
