// export function LoadingScreen() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-white text-purple-800 dark:bg-gray-950 dark:text-gray-500">
//       Canvas Workspace is loading...
//     </div>
//   )
// }


export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-gray-950">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#6500D6]" />
      </div>

      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Canvas Workspace
        </h2>
        <p className="animate-pulse text-sm text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  )
}