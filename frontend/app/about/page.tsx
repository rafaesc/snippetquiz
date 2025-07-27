import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={25}
            priority
          />
        </Link>
        
        <h1 className="text-3xl font-bold text-center sm:text-left">About LinkWrite</h1>
        
        <div className="space-y-4 text-lg">
          <p>
            LinkWrite is a platform designed to help creators share their content efficiently.
            Our mission is to provide simple yet powerful tools for content creation and distribution.
          </p>
          
          <p>
            Founded in 2023, we've been working to make content creation accessible to everyone,
            regardless of technical background or experience level.
          </p>
          
          <p>
            Our team is passionate about building tools that empower creators and help them
            connect with their audience in meaningful ways.
          </p>
        </div>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/"
          >
            Back to Home
          </Link>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/"
        >
          Home
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/about"
        >
          About
        </Link>
      </footer>
    </div>
  );
}