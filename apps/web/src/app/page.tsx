import { allPosts } from "contentlayer/generated";
import { isToday } from "date-fns";
import { Header } from "./Header";
import { PostCard } from "./PostCard";

export const generateMetadata = () => {
  const post = allPosts.find((post) => isToday(new Date(post.date)));
  return {
    title: `Open Heavens for today - ${new Date().toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    )}: ${post?.title}`,
  };
};

export default function Page(): JSX.Element {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <Header />
      <div className="flex-1">
        { <PostCard />}
      </div>
    </main>
  );
}