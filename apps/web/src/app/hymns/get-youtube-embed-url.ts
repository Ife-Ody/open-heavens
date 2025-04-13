export const getYouTubeEmbedUrl = (url: string) => {
  try {
    const videoId = url.split("v=")?.[1]?.split("&")?.[0];
    if (!videoId) return "";
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    return "";
  }
};
