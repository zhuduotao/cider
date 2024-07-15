
import {useCallback, useEffect, useRef, useState} from "react";
import {Message, MessageChunk} from "@/modules/agi/types.ts";
import {Subscription} from "rxjs";
import {Card} from "@mui/material";
import {Skeleton} from "@mui/lab";
import {throttle} from 'lodash-es';
import '@microflash/rehype-starry-night/css'
import {StyledMarkdown} from "./styled-markdown.tsx";

import HumanSvg from '@/assets/human.svg'
import RobotSvg from '@/assets/robot.svg'
import AgiHelper from "@/modules/agi";

interface MessageItemProps {
  message: Message,
  onNewLineGenerated?: ()=>void
}

function MessageItem(props: MessageItemProps ) {
  const {
    message
  } = props;

  const [done,setDone] = useState<boolean>(false)
  const [innerMessage,setInnerMessage] = useState<string>(message.content)
  const messageChunkSubscriptionRef = useRef<Subscription>()

  const containerRef = useRef<HTMLDivElement>(null)
  const containerHeightRef = useRef<number>(0)

  const subscribeMessageChunk = ()=>{
    messageChunkSubscriptionRef.current = AgiHelper.subscribeMessageStream(onReceiveMessage);
  }
  
  const unsubscribeMessageChunk = ()=>{
    if(messageChunkSubscriptionRef.current) {
      messageChunkSubscriptionRef.current.unsubscribe()
      messageChunkSubscriptionRef.current = undefined;
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const measureContentHeightAndTriggerEvent = useCallback(
    throttle(()=> {
      if (containerRef.current) {
        const height = Number(
          window.getComputedStyle(containerRef.current).height.replace('px','')
        )
        if(height !== containerHeightRef.current) {
          containerHeightRef.current = height
          props.onNewLineGenerated?.()
        }
      }
    },250)
  ,[])

  const onReceiveMessage = useCallback((chunk: MessageChunk)=>{
    if(message.messageId === chunk.messageId) {
      setInnerMessage(prev=>prev+chunk.chunk)
      measureContentHeightAndTriggerEvent()
      if(chunk.end) {
        setDone(true)
        unsubscribeMessageChunk()
      }
    }
  },[measureContentHeightAndTriggerEvent, message.messageId])

  useEffect(() => {
    subscribeMessageChunk()
    return ()=>{
      unsubscribeMessageChunk()
    }
  }, []);

  return (
    <Card variant="outlined" className="mb-2 ">
      <div className="flex flex-row flex-nowrap items-start w-full overflow-hidden justify-around">
        <div className="flex-shrink-0 flex-grow-0 w-fit">
          {
            message.messageType === 'user' ? (
              <img src={HumanSvg} alt="human" className="w-5 h-5 mt-3 ml-2"/>
            ) : (
              <img src={RobotSvg} alt="robot" className="w-5 h-5 mt-3 ml-2"/>
            )
          }
        </div>
        <div className="p-2 min-h-8 w-full flex-grow-1 flex-shrink-1 overflow-hidden" ref={containerRef}>
          {!innerMessage && !done && <Skeleton variant="text" width={'100%'} height={'100%'}/>}
          {!innerMessage && done && <span className="text-gray-600">No Result</span>}
          {innerMessage && (
            <StyledMarkdown value={innerMessage}/>
          )}
        </div>
      </div>
    </Card>
  )
}

export default MessageItem;