import { useState } from "react"
import AudioRecorder from "./AudioRecorder";

export default function(){
    const [text,setText] = useState("");

    return <div>
        <div>{text}</div>
        <AudioRecorder onSubmit={(text)=>setText(text)}/>
    </div>
}