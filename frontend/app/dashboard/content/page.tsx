import Link from "next/link";

export default function Content() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Content</h1>
        <Link 
          href="/dashboard/content/new" 
          className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Create New
        </Link>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>You haven't created any content yet.</p>
          <p className="mt-2 text-sm">Click the "Create New" button to get started!</p>
        </div>
      </div>
    </div>
  );
}