import { Driver, Session, Theme } from "../../utils/interfaces";
import secondsToFormatted from '../../utils/secondsToFormatted';
import { Card } from '../';
import classnames from 'classnames';
import { useEffect, useState } from "react";

type Props = {
    drivers: Driver[];
    session: Session;
    highlightedDriver: Driver;
    theme: Theme;
}

const RelativeCard = ({ drivers, highlightedDriver, session, theme }: Props) => {
    const [sortedDrivers, setSortedDrivers] = useState<Driver[]>([]);
    const [indexOfHighlight, setIndexOfHighlight] = useState(0);

    useEffect(() => {
        setSortedDrivers([...drivers].sort((a, b) => {
            return b.raceData.lapPercent - a.raceData.lapPercent
        }))

        for (let i = 0; i < sortedDrivers.length; i ++) {
            if (highlightedDriver !== null && sortedDrivers[i].carIndex === highlightedDriver.carIndex) {
                setIndexOfHighlight(i);
            }
        }
    }, [ highlightedDriver, drivers ])

    if (highlightedDriver === null || highlightedDriver === undefined) {
        return (
            <Card title = "Relative" id = "relative-card">
                <h1 className = "font-bold text-center text-xl">Click on a Driver in the Standings</h1>
            </Card>
        )
    } else {
        // console.log(driver.raceData.lap)
        return (
            <Card title = "Relative" id = "relative-card">
                <table className="border-separate">
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedDrivers.map((d, i) => {
                            if (Math.abs(i - indexOfHighlight) > 3) return;

                            return (
                                <tr className={classnames([
                                    "",
                                    (d.raceData.onPitRoad ? "opacity-50" : ""),
                                ])}>
                                    <td className="px-4">{d.raceData.position}</td>
                                    <td className={`text-center text-black p-1 rounded-md`} style = {{ backgroundColor: `#${d.class.color}` }}>#{d.carNumber}</td>
                                    <td className="pl-2 py-1">
                                        {theme.teamNames ? d.teamName : d.name}
                                    </td>
                                    <td>{ secondsToFormatted(d.estTimeIntoLap - highlightedDriver.estTimeIntoLap) }</td>
                                </tr>
                            )
                        })}
                        


                    </tbody>
                </table>
            </Card>
        )
    } 
}

export default RelativeCard