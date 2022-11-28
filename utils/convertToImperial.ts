/**
 * Converts from metric units to imperial units
 * @param {number} amount - the metric amount
 * @param {"L"|"C"|"M"|"KM"} unit - The unit of the measurement
 * @param {boolean} dontConvert - do or do not convert
*/
const convertToImperial = (amount: number, unit: "L" | "C" | "M" | "KM", dontConvert: boolean): [number] => {
    if (dontConvert) {
        if (isNaN(amount)) {
            return [0];
        }

        return [amount];
    }

    switch (unit) {
        case "L":
            return [(amount * 0.264172052)];
        case "C":
            return [amount * 1.8 + 32];
        case "M":
            return [amount * 2.237];
        case "KM":
            return [amount * 0.621371192];
        default:
            throw new Error(`Unknown unit: ${unit}`);
    }
}

export default convertToImperial;