import {
  Configuration,
  NewSessionData,
  StreamingAvatarApi,
} from "@heygen/streaming-avatar";
import { Button, Spinner, Tooltip } from "@nextui-org/react";
import { Keyboard, Microphone } from "@phosphor-icons/react";
import { useAssistant } from "ai/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import InteractiveAvatarTextInput from "./InteractiveAvatarTextInput";
import MessageList from "./MessageList";
import MicrophoneInput from "./MicrophoneInput";

const avatarId = "60439e8c0fe7428bb9b6c41772258a6b"; //'Angela-insuit-20220820';
const voiceId = "dbb805f1b63a40ec869c66819ade215e";

export default function InteractiveAvatar() {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [data, setData] = useState<NewSessionData>();
  const [text, setText] = useState<string>("");
  const [initialized, setInitialized] = useState(false); // Track initialization
  const [recording, setRecording] = useState(false); // Track recording state
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatarApi | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [isText, swithText] = useState(true);
  const { input, status, setInput, submitMessage, messages } = useAssistant({
    api: "/api/assistant",
  });
  const [touched, setTouched] = useState(false);
  const firstflag = useRef(true); //移除首次加载两次
  const [microInputChangeFlags, SetMicroInputChangeFlags] = useState(false);

  useEffect(() => {
    //触发播放
    if (status != "awaiting_message" || messages.length == 0) return;
    console.log("ChatGPT Response:", messages);
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }

    const text = messages[messages.length - 1].content.replaceAll("**", "");

    //send the ChatGPT response to the Interactive Avatar
    avatar.current
      .speak({
        taskRequest: { text, sessionId: data?.sessionId },
      })
      .then(() => {
        setIsLoadingChat(false);
      })
      .catch((e) => {
        setDebug(e.message);
      });
    // setIsLoadingChat(false);
  }, [status]);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      // const token = 'eyJ0b2tlbiI6ICJhYmIyZjhlOWI2Nzg0MmI2ODgwYTUxNDRmZGEzNmVjYSIsICJ0b2tlbl90eXBlIjogInNhX2Zyb21fdHJpYWwiLCAiY3JlYXRlZF9hdCI6IDE3MjY3NTgyOTF9'
      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);

      return "";
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    await updateToken();
    if (!avatar.current) {
      setDebug("Avatar API is not initialized");

      return;
    }
    try {
      const res = await avatar.current.createStartAvatar(
        {
          newSessionRequest: {
            quality: "low",
            avatarName: avatarId,
            voice: { voiceId: voiceId },
          },
        },
        setDebug,
      );

      setData(res);
      setStream(avatar.current.mediaStream);
    } catch (error) {
      console.error("Error starting avatar session:", error);
      setDebug(
        `There was an error starting the session. ${voiceId ? "This custom voice ID may not be supported." : ""}`,
      );
    }
    setIsLoadingSession(false);
  }

  async function updateToken() {
    const newToken = await fetchAccessToken();

    console.log("Updating Access Token:", newToken); // Log token for debugging
    avatar.current = new StreamingAvatarApi(
      new Configuration({ accessToken: newToken, jitterBuffer: 200 }),
    );

    const startTalkCallback = (e: any) => {
      console.log("Avatar started talking", e);
    };

    const stopTalkCallback = (e: any) => {
      console.log("Avatar stopped talking", e);
    };

    console.log("Adding event handlers:", avatar.current);
    avatar.current.addEventHandler("avatar_start_talking", startTalkCallback);
    avatar.current.addEventHandler("avatar_stop_talking", stopTalkCallback);

    setInitialized(true);
  }

  async function handleInterrupt() {
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current
      .interrupt({ interruptRequest: { sessionId: data?.sessionId } })
      .catch((e) => {
        setDebug(e.message);
      });
  }

  async function endSession() {
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }
    await avatar.current.stopAvatar(
      { stopSessionRequest: { sessionId: data?.sessionId } },
      setDebug,
    );
    setStream(undefined);
    console.info("end session");
  }

  async function handleSpeak(text: string) {
    setIsLoadingRepeat(true);
    if (!initialized || !avatar.current) {
      setDebug("Avatar API not initialized");

      return;
    }

    await avatar.current
      .speak({ taskRequest: { text: text, sessionId: data?.sessionId } })
      .catch((e) => {
        setDebug(e.message);
      });
    setIsLoadingRepeat(false);
  }

  useEffect(() => {
    if (touched && initialized) {
      // console.log('222222')
      // if(mediaStream.current)mediaStream.current.muted=false;
      handleSpeak("你好，有什么可以帮你");
    }
  }, [touched, initialized]);

  useEffect(() => {
    if (!firstflag.current) {
      return;
    }
    async function init() {
      // const newToken = await fetchAccessToken();
      // console.log("Initializing with Access Token:", newToken); // Log token for debugging
      // avatar.current = new StreamingAvatarApi(
      //   new Configuration({ accessToken: newToken, jitterBuffer: 200 })
      // );
      // setInitialized(true); // Set initialized to true
      // //auto startSession
      // //TODO auto start
      await startSession();

      const firstTouchAction = () => {
        if (!touched) {
          setTouched(true);
          document.body.removeEventListener("click", firstTouchAction);
        }
      };

      document.body.addEventListener("click", firstTouchAction);
    }
    init();
    firstflag.current = false;

    // startSession();
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  const stopPlayVideo = () => {
    if (stream && mediaStream.current) {
      mediaStream.current!.pause();
    }
  };

  function handlerSendMessage() {
    setIsLoadingChat(true);
    console.log("send to serverr ", input);
    if (!input) {
      setDebug("Please enter text to send to ChatGPT");

      return;
    }
    // handleSubmit();
    submitMessage();
  }

  useEffect(() => {
    if (microInputChangeFlags && input) {
      handlerSendMessage();
      SetMicroInputChangeFlags(false);
    }
  }, [microInputChangeFlags, input]);

  function micSubmit(content: string) {
    setInput(content);
    SetMicroInputChangeFlags(true);
  }

  return (
    <div className="page w-screen h-[calc(100dvh)] flex flex-col justify-center items-center overflow-hidden">
      {/* <Card isFooterBlurred> */}
      {/* <CardBody className="h-[calc(100dvh)] flex flex-col justify-center items-center overflow-hidden"> */}
      {stream ? (
        <div className="container w-screen  h-[calc(100dvh)] justify-center  items-center flex flex-row rounded-lg overflow-hidden z-30">
          <video
            ref={mediaStream}
            autoPlay
            playsInline
            muted={!touched}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          >
            <track kind="captions" />
          </video>
          {/* <div className="flex flex-col gap-2 absolute bottom-3 center">
                <Button
                  size="md"
                  onClick={handleInterrupt}
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300 text-white rounded-lg"
                  variant="shadow"
                >
                  Interrupt task
                </Button>
                <Button
                  size="md"
                  onClick={endSession}
                  className="bg-gradient-to-tr from-indigo-500 to-indigo-300  text-white rounded-lg"
                  variant="shadow"
                >
                  End session
                </Button>
              </div> */}
          {/* <span className="display-none">{touched + ''}</span> */}
        </div>
      ) : !isLoadingSession ? (
        <div className="h-full justify-center absolute top-0 left-0 items-center flex flex-col gap-8 w-full self-center z-50">
          <span>初始化中....</span>
        </div>
      ) : (
        <Spinner color="default" size="lg" />
      )}

      {initialized && !touched && !isLoadingSession ? (
        <div className="h-full justify-center absolute top-0 left-0 items-center flex flex-col gap-8 w-full self-center ">
          <span className="z-50 cursor-pointer" >请点击开始对话</span>
        </div>
      ) : null}

      {input && !isText ? (
        <div className="h-full justify-center absolute top-0 left-0 items-center flex flex-col gap-8 w-full self-center ">
          <span className="text-warp backdrop-blur-sm bg-white/10  rounded-md p-1 z-50">{input}</span>
        </div>
      ) : null}

      <p className="font-mono text-right absolute top-1 right-1 z-40">
        {/* <span className="font-bold">Console:</span>
        <br /> */}
        {debug}
      </p>
      <div className="flex flex-col w-full absolute bottom-2 gap-1 px-2 z-40">
        <div className="w-full overflow-hidden z-20 max-h-[200px] rounded py-1">
          <MessageList messages={messages} />
        </div>
        {/* {stream &&  */}
        {/* <CardFooter className="flex flex-col gap-3  py-1 absolute bottom-1"> */}

        <div className="w-full flex flex-row relative items-center gap-2" style={{ zIndex: 99 }}>
          {isText ? (
            <InteractiveAvatarTextInput
              disabled={!stream}
              input={input}
              label="Chat"
              loading={isLoadingChat}
              placeholder="请输入你的问题"
              setInput={setInput}
              onSubmit={() => {
                handlerSendMessage();
              }}
            />
          ) : (
            <MicrophoneInput
              contentChange={(content) => {
                setInput(content);
              }}
              onSubmit={micSubmit}
            />
          )}

          {/* <Button size="sm" isIconOnly className="w-1 text-white bg-gradient-to-tr from-indigo-500 to-indigo-300"
            variant="shadow">
            <Keyboard onClick={() => swithText(!isText)} size={24} />
          </Button> */}
          <Tooltip content={!isText ? "切换键盘" : "切换录音"}>
            <Button
              // onClick={!recording ? startRecording : stopRecording}
              // isDisabled={!stream}
              isIconOnly
              className={clsx(
                "mr text-white w-1",
                !recording
                  ? "bg-gradient-to-tr from-indigo-500 to-indigo-300"
                  : "",
              )}
              size="md"
              variant="shadow"
              onClick={() => swithText(!isText)}
            >
              {!isText ? <Keyboard size={30} /> : <Microphone size={30} />}
            </Button>
          </Tooltip>
        </div>
      </div>
      {/* </CardBody> */}

      {/* </CardFooter> */}
      {/* } */}
      {/* </Card> */}
    </div >
  );
}
