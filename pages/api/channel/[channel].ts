export default async function handler (req, res) {
    let pitWallData = await fetch('https://streaming.gabirmotors.com/pitwall/channel/' + req.query.channel);
    return res.json(await pitWallData.json());
}