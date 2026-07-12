import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useMyNote, useSaveMyNote } from './api'

export function NotePage() {
  const navigate = useNavigate()
  const { data: content, isLoading } = useMyNote()
  const saveNote = useSaveMyNote()
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (content !== undefined) setDraft(content)
  }, [content])

  if (isLoading) return <LoadingScreen />

  const handleSave = async () => {
    try {
      await saveNote.mutateAsync(draft)
      toast.success('Note saved.')
    } catch {
      toast.error('Could not save note. Try again.')
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Note</h1>
      </div>

      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={12}
        placeholder="Jot anything down — only you can see this."
        className="min-h-[300px] flex-1 rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-canvas-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
      />

      <Button fullWidth loading={saveNote.isPending} onClick={handleSave}>
        Save Note
      </Button>
    </div>
  )
}
