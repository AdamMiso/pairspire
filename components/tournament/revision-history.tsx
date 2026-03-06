'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { restoreRevision } from '@/lib/tournament/actions'
import { History, RotateCcw, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Revision {
  id: number
  revisionNumber: number
  action: string
  createdAt: string
}

interface RevisionHistoryProps {
  tournamentId: string
  revisions: Revision[]
}

export function RevisionHistory({ tournamentId, revisions }: RevisionHistoryProps) {
  const router = useRouter()
  const [isRestoring, setIsRestoring] = useState<number | null>(null)

  async function handleRestore(revisionNumber: number) {
    setIsRestoring(revisionNumber)
    try {
      await restoreRevision(tournamentId, revisionNumber)
      router.refresh()
    } finally {
      setIsRestoring(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {revisions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No history yet
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {revisions.map((revision, index) => (
                <div
                  key={revision.id}
                  className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{revision.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(revision.createdAt)}
                    </p>
                  </div>
                  {index > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          disabled={isRestoring !== null}
                        >
                          {isRestoring === revision.revisionNumber ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore Revision</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will restore the tournament to the state at "{revision.action}". 
                            This action will create a new revision point.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRestore(revision.revisionNumber)}>
                            Restore
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
