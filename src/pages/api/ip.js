// pages/api/ip.js

export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    res.status(200).json({ ip: data.ip });
  } catch (error) {
    console.error("Error fetching IP:", error);
    res.status(500).json({ error: "Failed to fetch IP" });
  }
}
