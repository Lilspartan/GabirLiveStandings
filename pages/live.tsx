import { useState, useEffect } from 'react';
import { Loading, SEO, Button } from '../components';

import { AiFillEye } from 'react-icons/ai';

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
    let output = "";
    
    let hours = Math.floor(seconds / 3600);
    output += hours + ":";
    seconds -= hours * 3600;

    let minutes = Math.floor(seconds / 60);
    output += minutes + ":";
    seconds -= minutes * 60;

    output += seconds

    return output;
  }

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [theme, setTheme] = useState( {
		theme: "dark",
		backgroundImage: "https://i.gabirmotors.com/assets/other/carbon_fiber.jpg",
		backgroundColor: "#000000",
		useMetric: false
	})

    const [channels, setChannels] = useState([
      "skiggity242",
      "pennyarcade",
      "mreggman__",
      "cluus_",
      "keyma5ter",
      "iracing",
      "wardingo37",
      "mattcribbsracing",
      "biorebek",
      "hoekeheef",
      "draxond",
      "ravenholm337",
      "red_stapler",
      "beastgp",
      "oneletter",
      "ducksoup",
      "veeveevonvore",
      "swettpants",
      "gargosthemighty"
    ])
    const [channelData, setChannelData] = useState([]);
    const [iracingChannelData, setIracingChannelData] = useState([]);
    const [pitwallChannels, setPitwallChannels] = useState([]);

    useEffect(() => {
		document.getElementById("bg").style.backgroundImage = `url(${theme.backgroundImage})`;
		document.getElementById("bg").style.backgroundColor = `${theme.backgroundColor}`;
	}, [theme])

    useEffect(() => {
        (async () => {
            const p_res = await fetch("https://streaming.gabirmotors.com/pitwall/channels");
            const p_data = await p_res.json();

            setPitwallChannels(p_data.data || []);

            let userIds = "";
            for (let i = 0; i < channels.length; i ++) {
                userIds += "user_login=" + channels[i] + "&";
            }
            
            const res = await fetch("https://api.twitch.tv/helix/streams?" + userIds, {
                headers: {
                    'Client-ID': 'v354nab7jsgctl2zww4ic69tc4l3hf',
                    'Authorization': 'Bearer y6xe4ery875beb62qv3s9l1v574zv2'
                }
            });
            const data = await res.json();

            // game_name = "iracing";
            let _tempData = [ ...data.data ];
            let _tempIracing = [];

            for (let i = 0; i < _tempData.length; i ++) {
              if (_tempData[i].game_name.toLowerCase() === "iracing") {
                _tempIracing.push(_tempData[i]);
              }
            }

            setChannelData(_tempData);
            setIracingChannelData(_tempIracing);
            console.log(channelData);
        })()
    }, [ channels ])
    
	return (
		<div>
			<SEO
        title="Pit Wall TV"
        url="live"
      />

			<Loading loading = { loading } />

			<div id = "bg" className = {`${theme.theme === "dark" ? "dark" : ""} background min-h-screen h-auto`}>
				<div className = "text-black dark:text-white flex flex-col justify-center">
            <h1 className = "acumin font-bold text-5xl block text-center">Pit Wall TV</h1>
              <div className = "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {/* <pre>{JSON.stringify(pitwallChannels, null , 4)}</pre> */}
                { channelData.map(channel => {
                    return (
                        <a href={"https://twitch.tv/" + channel.user_name} target = "_new">
                            <div className = "m-4 bg-dark-card-body p-6 rounded-md flex flex-col hover:bg-dark-card-handle transition duration-200">
                                <img src={"https://static-cdn.jtvnw.net/previews-ttv/live_user_" + channel.user_login + "-1920x1080.jpg"} alt="Stream Preview" />

                                <span className = "text-left font-bold p-2">{ channel.title }</span>

                                <div className="flex flex-row gap-2 justify-between">
                                    <span>{ channel.user_name }</span>
                                    <span className = "opacity-70 italic">{ timeSince(new Date(channel.started_at)) }</span>
                                    <span className = "text-red-500"><AiFillEye className = "inline-block"/>{ channel.viewer_count }</span>
                                </div>

                                { pitwallChannels.some(p_channel => { return p_channel === channel.user_name }) ? (
                                  <Button block link = {`/user/${channel.user_name}`}>Visit Pit Wall</Button>
                                ) : "" }
                                {/* <pre>{JSON.stringify(channel, null, 4)}</pre> */}
                            </div>
                        </a>
                    )
                }) }
            </div>
        </div>
			</div>
		</div>
	)
}