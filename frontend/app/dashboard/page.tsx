useEffect(() => {
  if (token) {
    loadUserAds();
  }
}, [token]);

const loadUserAds = async () => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
    const res = await fetch(`${API_URL}/api/ads/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setMyAds(data);
  } catch (err) {
    console.error("Failed to load user ads", err);
  }
};
