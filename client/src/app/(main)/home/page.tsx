import SearchBar from "@/components/generic/search-bar";

export default function HomePage() {
  return (
    <div>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 md:hidden">
        <SearchBar />
      </div>
      <div className="flex-1 px-4">
        {/* Your page content goes here */}
      </div>
    </div>
  );
}