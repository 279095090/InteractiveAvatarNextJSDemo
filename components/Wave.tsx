import './Wave.css'
import clsx from "clsx";

interface WaveProps{
    play:boolean
}

export default function Wave({play=false}:WaveProps) {
    return <div className ={clsx("recorder",play && "animation")}>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
    </div>
}