import { Post, allPosts } from "contentlayer/generated";
import { compareDesc, format, parseISO } from "date-fns";
import Link from "next/link";
import { BackgroundGradient } from "src/components/background-gradient";
import { Mdx } from "src/components/mdx-components";

function PostCard(post: Post) {
  return (
    <div className="mb-8">
      <h2 className="mb-1 text-xl">
        <Link
          href={post.slug}
          className="text-blue-700 hover:text-blue-900 dark:text-blue-400"
        >
          {post.title}
        </Link>
      </h2>
      <time dateTime={post.date} className="mb-2 block text-xs text-gray-600">
        {format(parseISO(post.date), "LLLL d, yyyy")}
      </time>
      <Mdx post={post.body.code} />
    </div>
  );
}

function Gradient({
  conic,
  className,
  small,
}: {
  small?: boolean;
  conic?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={`absolute mix-blend-normal will-change-[filter] rounded-[100%] ${
        small ? "blur-[32px]" : "blur-[75px]"
      } ${conic ? "bg-glow-conic" : ""} ${className}`}
    />
  );
}

export default function Page(): JSX.Element {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date)),
  );
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 md:p-24 gap-6">
      <h1 className="text-3xl">Open Heavens Reader</h1>
      <div className="relative">
        <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900 flex flex-col gap-3">
          <Gradient />
          <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 text-center sm:text-left">
            A simple reader for the Open Heavens devotional
          </p>
          <p className=" text-neutral-600 dark:text-neutral-400 text-balance leading-relaxed text-center sm:text-left">
            Is it possible to have a simplified reader for the RCCG Open Heavens
            devotional? Something that is comfortable and easy to read where you
            won't need to strain your eyes. A similar reading experience to the{" "}
            <a
              className="dark:text-amber-600"
              target="_"
              href="https://bible.com"
            >
              bible app
            </a>
            . <span className="uppercase font-medium">WITHOUT THE ADS</span>
          </p>
          <div className="w-full">
            <button className="rounded-full mx-auto sm:m-0 uppercase px-3 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>Coming Soon</span>
            </button>
          </div>
        </BackgroundGradient>
      </div>
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </main>
  );
}
