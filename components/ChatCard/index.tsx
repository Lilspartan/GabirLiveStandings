import { useState, useEffect } from 'react';
import { MdDragIndicator, MdFirstPage } from 'react-icons/md';
import { StreamCard } from '../';

const ChatCard = (props) => {
    const [open, setOpen] = useState(true);
    const [location, setLocation] = useState("pitwall.gabirmotors.com");

    const [width, setWidth] = useState(200);
    const [moving, setMoving] = useState(false);
    const [popoutChat, setPopoutChat] = useState(false);

    useEffect(() => {
        const element = document.getElementById("handle");
        const bg = document.getElementById("bg");
        const chat = document.getElementById("chat");

        setLocation(window.location.hostname);
        setWidth(window.innerWidth / 5);

        let downListener = () => {
            setMoving(true);
        }

        element.addEventListener('mousedown', downListener)

        return () => {
            // release memory
            element.removeEventListener('mousedown', downListener)
        }
    }, [])

    useEffect(() => {
        console.log("moving")
        const element = document.getElementById("handle");
        const bg = document.getElementById("bg");
        const chat = document.getElementById("chat");

        let upListener = (e) => {
            setMoving(false);
        }

        let moveListener = (e) => {
            if (moving) {
                setWidth(window.innerWidth - e.clientX)
            }
        }

        element.addEventListener('mouseup', upListener)
        bg.addEventListener('mouseup', upListener)
        chat.addEventListener('mouseup', upListener)
        element.addEventListener('mousemove', moveListener)
        bg.addEventListener('mousemove', moveListener)
        chat.addEventListener('mousemove', moveListener)
    
        return () => {
            element.removeEventListener('mouseup', upListener)
            chat.removeEventListener('mouseup', upListener)
            bg.removeEventListener('mouseup', upListener)
            element.removeEventListener('mousemove', moveListener)
            chat.removeEventListener('mousemove', moveListener)
            bg.removeEventListener('mousemove', moveListener)
        }
    }, [moving])
    
    useEffect(() => {
        if (width <= 100 && !moving) {
            setWidth(20);
        }

        // props.setLeftSideWidth(window.innerWidth - width);
    }, [width, moving])

    useEffect(() => {
        if (props.channel === "") {
            setWidth(20);
        } else {
            setWidth(window.innerWidth / 5);
        }
    }, [props.channel])

    return (
        <div className = {`transition duration-250 ${props.show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div id = "" className = "fixed h-screen right-0 z-40 shadow-2xl flex flex-row" style={{width: width + 'px'}}>
                <div className = "bg-light-card dark:bg-dark-card px-0 text-black dark:text-white flex flex-col justify-center select-none">
                    {!popoutChat ? <MdFirstPage  className = "text-2xl cursor-pointer absolute top-28" onClick={() => { setPopoutChat(true) }} /> : <div></div>}
                    <MdDragIndicator id = "handle" className = "text-2xl cursor-col-resize" />
                </div>
                <div id="chat">
                    {!popoutChat ? <iframe src={`https://player.twitch.tv/?channel=${props.channel}&parent=${location}`} className = "h-1/4" allowFullScreen = {true} frameBorder="0" scrolling="no" width="100%"></iframe> : <div></div>}
                    <iframe 
                            src={`https://www.twitch.tv/embed/${props.channel}/chat?${props.theme === "dark" ? "darkpopout&" : ""}parent=${location}`}
                            height="100%"
                            width={width}
                            className = {`${moving ? "pointer-events-none" : ""} ${popoutChat ? "" : "h-3/4"}`}>
                    </iframe>
                </div>
            </div>

            {popoutChat ? <StreamCard channel = {props.channel} closeWindow = {setPopoutChat} /> : <div></div>}
        </div>
    )    
}

export default ChatCard;