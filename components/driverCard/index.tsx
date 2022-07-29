import { Driver, Session, Theme } from "../../utils/interfaces";
import secondsToFormatted from '../../utils/secondsToFormatted';
import { Card } from '../'
import { BsChevronUp, BsChevronDown, BsDash } from 'react-icons/bs';

type Props = {
    driver: Driver | null;
    session: Session;
    theme: Theme;
}

const DriverCard = ({ driver, session, theme }: Props) => {
    if (driver === null || driver === undefined) {
        return (
            <Card title = "Driver Inspector" id = "driver-card">
                <h1 className = "font-bold text-center text-xl">Click on a Driver in the Standings</h1>
            </Card>
        )
    } else {
        // console.log(driver.raceData.lap)
        return (
            <Card title = "Driver Inspector" id = "driver-card">
                <h1 className = "font-bold text-center text-xl">
                    {theme.teamNames ? (
                        <span>{ driver.teamName }</span>
                    ) : (
                        <span>#{ driver.carNumber } { driver.name }</span>
                    )}
                </h1>
                <hr className = "m-4"/>
                <div className = "w-full">
                    <span className = "font-bold">Car: <span className = "font-normal">{ driver.class.car }</span></span><br />
                    {driver.teamName !== driver.name ? (
                        <span className = "font-bold">
                            {theme.teamNames ? (
                                <span>Driver: <span className = "font-normal"><span className={`text-center text-black p-1 rounded-md bg-white`}>#{ driver.carNumber }</span> { driver.name }</span><br /></span>
                            ) : (
                                <span>Team: <span className = "font-normal">{ driver.teamName }</span><br /></span>
                            )}
                        </span> 
                    ) : ""}
                </div>
                <div className = "flex flex-col md:flex-row">
                    <div className = "md:pr-8">
                        <span className = "font-bold">Position: <span className = "font-normal mr-2">{ driver.raceData.position }</span>
                        { driver.qualifyingResult !== null ? (
                            <span className = "text-black dark:text-white font-normal">{ (driver.qualifyingResult.position + 1 < driver.raceData.position) ? (
                                <BsChevronDown className = "text-2xl text-red-600 inline stroke-1" />
                            ) : (
                                driver.qualifyingResult.position + 1 === driver.raceData.position ? (
                                    <BsDash className = "text-2xl text-gray-500 dark:text-gray-400 inline stroke-1" />
                                ) : (
                                    <BsChevronUp className = "text-2xl text-green-500 inline stroke-1" />
                                )
                            ) } { Math.abs(driver.raceData.position - (driver.qualifyingResult.position + 1)) !== 0 ? Math.abs(driver.raceData.position - (driver.qualifyingResult.position + 1)) : "" }</span>
                        ) : "" }
                        </span><br />
                        <span className = "font-bold">Lap: <span className = "font-normal">{ driver.raceData.lap }</span></span><br />
                        <span className = "font-bold">Best Lap Time: <span className = "font-normal">{ secondsToFormatted(driver.lapTimes.best.time) } { driver.lapTimes.best.time === -1 ? "" : <span>(Lap { driver.lapTimes.best.lap })</span> }</span></span><br />
                        <span className = "font-bold">Last Lap Time: <span className = "font-normal">{ secondsToFormatted(driver.lapTimes.last) }</span></span><br />
                        <span className = "font-bold">Quick Repairs Used: <span className = "font-normal">{ driver.raceData.fastRepairsUsed } / { session.session.fastRepairs }</span></span><br />
                    </div>

                    <div className = "md:pr-8">
                        {driver.qualifyingResult !== null ? (
                            <div>
                                <span className = "font-bold">Qualified: <span className = "font-normal">{ driver.qualifyingResult.position + 1 }</span></span><br />     
                                <span className = "font-bold">Qualifying Time: <span className = "font-normal">{ secondsToFormatted(driver.qualifyingResult.fastestLap) }</span></span><br />     
                            </div>
                        ) : ""}
                        <span className = "font-bold">Gear: <span className = "font-normal">{ driver.carData.gear }</span></span><br />
                        <span className = "font-bold">RPM: <span className = "font-normal">{ driver.carData.rpm.toFixed(0) }</span></span><br />    
                        <span className="italic font-bold">{ driver.raceData.onPitRoad ? "In The Pits" : "" }</span>
                    </div>
                </div>
            </Card>
        )
    } 
}

export default DriverCard