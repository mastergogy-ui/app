useEffect(() => {
  const loadAds = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://mahalakshmi.onrender.com";
      const res = await fetch(`${API_URL}/api/ads?limit=20`);
      const data = await res.json();
      setAds(data.ads || []);
    } catch (err) {
      console.error("Failed to load ads", err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  loadAds();
}, []);
