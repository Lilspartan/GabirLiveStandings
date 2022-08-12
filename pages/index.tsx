import { useState, useEffect, useRef } from 'react';
import { Button, Loading, SEO } from '../components';
import classnames from 'classnames';
import Head from 'next/head';
import { AiOutlinePlus } from 'react-icons/ai';
import { Parallax, Background } from 'react-parallax';
import { FastestLap, Driver, Session, DriverData } from '../utils/interfaces';

interface PreviewData {
  name: string,
  fuelIsPublic: boolean,
  profile_icon: string,
  fastestLap: FastestLap[],
  fastestDriver: Driver,
  drivers: Driver[],
  session: Session,
  driverData: DriverData
}

const Marker = ({ x, y, direction, children }: {x: number, y: number, direction?: "up"|"down", children:any }) => {
  const [show, setShow] = useState(false)

  return (
    <div className = {`flex ${direction === "up" ? "flex-col" : "flex-col"} absolute`} style = {{ left: `calc(${x}% - 20px)`, top: `calc(${y}% - 20px)` }}>
      <div onClick = {() => { setShow(!show) }}  className = "bg-white rounded-full w-10 h-10 grid place-content-center text-2xl cursor-pointer z-10">
        <AiOutlinePlus />
      </div>

      <div className = {`bg-white text-black p-4 m-4 transition duration-100 z-30 rounded-lg ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        { children }
      </div>
    </div>
  )
}

export default function Channels() {
	const [loading, setLoading] = useState(false);
	const [channels, setChannels] = useState([ "" ])
  const [selected, setSelected] = useState("");
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    if (selected === "" || selected === undefined) return;
    (async () => {
      setPreviewLoading(true);
      let res = await fetch('https://streaming.gabirmotors.com/pitwall/channel/' + selected.toLowerCase());
      let data = await res.json();

      if (data.error !== undefined) setPreviewData(null);
      else setPreviewData(data);

      setTimeout(() => {
        setPreviewLoading(false);
      }, 100)
    })()
  }, [selected])

  const handleScroll = () => {
    setScroll(window.scrollY);
  }

  const handleMouseMove = (e) => {
    document.getElementById("features-screenshot").style.transform = `scale(1) perspective(1000px) rotateX(${(((e.clientY - (window.innerHeight / 2)) / window.innerHeight * -5).toFixed(1))}deg) rotateY(${((e.clientX - (window.innerWidth / 2)) / window.innerWidth * 5).toFixed(1)}deg)`
    console.log(document.getElementById("features-screenshot").style.transform, e.clientX, e.clientY);
  }

	useEffect(() => {
		(async () => {
      let res = await fetch('https://streaming.gabirmotors.com/pitwall/channels');
      let data = await res.json()

      setChannels(data);
      setSelected(data[0])
      setLoading(false);
    })()

    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    }
	}, [])
  
  const imageStyles = { 
    transform: `scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)`,
  }

	return (
		<>
			<SEO />

			<Loading loading = { loading } />

			<main className="overflow-x-hidden">
        <section id="main" className="h-screen">
          <Parallax strength={500} className="h-screen" bgImageStyle = {{ height: "100vh" }}>
            <h1 className = "text-white text-7xl lg:text-9xl pt-28 acumin px-8" style = {{ zIndex: 2 }}>Welcome to the Pit Wall</h1>
            <hr className = "mx-auto w-1/2 my-8 border-2" />
            <div className = "w-screen flex flex-col lg:flex-row justify-center px-8">
              <a href="#visit" className = "cta-button m-4">Visit The Pit Wall</a>
              <a href="/download" className = "cta-button m-4" target = "_blank">Download the Pit Wall</a>
            </div>
            <Background>
              <div id = "background-gradient-top" className = "select-none" style = {{ backgroundImage: 'linear-gradient(215deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0) 100%), url("/background/1.jpg")', backgroundPosition: "center", backgroundSize: "cover" }}></div>
            </Background>
          </Parallax>
        </section>

        <section id = "features" className="bg-black background-c-not-fixed">
          <div className = "px-4 lg:px-32 pb-32 pt-16 select-none">
            <h1 className = "acumin text-7xl text-white mb-16">What Can The Pit Wall Do?</h1>
            <div className = "relative">
              <Marker x = {18.3653504} y = {50} direction = "up">
                The Standings window can give insights into the overall field, <br /> it shows flags, fastest lap, offset from qualifying positions, and more.
              </Marker>
              <Marker x = {50} y = {87}>
                The Driver Inspector can show you more information about a specific driver <br /> Click on the name of any driver in the standings and see this window fill with data.
              </Marker>
              <Marker x = {100 - 18.3653504} y = {22.5}>
                The Race Information windows show the little bits of info that might be nice to have.
              </Marker>
              <Marker x = {100 - 18.3653504} y = {75}>
                The "Track Map" shows the distances between cars, so you can see how far ahead (or behind) you are.
              </Marker>
              <img src="/pit_wall_screenshot_1.png" alt="A screenshot of the Pit Wall" className = "w-full rounded-xl" id = "features-screenshot"  style = {imageStyles}/>
            </div>
            <div className = "flex flex-row justify-center mt-4">
              <a href="/download" className = "cta-button" target = "_blank">Try it Out For Yourself</a>
            </div>
          </div>
        </section>

        <section id="visit" className="min-h-screen">
          <Parallax strength={500} className="min-h-screen" bgImageStyle = {{ height: "100vh" }}>
            <div className = "flex flex-col lg:flex-row p-16 text-white justify-around" style = {{ backgroundSize: "" }}>
              <div className = "mb-8 lg:w-1/2">
                {channels.length ? <h1 className = "text-3xl mb-4">Discover Live Channels</h1> : <h1 className = "text-3xl mb-4">No Live Channels</h1>}
                <hr className = "mb-4 lg:mx-24" />
                <ul className = "text-center max-h-96 overflow-scroll">
                  {channels.map((channel, i) => (
                    <li className = {`font-bold text-2xl cursor-pointer transition duration-200 ${channel !== selected ? "opacity-50 hover:opacity-70" : "opacity-100"}`} onClick = {() => { setSelected(channel) }}> <div className = {`transition duration-500 inline-block ${channel !== selected ? "-translate-x-8 opacity-0" : "translate-x-0 opacity-100"}`}>{">"}</div> { channel } <div className = {`transition duration-500 inline-block ${channel !== selected ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"}`}>{"<"}</div> </li>
                  ))}
                </ul>
              </div>
              <div className = "lg:w-1/2 mb-4">
                {previewLoading ? (
                  <div>
                    <h1 className = "text-3xl mb-4"></h1>
                  </div>
                ) : previewData !== null && previewData.session !== null ? (
                  <div>
                    <h1 className = "text-3xl mb-4">Preview of { selected }'s Pit Wall { previewData.profile_icon !== "none" && previewData.profile_icon !== undefined ? <img src={previewData.profile_icon} alt={`${selected}'s Twitch icon`} className = "rounded-full w-14 lg:inline-block mx-auto" /> : "" }</h1>
                    <div className = "lg:px-20">
                      <h2 className = "text-2xl"><span className = "font-semibold">Time Remaining:</span> {new Date(previewData.session.session.timeRemaining * 1000).toISOString().substr(11, 8)}</h2>
                      <h2 className = "text-2xl"><span className = "font-semibold">Track:</span> {previewData.session.track.name}, {previewData.session.track.city}, {previewData.session.track.country}</h2>
                      <h2 className = "text-2xl"><span className = "font-semibold">Car:</span> {previewData.driverData.driver !== null ? previewData.driverData.driver.class.car : "Failed to Load"}</h2>
                    </div>
                    
                    <div className = "flex flex-row justify-center">
                      <a href = {`/user/${selected}`} className = "cta-button mt-4">Enter the Pit Wall</a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className = "text-3xl mb-4">Failed to Load Preview of { selected }'s Pit Wall</h1>

                    <div className = "flex flex-row justify-center">
                      <a href = {`/user/${selected}`} className = "cta-button mt-4">Enter the Pit Wall</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Background>
              <div id = "background-gradient-top" className = "select-none" style = {{ backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0) 100%), url("/background/2.png")', backgroundPosition: "center", backgroundSize: "cover" }}></div>
            </Background>
          </Parallax>
        </section>
			</main>
		</>
	)
}