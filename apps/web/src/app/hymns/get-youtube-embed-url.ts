export const getYouTubeEmbedUrl = (url: string) => {
  try {
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    return "";
  }
};
