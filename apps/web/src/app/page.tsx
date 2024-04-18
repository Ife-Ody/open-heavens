import FontsizeSelector from "@/components/fontsize-selector";
import { SettingsDrawer } from "@/components/settings-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { DatePicker } from "@/components/ui/date-picker";
import { Post, allPosts } from "contentlayer/generated";
import { isToday } from "date-fns";
import { Mdx } from "src/components/mdx-components";

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

function PostCard(post: Post) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <h1 className="mb-1 text-4xl font-semibold">{post.title}</h1>
      <div className="">
        <p className="p-3 border-l-2 text-primary">{post.verse}</p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold uppercase">Read:</h2>
        <p className="text-primary">{post.reading}</p>
      </div>
      <Mdx post={post.body.code} />
    </div>
  );
}

const Header = () => {
  return (
    <div className="flex justify-between w-full gap-3 p-3 rounded">
      <DatePicker></DatePicker>
      <SettingsDrawer></SettingsDrawer>
      {/* on desktop the settigns should expand */}
      <div className="hidden gap-3 sm:flex">
        <FontsizeSelector sample={false}></FontsizeSelector>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default function Page(): JSX.Element {
  const post = allPosts.find((post) => isToday(new Date(post.date)));
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen gap-6 p-8 md:px-24">
      <Header />
      <div className="flex-1">
        {post && <PostCard {...post} />}
        {!post && <h1>Could not find the post for today</h1>}
      </div>
    </main>
  );
}