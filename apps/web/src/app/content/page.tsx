"use client"
import { isSameDay } from "date-fns";
import { Post, posts } from "src/app/content/posts";
import { useSettings } from "src/app/context/settings-context";
import { PostTemplate } from "src/app/post-template";

const page = () => {
  const settings = useSettings();
  const { date } = settings;
  const post = posts.find((post) => isSameDay(post.date, date)) as Post;
  return (
    <div className="container">
      <PostTemplate post={post}></PostTemplate>
    </div>
  );
};

export default page;
