export default async function handler (req, res) {
    res.status(200).json({ version: '1.9' });
}