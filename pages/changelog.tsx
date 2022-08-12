import { useState, useEffect } from 'react';
import { Loading, SEO } from '../components';

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [theme, setTheme] = useState( {
		theme: "dark",
		backgroundImage: "https://i.gabirmotors.com/assets/other/carbon_fiber.jpg",
		backgroundColor: "#000000",
		useMetric: false
	})

    useEffect(() => {
		document.getElementById("bg").style.backgroundImage = `url(${theme.backgroundImage})`;
		document.getElementById("bg").style.backgroundColor = `${theme.backgroundColor}`;
	}, [theme])

	const Paragraph = (props) => {
		return (
			<p className = "px-6 w-full lg:w-1/2 font-semibold text-lg mt-4">
				{props.children}
			</p>
		)
	}

	return (
		<div>
			<SEO
                title="Pit Wall Changelog"
                url="changelog"
            />

			<Loading loading = { loading } />

			<div id = "bg" className = {`${theme.theme === "dark" ? "dark" : ""} background min-h-screen h-auto`}>
				{/* <Alert permaDismiss = {true} id = "no-drag" body = "Windows are no longer draggable due to it causing too many issues" /> */}

				<div className = "text-black dark:text-white flex flex-col-reverse lg:flex-row justify-center">
					<div className = "flex flex-col w-full pl-4">
						<div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.7 - The Fuel Update</h2>
                            <h3 className = "text-xl italic font-bold">August 10, 2022</h3>

                            <Paragraph>
								
							</Paragraph>
                        </div>
						<div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.6 - The Endurance Update</h2>
                            <h3 className = "text-xl italic font-bold">July 21, 2022</h3>

                            <Paragraph>
								Several new features have been added that apply to all races, but mostly apply to endurance racing, number plates are now colored based on class 
								color, as well as the driver's car being shown in the driver inspector. Team names are also supported now and shown in the driver inspector, 
								the option to toggle between team names and driver names is also available for the standings window.<br/><br/>

								<span className = "italic text-gray-300">(I also added a metric / imperial toggle)</span>
							</Paragraph>
                        </div>
						<div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.5 - Layout Overhaul</h2>
                            <h3 className = "text-xl italic font-bold">July 17, 2022</h3>

                            <Paragraph>
								I was running into so many problems with the old way I was laying out the windows, so I decided to give up and start over. The new layout is column based, meaning that the smaller the screen, the less columns are shown. This allows me to ensure that the Pit Wall looks great on more screen sizes.
							</Paragraph>
                        </div>
						<div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.4 - Qualifying Positons</h2>
                            <h3 className = "text-xl italic font-bold">July 10, 2022</h3>

                            <p></p>
                        </div>
						<div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.3 - Multi-User Support</h2>
                            <h3 className = "text-xl italic font-bold">June 30, 2022</h3>

                            <p></p>
                        </div>
						<div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.2 - New Driver Client</h2>
                            <h3 className = "text-xl italic font-bold">June 25, 2022</h3>

                            <p></p>
                        </div>

                        <div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.1 - Overlays</h2>
                            <h3 className = "text-xl italic font-bold">June 23, 2022</h3>

                            <p></p>
                        </div>
                        
                        <div className = "p-4">
                            <h2 className = "text-3xl font-bold">V1.0 - Initial Release</h2>
                            <h3 className = "text-xl italic font-bold">June 16, 2022</h3>
                        </div>
                    </div>
				</div>
			</div>
		</div>
	)
}