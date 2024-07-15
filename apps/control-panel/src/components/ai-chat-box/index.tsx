import {IconButton, TextField} from "@mui/material";
import {ClearAllOutlined, SendOutlined} from "@mui/icons-material";
import {useEffect, useRef, useState} from "react";
import MessageItem from "./message-item.tsx";
import {randomUUID} from "@/utils/random.ts";
import {Message, MessageRole} from "@/modules/agi/types.ts";
import './index.css'
import {Subscription} from "rxjs";
import {BaseMessage, MessageType as BaseMessageType} from "@langchain/core/messages";
import AgiHelper from "@/modules/agi";
import * as localforage from "localforage";
import {toast} from "react-toastify";

function mappingRawMessageTypeToRole(messageType:BaseMessageType): MessageRole {
  if(messageType === "human") return 'user'
  if (messageType === 'ai') return 'assistant'
  return 'system'
}

function mappingRawMessageIntoMessage(sessionId: string,rawMessage: BaseMessage): Message {
  const type = rawMessage._getType();

  return new Message(
    mappingRawMessageTypeToRole(type),
    sessionId,
    randomUUID(),
    null,
    rawMessage.text,
    null
  )
}

const STORAGE_KEY_LAST_SESSION_ID = 'CIDER:AI_CHAT_BOX:LAST_SESSION_ID'

const AiChatBox = () =>{

  const [sessionId,setSessionId] = useState<string>()
  const [pendingMessage,setPendingMessage] = useState<string>()

  const [messageList,setMessageList] = useState<Message[]>([])
  const messageBoxRef = useRef<HTMLDivElement>(null)

  const subscribeRef = useRef<Subscription|null>(null)

  const onMessageChange = (event: React.ChangeEvent<HTMLInputElement>)=>{
    setPendingMessage(event.target.value)
  }

  useEffect(() => {
    subscribeRef.current = AgiHelper.on(({action})=>{
      if(action === 'providerReloaded') {
        recoverFromHistory()
      }
    })
    return ()=>{
      subscribeRef.current?.unsubscribe()
    }
  }, []);

  const scrollToBottom = () => {
    messageBoxRef.current?.scrollTo(0,messageBoxRef.current.scrollHeight)
  }

  const recoverFromHistory = async (loadSessionId?: string)=>{
    const previousSessionId: string | null= loadSessionId || await localforage.getItem(STORAGE_KEY_LAST_SESSION_ID)

    if(previousSessionId) {
      try {
        setSessionId(previousSessionId)
        const historyInStorage = await AgiHelper.getMessages(previousSessionId);
        if(historyInStorage) {
          const messagesInStorage = await historyInStorage.getMessages();
          const nextMessageList = messagesInStorage.map(p=>mappingRawMessageIntoMessage(previousSessionId,p))
          setMessageList(nextMessageList)
        }
        requestIdleCallback(()=>{
         scrollToBottom()
        })
      } catch (e:any) {
        renewSession()
      }
    } else {
      renewSession()
    }
  }

  const renewSession = async ()=>{
    setSessionId(randomUUID())
    await localforage.setItem(STORAGE_KEY_LAST_SESSION_ID,sessionId)
  }

  const onAskQuestion = async ()=>{
    if(!pendingMessage) {
      return
    }
    await localforage.setItem(STORAGE_KEY_LAST_SESSION_ID,sessionId)
    const [
      questionMessageId,
      replyMessageId
    ] = [
      randomUUID(),randomUUID()
    ];

    setMessageList((prev)=>{
      return [
        ...prev,
        new Message('user', sessionId!, questionMessageId, null, pendingMessage),
        new Message('assistant', sessionId!, replyMessageId, questionMessageId, ''),
      ]
    })
    setTimeout(()=>{
      try {
        AgiHelper.chat(
          sessionId!,
          replyMessageId,
          pendingMessage
        )
      } catch (e: any) {
        toast.error(e?.message || e,{position: 'bottom-center'})
      }
    },0)
    setPendingMessage('')
  }

  const onClearAll = ()=> {
    setMessageList([]);
    setSessionId(randomUUID())
  }

  return (
    <div
      id="chat-box-container"
      className="hide-scroll w-full h-full flex flex-col flex-nowrap overflow-hidden scroll-m-0"
    >
      <div
        ref={messageBoxRef}
        id="pendingMessage-list-scroller"
        className="w-full h-full overflow-x-hidden overflow-y-auto flex-shrink flex-grow"
      >
        {
          messageList.map(message=>(
            <MessageItem
              key={message.messageId}
              message={message}
              onNewLineGenerated={()=> {
                scrollToBottom()
              }}
            />
          ))
        }
      </div>
      <div
        className="w-full bottom-0 left-0 right-0 pb-2 flex flex-col flex-shrink-0 flex-grow-0 pt-8"
      >
        <TextField
          id="send-messsage-box"
          className="w-full"
          multiline
          maxRows={4}
          placeholder="Any question"
          value={pendingMessage}
          onKeyDown={(e)=>{
            if(e.key==='Enter' && e.ctrlKey) {
              onAskQuestion()
              e.preventDefault()
            }
          }}
          onChange={onMessageChange}
          sx={{
            '.MuiInputBase-root ': {
              padding: '8px'
            }
          }}
        />
        <div id="send-pendingMessage-actions" className="flex flex-row justify-end items-center">
          <IconButton onClick={onClearAll}>
            <ClearAllOutlined />
          </IconButton>
          <IconButton onClick={onAskQuestion}>
            <SendOutlined />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
export default AiChatBox