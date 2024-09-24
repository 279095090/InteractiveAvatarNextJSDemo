import { Keyboard, StopCircle } from '@phosphor-icons/react';
import Wave from './Wave';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@nextui-org/react';

interface MicrophoneInputProps {
    contentChange?: (content: string) => void;
    onSubmit?: (content: string) => void;
    onStopPlay?: () => void;
}

const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition
export default function MicrophoneInput({ contentChange, onSubmit, onStopPlay }: MicrophoneInputProps) {
    const firstflag = useRef(true);
    let recognition = useRef<SpeechRecognition>();

    const [play, setPlay] = useState<boolean>(false);
    const handlerStop = () => {
        setPlay(false);
        onStopPlay && onStopPlay();
    }

    const startPlay = () => {
        if (play) return;
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.lang = 'zh';
        recognition.current.interimResults = true;
        recognition.current.maxAlternatives = 1;
        recognition.current.onresult = function (event) {
            const item = event.results[0];
            console.info('Result received: ' + item[0].transcript + ' .' + item[0].confidence);
            contentChange && contentChange(item[0].transcript);
            if (item.isFinal) {
                recognition.current?.stop();
                onSubmit && onSubmit(item[0].transcript);
            }
        }
        recognition.current.onstart = function () {
            console.log('start');
        };
        recognition.current.onend = function () {
            setPlay(false);
            console.log('end');
        }
        recognition.current.onspeechend = function () {
            recognition.current!.stop();
        }

        recognition.current.onerror = function (event) {
            console.error('Error occurred in recognition: ' + event.error);
        }
        recognition.current.start();
        setPlay(true);
    }

    return <div onClick={startPlay} className="w-full p-1 flex flex-row justify-center bg-default-100 items-center gap-4 overflow-hidden color-inherit subpixel-antialiased rounded-md bg-background/10 backdrop-blur backdrop-saturate-150">

        <Wave play={play} />
        {/* 
        <Button isIconOnly size='sm' onClick={handlerStop} className={play ? 'text-danger-300 hover:text-danger-200' : 'text-primary-300 hover:text-primary-200'} color={play ? 'danger' : 'primary'} >
            <StopCircle className='text-indigo-300 hover:text-indigo-200' size={30} />
        </Button> */}
    </div>
}